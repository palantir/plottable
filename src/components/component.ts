/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Point, SpaceRequest, Bounds, SimpleSelection } from "../core/interfaces";
import * as RenderController from "../core/renderController";
import * as Utils from "../utils";

import { ComponentContainer } from "./componentContainer";
import { coerceExternalD3 } from "../utils/coerceD3";

export type ComponentCallback = (component: Component) => void;

export type IResizeHandler = (size: { height: number, width: number }) => void;

/**
 * Components are the core logical units that build Plottable visualizations.
 *
 * This class deals with Component lifecycle (anchoring, getting a size, and rendering
 * infrastructure), as well as building the framework of DOM elements for all Components.
 */
export class Component {
  /**
   * Holds all the DOM associated with this component. A direct child of the element we're
   * anchored to.
   */
  private _element: d3.Selection<HTMLElement, any, any, any>;
  /**
   * Container for the visual content that this Component displays. Subclasses should attach
   * elements onto the _content. Located in between the background and the foreground.
   */
  private _content: SimpleSelection<void>;
  /**
   * Used by axes to hide cut off axis labels.
   */
  protected _boundingBox: SimpleSelection<void>;
  /**
   * Place more objects just behind this Component's Content by appending them to the _backgroundContainer.
   */
  private _backgroundContainer: SimpleSelection<void>;
  /**
   * Place more objects just in front of this Component's Content by appending them to the _foregroundContainer.
   */
  private _foregroundContainer: SimpleSelection<void>;
  /**
   * The clip path will prevent content from overflowing its Component space.
   *
   * TODO decide if this is still needed in an HTML world
   */
  protected _clipPathEnabled = false;
  private _resizeHandler: IResizeHandler;
  private _origin: Point = { x: 0, y: 0 };

  /**
   * The ComponentContainer that holds this Component in its children, or null, if this
   * Component is top-level.
   */
  private _parent: ComponentContainer;
  private _xAlignment: string = "left";
  private static _xAlignToProportion: { [alignment: string]: number } = {
    "left": 0,
    "center": 0.5,
    "right": 1,
  };
  private _yAlignment: string = "top";
  private static _yAlignToProportion: { [alignment: string]: number } = {
    "top": 0,
    "center": 0.5,
    "bottom": 1,
  };
  protected _isSetup = false;
  protected _isAnchored = false;

  /**
   * List of "boxes"; SVGComponent has a "box" API that lets subclasses add boxes
   * with "addBox". Three boxes are added:
   *
   * .clip-rect - the clipPath rect, (basically overflow: hidden)
   * .background-fill - for the background container (unclear what it's use is)
   * .bounding-box - this._boundingBox
   *
   * boxes get their width/height attributes updated in computeLayout.
   *
   * I think this API is to make an idea of a "100% width/height" box that could be
   * useful in a variety of situations. But enumerating the three usages of it, it
   * doesn't look like it's being used very much.
   *
   * TODO possily remove in HTML world
   */
  private _boxes: SimpleSelection<void>[] = [];
  /**
   * Element containing all the boxes.
   */
  private _boxContainer: SimpleSelection<void>;
  /**
   * If we're the root Component (top-level), this is the HTMLElement we've anchored to (user-supplied).
   */
  private _rootElement: d3.Selection<HTMLElement, any, any, any>;
  /**
   * width of the Component as computed in computeLayout. Used to size the hitbox, bounding box, etc
   */
  private _width: number;
  /**
   * height of the Component as computed in computeLayout. Used to size the hitbox, bounding box, etc
   */
  private _height: number;
  private _cssClasses = new Utils.Set<string>();
  /**
   * If .destroy() has been called on this Component.
   */
  private _destroyed = false;
  /**
   * internal clip path id of the clipPath, if it's being used
   */
  private _clipPathID: string;
  private _onAnchorCallbacks = new Utils.CallbackSet<ComponentCallback>();
  private _onDetachCallbacks = new Utils.CallbackSet<ComponentCallback>();

  public constructor() {
    this._cssClasses.add("component");
  }

  /**
   * Attaches the Component as a child of a given d3 Selection.
   *
   * @param {d3.Selection} selection.
   * @returns {Component} The calling Component.
   */
  public anchor(selection: d3.Selection<HTMLElement, any, any, any>) {
    selection = coerceExternalD3(selection);
    if (this._destroyed) {
      throw new Error("Can't reuse destroy()-ed Components!");
    }

    if (this.parent() == null) {
      this._rootElement = selection;
      // rootElement gets the "plottable" CSS class
      this._rootElement.classed("plottable", true);
    }

    if (this._element != null) {
      // reattach existing element
      (<Node> selection.node()).appendChild(<Node> this._element.node());
    } else {
      this._element = selection.append<HTMLDivElement>("div");
      this._setup();
    }

    this._isAnchored = true;
    this._onAnchorCallbacks.callCallbacks(this);
    return this;
  }

  /**
   * Adds a callback to be called on anchoring the Component to the DOM.
   * If the Component is already anchored, the callback is called immediately.
   *
   * @param {ComponentCallback} callback
   * @return {Component}
   */
  public onAnchor(callback: ComponentCallback) {
    if (this._isAnchored) {
      callback(this);
    }
    this._onAnchorCallbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback that would be called on anchoring the Component to the DOM.
   * The callback is identified by reference equality.
   *
   * @param {ComponentCallback} callback
   * @return {Component}
   */
  public offAnchor(callback: ComponentCallback) {
    this._onAnchorCallbacks.delete(callback);
    return this;
  }

  /**
   * Creates additional elements as necessary for the Component to function.
   * Called during anchor() if the Component's element has not been created yet.
   * Override in subclasses to provide additional functionality.
   */
  protected _setup() {
    if (this._isSetup) {
      return;
    }
    this._cssClasses.forEach((cssClass: string) => {
      this._element.classed(cssClass, true);
    });
    this._cssClasses = new Utils.Set<string>();

    this._backgroundContainer = this._element.append("svg").classed("background-container", true);
    this._addBox("background-fill", this._backgroundContainer);
    this._content = this._element.append("svg").classed("content", true);
    this._foregroundContainer = this._element.append("svg").classed("foreground-container", true);
    this._boxContainer = this._element.append("svg").classed("box-container", true);

    if (this._clipPathEnabled) {
      this._generateClipPath();
    }

    this._boundingBox = this._addBox("bounding-box");

    this._isSetup = true;
  }

  /**
   * Given available space in pixels, returns the minimum width and height this Component will need.
   *
   * @param {number} availableWidth
   * @param {number} availableHeight
   * @returns {SpaceRequest}
   */
  public requestedSpace(availableWidth: number, availableHeight: number): SpaceRequest {
    return {
      minWidth: 0,
      minHeight: 0,
    };
  }

  /**
   * Computes and sets the size, position, and alignment of the Component from the specified values.
   * If no parameters are supplied and the Component is a root node,
   * they are inferred from the size of the Component's element.
   *
   * @param {Point} [origin] Origin of the space offered to the Component.
   * @param {number} [availableWidth] Available width in pixels.
   * @param {number} [availableHeight] Available height in pixels.
   * @returns {Component} The calling Component.
   */
  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    if (origin == null || availableWidth == null || availableHeight == null) {
      if (this._element == null) {
        throw new Error("anchor() must be called before computeLayout()");
      } else if (this._rootElement != null) {
        // we are the top-level Component, retrieve height/width from rootElement
        origin = { x: 0, y: 0 };
        const elem = this._rootElement.node();
        availableWidth = Utils.DOM.elementWidth(elem);
        availableHeight = Utils.DOM.elementHeight(elem);
      } else {
        throw new Error("null arguments cannot be passed to computeLayout() on a non-root node");
      }
    }

    let size = this._sizeFromOffer(availableWidth, availableHeight);
    this._width = size.width;
    this._height = size.height;

    let xAlignProportion = Component._xAlignToProportion[this._xAlignment];
    let yAlignProportion = Component._yAlignToProportion[this._yAlignment];
    this._origin = {
      x: origin.x + (availableWidth - this.width()) * xAlignProportion,
      y: origin.y + (availableHeight - this.height()) * yAlignProportion,
    };
    this._element.styles({
      left: `${this._origin.x}px`,
      height: `${this.height()}px`,
      top: `${this._origin.y}px`,
      width: `${this.width()}px`,
    });
    this._boxes.forEach((b: SimpleSelection<void>) => b.attr("width", this.width()).attr("height", this.height()));

    if (this._resizeHandler != null) {
      this._resizeHandler(size);
    }

    return this;
  }

  protected _sizeFromOffer(availableWidth: number, availableHeight: number) {
    let requestedSpace = this.requestedSpace(availableWidth, availableHeight);
    return {
      width: this.fixedWidth() ? Math.min(availableWidth, requestedSpace.minWidth) : availableWidth,
      height: this.fixedHeight() ? Math.min(availableHeight, requestedSpace.minHeight) : availableHeight,
    };
  }

  /**
   * Queues the Component for rendering.
   *
   * @returns {Component} The calling Component.
   */
  public render() {
    if (this._isAnchored && this._isSetup && this.width() >= 0 && this.height() >= 0) {
      RenderController.registerToRender(this);
    }
    return this;
  }

  private _scheduleComputeLayout() {
    if (this._isAnchored && this._isSetup) {
      RenderController.registerToComputeLayoutAndRender(this);
    }
  }

  /**
   * Sets a callback that gets called when the component resizes. The size change
   * is not guaranteed to be reflected by the DOM at the time the callback is fired.
   *
   * @param {IResizeHandler} [resizeHandler] Callback to be called when component resizes
   */
  public onResize(resizeHandler: IResizeHandler) {
    this._resizeHandler = resizeHandler;
    return this;
  }

  /**
   * Renders the Component without waiting for the next frame. This method is a no-op on
   * Component, Table, and Group; render them immediately with .renderTo() instead.
   */
  public renderImmediately() {
    if (this._clipPathEnabled) {
      this._updateClipPath();
    }
    return this;
  }

  /**
   * Causes the Component to re-layout and render.
   *
   * @returns {Component} The calling Component.
   */
  public redraw() {
    if (this._isAnchored && this._isSetup) {
      if (this.parent() == null) {
        this._scheduleComputeLayout();
      } else {
        this.parent().redraw();
      }
    }
    return this;
  }

  /**
   * Tell this component to invalidate any caching. This function should be
   * called when a CSS change has occurred that could influence the layout
   * of the Component, such as changing the font size.
   *
   * Subclasses should override.
   */
  public invalidateCache() {
    // Core component has no caching.
  }

  /**
   * Renders the Component to a given HTML Element.
   *
   * @param {String|d3.Selection} element The element, a selector string for the element, or a d3.Selection for the element.
   * @returns {Component} The calling Component.
   */
  public renderTo(element: string | HTMLElement | d3.Selection<HTMLElement, any, any, any>): this {
    this.detach();
    if (element != null) {
      let selection: d3.Selection<HTMLElement, any, any, any>;
      if (typeof(element) === "string") {
        selection = d3.select<HTMLElement, any>(element);
      } else if (element instanceof Element) {
        selection = d3.select<HTMLElement, any>(element);
      } else {
        selection = coerceExternalD3(element);
      }
      if (!selection.node() || selection.node().nodeName == null) {
        throw new Error("Plottable requires a valid Element to renderTo");
      }
      if (selection.node().nodeName === "svg") {
        throw new Error("Plottable 3.x can only renderTo an HTML component; pass a div instead!");
      }
      this.anchor(selection);
    }
    if (this._element == null) {
      throw new Error("If a Component has never been rendered before, then renderTo must be given a node to render to, " +
        "or a d3.Selection, or a selector string");
    }
    RenderController.registerToComputeLayoutAndRender(this);
    // flush so that consumers can immediately attach to stuff we create in the DOM
    RenderController.flush();
    return this;
  }

  /**
   * Gets the x alignment of the Component.
   */
  public xAlignment(): string;
  /**
   * Sets the x alignment of the Component.
   *
   * @param {string} xAlignment The x alignment of the Component ("left"/"center"/"right").
   * @returns {Component} The calling Component.
   */
  public xAlignment(xAlignment: string): this;
  public xAlignment(xAlignment?: string): any {
    if (xAlignment == null) {
      return this._xAlignment;
    }

    xAlignment = xAlignment.toLowerCase();
    if (Component._xAlignToProportion[xAlignment] == null) {
      throw new Error("Unsupported alignment: " + xAlignment);
    }
    this._xAlignment = xAlignment;
    this.redraw();
    return this;
  }

  /**
   * Gets the y alignment of the Component.
   */
  public yAlignment(): string;
  /**
   * Sets the y alignment of the Component.
   *
   * @param {string} yAlignment The y alignment of the Component ("top"/"center"/"bottom").
   * @returns {Component} The calling Component.
   */
  public yAlignment(yAlignment: string): this;
  public yAlignment(yAlignment?: string): any {
    if (yAlignment == null) {
      return this._yAlignment;
    }

    yAlignment = yAlignment.toLowerCase();
    if (Component._yAlignToProportion[yAlignment] == null) {
      throw new Error("Unsupported alignment: " + yAlignment);
    }
    this._yAlignment = yAlignment;
    this.redraw();
    return this;
  }

  private _addBox(className?: string, parentElement?: SimpleSelection<void>) {
    if (this._element == null) {
      throw new Error("Adding boxes before anchoring is currently disallowed");
    }
    parentElement = parentElement == null ? this._boxContainer : parentElement;
    let box = parentElement.append("rect");
    if (className != null) {
      box.classed(className, true);
    }
    box.attr("stroke-width", "0");

    this._boxes.push(box);
    if (this.width() != null && this.height() != null) {
      box.attr("width", this.width()).attr("height", this.height());
    }
    return box;
  }

  private _generateClipPath() {
    // The clip path will prevent content from overflowing its Component space.
    this._clipPathID = Utils.DOM.generateUniqueClipPathId();
    let clipPathParent = this._boxContainer.append("clipPath").attr("id", this._clipPathID);
    this._addBox("clip-rect", clipPathParent);
    this._updateClipPath();
  }

  private _updateClipPath() {
    // HACKHACK: IE <= 9 does not respect the HTML base element in SVG.
    // They don't need the current URL in the clip path reference.
    let prefix = /MSIE [5-9]/.test(navigator.userAgent) ? "" : document.location.href;
    prefix = prefix.split("#")[0]; // To fix cases where an anchor tag was used
    this._element.attr("clip-path", "url(\"" + prefix + "#" + this._clipPathID + "\")");
  }

  /**
   * Checks if the Component has a given CSS class.
   *
   * @param {string} cssClass The CSS class to check for.
   */
  public hasClass(cssClass: string) {
    if (cssClass == null) {
      return false;
    }

    if (this._element == null) {
      return this._cssClasses.has(cssClass);
    } else {
      return this._element.classed(cssClass);
    }
  }

  /**
   * Adds a given CSS class to the Component.
   *
   * @param {string} cssClass The CSS class to add.
   * @returns {Component} The calling Component.
   */
  public addClass(cssClass: string) {
    if (cssClass == null) {
      return this;
    }

    if (this._element == null) {
      this._cssClasses.add(cssClass);
    } else {
      this._element.classed(cssClass, true);
    }

    return this;
  }

  /**
   * Removes a given CSS class from the Component.
   *
   * @param {string} cssClass The CSS class to remove.
   * @returns {Component} The calling Component.
   */
  public removeClass(cssClass: string) {
    if (cssClass == null) {
      return this;
    }

    if (this._element == null) {
      this._cssClasses.delete(cssClass);
    } else {
      this._element.classed(cssClass, false);
    }

    return this;
  }

  /**
   * Checks if the Component has a fixed width or if it grows to fill available space.
   * Returns false by default on the base Component class.
   */
  public fixedWidth() {
    return false;
  }

  /**
   * Checks if the Component has a fixed height or if it grows to fill available space.
   * Returns false by default on the base Component class.
   */
  public fixedHeight() {
    return false;
  }

  /**
   * Detaches a Component from the DOM. The Component can be reused.
   *
   * This should only be used if you plan on reusing the calling Component. Otherwise, use destroy().
   *
   * @returns The calling Component.
   */
  public detach() {
    this.parent(null);

    if (this._isAnchored) {
      this._element.remove();
    }
    this._isAnchored = false;
    this._onDetachCallbacks.callCallbacks(this);

    return this;
  }

  /**
   * Adds a callback to be called when the Component is detach()-ed.
   *
   * @param {ComponentCallback} callback
   * @return {Component} The calling Component.
   */
  public onDetach(callback: ComponentCallback) {
    this._onDetachCallbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback to be called when the Component is detach()-ed.
   * The callback is identified by reference equality.
   *
   * @param {ComponentCallback} callback
   * @return {Component} The calling Component.
   */
  public offDetach(callback: ComponentCallback) {
    this._onDetachCallbacks.delete(callback);
    return this;
  }

  /**
   * Gets the parent ComponentContainer for this Component.
   */
  public parent(): ComponentContainer;
  /**
   * Sets the parent ComponentContainer for this Component.
   * An error will be thrown if the parent does not contain this Component.
   * Adding a Component to a ComponentContainer should be done
   * using the appropriate method on the ComponentContainer.
   */
  public parent(parent: ComponentContainer): this;
  public parent(parent?: ComponentContainer): any {
    if (parent === undefined) {
      return this._parent;
    }
    if (parent !== null && !parent.has(this)) {
      throw new Error("Passed invalid parent");
    }
    this._parent = parent;
    return this;
  }

  /**
   * @returns {Bounds} for the component in pixel space, where the topLeft
   * represents the component's minimum x and y values and the bottomRight represents
   * the component's maximum x and y values.
   */
  public bounds(): Bounds {
    const topLeft = this.origin();

    return {
      topLeft,
      bottomRight: {
        x: topLeft.x + this.width(),
        y: topLeft.y + this.height()
      },
    }
  }

  /**
   * Removes a Component from the DOM and disconnects all listeners.
   */
  public destroy() {
    this._destroyed = true;
    this.detach();
  }

  /**
   * Gets the width of the Component in pixels.
   */
  public width(): number {
    return this._width;
  }

  /**
   * Gets the height of the Component in pixels.
   */
  public height(): number {
    return this._height;
  }

  /**
   * Gets the origin of the Component relative to its parent.
   *
   * @return {Point}
   */
  public origin(): Point {
    return {
      x: this._origin.x,
      y: this._origin.y,
    };
  }

  /**
   * Gets the origin of the Component relative to the root Component.
   *
   * @return {Point}
   */
  public originToRoot(): Point {
    let origin = this.origin();
    let ancestor = this.parent();
    while (ancestor != null) {
      let ancestorOrigin = ancestor.origin();
      origin.x += ancestorOrigin.x;
      origin.y += ancestorOrigin.y;
      ancestor = ancestor.parent();
    }
    return origin;
  }

  /**
   * Gets the root component of the hierarchy. If the provided
   * component is the root, that component will be returned.
   */
  public root(): Component {
    let parent: Component = this;

    while (parent.parent() != null) {
      parent = parent.parent();
    }

    return parent;
  }

  /**
   * Gets the Selection containing the <g> in front of the visual elements of the Component.
   *
   * Will return undefined if the Component has not been anchored.
   *
   * @return {d3.Selection}
   */
  public foreground(): SimpleSelection<void> {
    return this._foregroundContainer;
  }

  /**
   * Gets the SVG that holds the visual elements of the Component.
   *
   * Will return undefined if the Component has not been anchored.
   *
   * @return {d3.Selection} content selection for the Component
   */
  public content(): SimpleSelection<void> {
    return this._content;
  }

  /**
   * Returns the HTML Element at the root of this component's DOM tree.
   */
  public element(): d3.Selection<HTMLElement, any, any, any> {
    return this._element;
  }

  /**
   * Returns the top-level user supplied element that roots the tree that this Component lives in.
   * @returns {SimpleSelection<void>}
   */
  public rootElement(): SimpleSelection<void> {
    return this.root()._rootElement;
  }

  /**
   * Gets the Selection containing the <g> behind the visual elements of the Component.
   *
   * Will return undefined if the Component has not been anchored.
   *
   * @return {d3.Selection} background selection for the Component
   */
  public background(): SimpleSelection<void> {
    return this._backgroundContainer;
  }
}
