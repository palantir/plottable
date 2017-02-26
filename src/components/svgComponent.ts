/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { AbstractComponent, IComponent } from "./abstractComponent";
import { Point, SpaceRequest, Bounds, SimpleSelection } from "../core/interfaces";
import * as RenderController from "../core/renderController";
import * as Utils from "../utils";
import { coerceExternalD3 } from "../utils/coerceD3";

// HACKHACK replace with GenericComponentCallback in 3.0
export type ComponentCallback = (component: SVGComponent) => void;

export class SVGComponent extends AbstractComponent<SimpleSelection<void>> {
  protected _boundingBox: SimpleSelection<void>;
  private _backgroundContainer: SimpleSelection<void>;
  private _foregroundContainer: SimpleSelection<void>;
  protected _clipPathEnabled = false;

  private _boxes: SimpleSelection<void>[] = [];
  private _boxContainer: SimpleSelection<void>;
  private _rootSVG: SimpleSelection<void>;
  private _clipPathID: string;
  private static _SAFARI_EVENT_BACKING_CLASS = "safari-event-backing";

  public constructor() {
    super();
    this._cssClasses.add("component");
  }

  /**
   * Attaches the Component as a child of a given d3 Selection.
   *
   * @param {SimpleSelection} selection.
   * @returns {Component} The calling Component.
   */
  public anchor(selection: SimpleSelection<void>) {
    selection = coerceExternalD3(selection);
    if (this._destroyed) {
      throw new Error("Can't reuse destroy()-ed Components!");
    }

    /**
     * The user has the option of passing an SVG element directly
     * to the anchor method, in which case we will render directly
     * to that SVG.
     */
    const isTopLevelSVG = (<Element> selection.node()).nodeName.toLowerCase() === "svg";
    if (isTopLevelSVG) {
      this._rootSVG = selection;
    } else {
      this._rootSVG = selection.append("svg");
    }

    // visible overflow for firefox https://stackoverflow.com/questions/5926986/why-does-firefox-appear-to-truncate-embedded-svgs
    this._rootSVG.style("overflow", "visible");

    // HACKHACK: Safari fails to register events on the <svg> itself
    const safariBacking = this._rootSVG.select(`.${SVGComponent._SAFARI_EVENT_BACKING_CLASS}`);
    if (safariBacking.empty()) {
      this._rootSVG.append("rect").classed(SVGComponent._SAFARI_EVENT_BACKING_CLASS, true).attrs({
        x: 0,
        y: 0,
        width: "100%",
        height: "100%",
      }).style("opacity", 0);
    }

    if (this.parent() == null) {
      // top-level component node gets the "plottable" CSS class
      this._rootSVG.classed("plottable", true);
    }

    if (this._element != null) {
      // reattach existing element
      (<Node> this._rootSVG.node()).appendChild(<Node> this._element.node());
    } else {
      this._element = this._rootSVG.append("g");
      this._setup();
    }

    this._isAnchored = true;
    this._onAnchorCallbacks.callCallbacks(this);
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
    if (this.parent() != null) {
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
      } else if (this.parent() == null) {
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

    if (this.parent() != null) {
      // this is a top-level SVG nested within an HTML layout. Apply the styles
      // directly to the root SVG rather than to the g element
      this._rootSVG.styles({
        height: `${this.height()}px`,
        left: `${this._origin.x}px`,
        top: `${this._origin.y}px`,
        width: `${this.width()}px`,
      });
      this._element.attr("transform", "translate(0, 0)");
    } else {
      this._element.attr("transform", "translate(" + this._origin.x + "," + this._origin.y + ")");
    }

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
      if (this.parent() == null) {
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
   * @param {String|SimpleSelection} element A selector-string for the <svg>, or a d3 selection containing an <svg>.
   * @returns {Component} The calling Component.
   */
  public renderTo(element: String | SVGElement | SimpleSelection<void>): this {
    this.detach();
    if (element != null) {
      let selection: SimpleSelection<void>;
      if (typeof(element) === "string") {
        selection = d3.select<d3.BaseType, void>(element);
      } else if (element instanceof Element) {
        selection = d3.select<d3.BaseType, void>(element);
      } else {
        selection = coerceExternalD3(element as SimpleSelection<void>);
      }

      if (!selection.node() || ((selection.node() as SVGElement).nodeName.toLowerCase() !== "svg")) {
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
      this._rootSVG.select(`.${SVGComponent._SAFARI_EVENT_BACKING_CLASS}`).remove();
    }
    this._isAnchored = false;
    this._onDetachCallbacks.callCallbacks(this);

    return this;
  }

  /**
   * Gets the Selection containing the <g> in front of the visual elements of the Component.
   *
   * Will return undefined if the Component has not been anchored.
   *
   * @return {SimpleSelection}
   */
  public foreground(): SimpleSelection<void> {
    return this._foregroundContainer;
  }

  /**
   * Gets the Selection containing the <g> behind the visual elements of the Component.
   *
   * Will return undefined if the Component has not been anchored.
   *
   * @return {SimpleSelection} background selection for the Component
   */
  public background(): SimpleSelection<void> {
    return this._backgroundContainer;
  }

  public content(): SimpleSelection<void> {
    return this._content;
  }

  public element(): SimpleSelection<void> {
    return this._rootSVG;
  }
}
