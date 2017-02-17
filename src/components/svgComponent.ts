/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { AbstractComponent, IComponent } from "./abstractComponent";
import { Point, SpaceRequest, Bounds } from "../core/interfaces";
import * as RenderController from "../core/renderController";
import * as Utils from "../utils";

// HACKHACK replace with GenericComponentCallback in 3.0
export type ComponentCallback = (component: SVGComponent) => void;

export class SVGComponent extends AbstractComponent<d3.Selection<void>> {
  protected _boundingBox: d3.Selection<void>;
  private _backgroundContainer: d3.Selection<void>;
  private _foregroundContainer: d3.Selection<void>;
  protected _clipPathEnabled = false;

  private _boxes: d3.Selection<void>[] = [];
  private _boxContainer: d3.Selection<void>;
  private _rootSVG: d3.Selection<void>;
  private _isTopLevelSVG = false;
  private _clipPathID: string;
  private static _SAFARI_EVENT_BACKING_CLASS = "safari-event-backing";

  public constructor() {
    super();
    this._cssClasses.add("component");
  }

  /**
   * Attaches the Component as a child of a given d3 Selection.
   *
   * @param {d3.Selection} selection.
   * @returns {Component} The calling Component.
   */
  public anchor(selection: d3.Selection<void>) {
    if (this._destroyed) {
      throw new Error("Can't reuse destroy()-ed Components!");
    }

    this._isTopLevelSVG = (<Node> selection.node()).nodeName.toLowerCase() === "svg";

    if (this._isTopLevelSVG) {
      this._rootSVG = selection;
      // visible overflow for firefox https://stackoverflow.com/questions/5926986/why-does-firefox-appear-to-truncate-embedded-svgs
      this._rootSVG.style("overflow", "visible");

      // HACKHACK: Safari fails to register events on the <svg> itself
      const safariBacking = this._rootSVG.select(`.${SVGComponent._SAFARI_EVENT_BACKING_CLASS}`);
      if (safariBacking.empty()) {
        this._rootSVG.append("rect").classed(SVGComponent._SAFARI_EVENT_BACKING_CLASS, true).attr({
          x: 0,
          y: 0,
          width: "100%",
          height: "100%",
        }).style("opacity", 0);
      }
    }

    if (this._isTopLevelSVG && !this.isNestedTopLevelSVG()) {
      // non-nested top-level svg node gets the "plottable" CSS class
      this._rootSVG.classed("plottable", true);
    }

    if (this._element != null) {
      // reattach existing element
      (<Node> selection.node()).appendChild(<Node> this._element.node());
    } else {
      this._element = selection.append("g");
      this._setup();
    }

    this._isAnchored = true;
    this._onAnchorCallbacks.callCallbacks(this);
    return this;
  }

  public anchorHTML(selection: HTMLElement) {
    const root = d3.select(selection).append("svg");
    return this.anchor(root);
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
    if (this._isTopLevelSVG && this.parent() != null) {
      // this component is a top level SVG; however, it has parents
      // which means that it is nested within a div container
      this._rootSVG.classed("component", true);
    }

    this._cssClasses.forEach((cssClass: string) => {
      this._element.classed(cssClass, true);
    });

    this._cssClasses = new Utils.Set<string>();

    this._backgroundContainer = this._element.append("g").classed("background-container", true);
    this._addBox("background-fill", this._backgroundContainer);
    this._content = this._element.append("g").classed("content", true);
    this._foregroundContainer = this._element.append("g").classed("foreground-container", true);
    this._boxContainer = this._element.append("g").classed("box-container", true);

    if (this._clipPathEnabled) {
      this._generateClipPath();
    }

    this._boundingBox = this._addBox("bounding-box");
    this._isSetup = true;
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
      } else if (this._isTopLevelSVG && this.parent() == null) {
        // we are the root node, retrieve height/width from root SVG
        origin = { x: 0, y: 0 };

        // Set width/height to 100% if not specified, to allow accurate size calculation
        // see http://www.w3.org/TR/CSS21/visudet.html#block-replaced-width
        // and http://www.w3.org/TR/CSS21/visudet.html#inline-replaced-height
        if (this._rootSVG.attr("width") == null) {
          this._rootSVG.attr("width", "100%");
        }
        if (this._rootSVG.attr("height") == null) {
          this._rootSVG.attr("height", "100%");
        }

        let elem: HTMLScriptElement = (<HTMLScriptElement> this._rootSVG.node());
        availableWidth = Utils.DOM.elementWidth(elem);
        availableHeight = Utils.DOM.elementHeight(elem);
      } else {
        throw new Error("null arguments cannot be passed to computeLayout() on a non-root node");
      }
    }

    let size = this._sizeFromOffer(availableWidth, availableHeight);
    this._width = size.width;
    this._height = size.height;

    let xAlignProportion = SVGComponent._xAlignToProportion[this._xAlignment];
    let yAlignProportion = SVGComponent._yAlignToProportion[this._yAlignment];
    this._origin = {
      x: origin.x + (availableWidth - this.width()) * xAlignProportion,
      y: origin.y + (availableHeight - this.height()) * yAlignProportion,
    };

    if (this.isNestedTopLevelSVG()) {
      // this is a top-level SVG nested within an HTML layout. Apply the styles
      // directly to the root SVG rather than to the g element
      this._rootSVG.style({
        height: `${this.height()}px`,
        left: `${this._origin.x}px`,
        top: `${this._origin.y}px`,
        width: `${this.width()}px`,
      });
      this._element.attr("transform", "translate(0, 0)");
    } else {
      this._element.attr("transform", "translate(" + this._origin.x + "," + this._origin.y + ")");
    }

    this._boxes.forEach((b: d3.Selection<void>) => b.attr("width", this.width()).attr("height", this.height()));

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

  private _scheduleComputeLayout() {
    if (this._isAnchored && this._isSetup) {
      RenderController.registerToComputeLayoutAndRender(this);
    }
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
   * This function should be called when a CSS change has occured that could
   * influence the layout of the Component, such as changing the font size.
   *
   * @returns {Component} The calling Component.
   */
  public redraw() {
    if (this._isAnchored && this._isSetup) {
      if (this._isTopLevelSVG && this.parent() == null) {
        // only redraw myself if I'm the root
        this._scheduleComputeLayout();
      } else {
        this.parent().redraw();
      }
    }
    return this;
  }

  /**
   * Renders the Component to a given <svg>.
   *
   * @param {String|d3.Selection} element A selector-string for the <svg>, or a d3 selection containing an <svg>.
   * @returns {Component} The calling Component.
   */
  public renderTo(element: String | Element | d3.Selection<void>): this {
    this.detach();
    if (element != null) {
      let selection: d3.Selection<void>;
      if (typeof(element) === "string") {
        selection = d3.select(<string> element);
      } else if (element instanceof Element) {
        selection = d3.select(<Element> element);
      } else {
        selection = <d3.Selection<void>> element;
      }
      if (!selection.node() || (<Node> selection.node()).nodeName.toLowerCase() !== "svg") {
        throw new Error("Plottable requires a valid SVG to renderTo");
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

  private _addBox(className?: string, parentElement?: d3.Selection<void>) {
    if (this._element == null) {
      throw new Error("Adding boxes before anchoring is currently disallowed");
    }
    parentElement = parentElement == null ? this._boxContainer : parentElement;
    let box = parentElement.append("rect");
    if (className != null) {
      box.classed(className, true);
    }

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
      if (this._isTopLevelSVG) {
        this._rootSVG.select(`.${SVGComponent._SAFARI_EVENT_BACKING_CLASS}`).remove();
      }
    }
    this._isAnchored = false;
    this._onDetachCallbacks.callCallbacks(this);

    return this;
  }

  /**
   * Gets the origin of the Component relative to the root <svg>.
   *
   * @deprecated Use originToRoot instead
   * @return {Point}
   */
  public originToSVG() {
    return this.originToRoot();
  }

  /**
   * Gets the Selection containing the <g> in front of the visual elements of the Component.
   *
   * Will return undefined if the Component has not been anchored.
   *
   * @return {d3.Selection}
   */
  public foreground(): d3.Selection<void> {
    return this._foregroundContainer;
  }

  /**
   * Gets the Selection containing the <g> behind the visual elements of the Component.
   *
   * Will return undefined if the Component has not been anchored.
   *
   * @return {d3.Selection} background selection for the Component
   */
  public background(): d3.Selection<void> {
    return this._backgroundContainer;
  }

  public content(): d3.Selection<void> {
    return this._content;
  }

  public element() {
    if (this._isTopLevelSVG) {
      return this._rootSVG;
    }
    return this._element;
  }

  /**
   * Top-level SVGs <svg ...>  can exist as non *root* components. For example,
   * you can place an <svg ..> within an HTMLTable or HTMLGroup, which themselves
   * are not SVGs. This method determines whether the SVG element is 1) a top-level
   * svg (<svg>) and 2) the root of the rendering tree. If both are true, then this
   * is method will return false.
   */
  private isNestedTopLevelSVG() {
    return this._isTopLevelSVG && this.parent() != null;
  }
}
