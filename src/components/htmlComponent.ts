/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import {
  AbstractComponent,
  IComponent,
  IContent,
  GenericComponentCallback,
  IResizeHandler
} from "./abstractComponent";

import { Point, SpaceRequest, Bounds } from "../core/interfaces";
import * as RenderController from "../core/renderController";
import * as Utils from "../utils";

export class HTMLComponent extends AbstractComponent<HTMLElement> {

  public anchor(selection: HTMLElement) {
    if (this._destroyed) {
      throw new Error("Can't reuse destroy()-ed Components!");
    }

    if (this._element == null) {
      this._element = d3.select(document.createElement("div"));
      this._setup();
    }

    selection.appendChild(this._element.node());

    this._isAnchored = true;
    this._onAnchorCallbacks.callCallbacks(this);
    return this;
  }

  public anchorHTML(selection: HTMLElement) {
    return this.anchor(selection);
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    if (origin == null || availableWidth == null || availableHeight == null) {
      if (this._element == null) {
        throw new Error("anchor() must be called before computeLayout()");
      } else if (this.parent() == null) {
        // if the parent is null we are the root node. In this case, we determine
        // then sizing constraints for the remainder of the chart.
        this._element.classed("root", true);

        origin = { x: 0, y: 0 };
        // this is the top-level element. make it 100% height and width
        // so we can measure the amount of space available for the chart
        // with respect to the total space allocated for charting as specified
        // by the user.
        this._element.style({ "width": "100%", "height": "100%" });

        availableWidth = Utils.DOM.elementWidth(this._element.node() as HTMLElement);
        availableHeight = Utils.DOM.elementHeight(this._element.node() as HTMLElement);
      } else {
        throw new Error("null arguments cannot be passed to computeLayout() on a non-root node");
      }
    }

    let size = this._sizeFromOffer(availableWidth, availableHeight);
    this._width = size.width;
    this._height = size.height;

    let xAlignProportion = HTMLComponent._xAlignToProportion[this._xAlignment];
    let yAlignProportion = HTMLComponent._yAlignToProportion[this._yAlignment];
    this._origin = {
      x: origin.x + (availableWidth - this.width()) * xAlignProportion,
      y: origin.y + (availableHeight - this.height()) * yAlignProportion,
    };

    // set the size and position of the root element given the
    // calculated space constraints
    this._element.style({
      height: `${this._height}px`,
      left: `${this._origin.x}px`,
      top: `${this._origin.y}px`,
      width: `${this._width}px`,
    });

    if (this._resizeHandler != null) {
      this._resizeHandler(size);
    }

    return this;
  }

  public renderImmediately() {
    return this;
  }

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

  public renderTo(element: HTMLElement) {
    this.detach();

    if (element == null || !element.nodeName) {
      throw new Error("Plottable requires a valid HTMLElement to renderTo");
    }

    this.anchor(element);

    if (this._element == null) {
      throw new Error("If a Component has never been rendered before, then renderTo must be given an HTMLElement to render to");
    }

    RenderController.registerToComputeLayoutAndRender(this);
    // flush so that consumers can immediately attach to stuff we create in the DOM
    RenderController.flush();
    return this;
  }

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

  public detach() {
    this.parent(null);

    if (this._isAnchored) {
      this._element.remove();
    }

    this._isAnchored = false;
    this._onDetachCallbacks.callCallbacks(this);

    return this;
  }

  public content() {
    return this._element;
  }

  public element() {
    return this._element;
  }

  /**
   * Gets the container holding the visual elements of the Component.
   *
   * Will return undefined if the Component has not been anchored.
   *
   * @return {D} content selection for the Component
   */

  protected _setup() {
    if (this._isSetup) {
      return;
    }

    this._cssClasses.forEach((cssClass: string) => {
      this._element.classed(cssClass, true);
    });

    if (this.parent() == null) {
      // the root element gets the plottable class name
      this._element.classed("plottable", true);
    } else {
      // non-root components are simple components
      this._element.classed("component", true);
    }

    this._cssClasses = new Utils.Set<string>();
    this._isSetup = true;
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
}
