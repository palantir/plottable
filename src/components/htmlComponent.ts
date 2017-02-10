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
  private _cssClasses = new Utils.Set<string>();
  private _element: HTMLDivElement;

  public anchor(selection: HTMLElement) {
    if (this._destroyed) {
      throw new Error("Can't reuse destroy()-ed Components!");
    }

    if (this._element != null) {
      // reattach existing element
      selection.appendChild(this._element);
    } else {
      this._element = document.createElement("div");
      selection.appendChild(this._element);
      this._setup();
    }


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

        origin = { x: 0, y: 0 };
        // this is the top-level element. make it 100% height and width
        // so we can measure the amount of space available for the chart
        // with respect to the total space allocated for charting as specified
        // by the user.
        this._element.style.width = "100%";
        this._element.style.height = "100%";

        availableWidth = Utils.DOM.elementWidth(this._element);
        availableHeight = Utils.DOM.elementHeight(this._element);
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
    d3.select(this._element).style({
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
      return this._element.className.split(" ").indexOf(cssClass) !== -1;
    }
  }

  public addClass(cssClass: string) {
    if (cssClass == null) {
      return this;
    }

    if (this._element == null) {
      this._cssClasses.add(cssClass);
    } else {
      const classNames = this._element.className.split(" ");
      if (classNames.indexOf(cssClass) !== -1) {
        classNames.push(cssClass);
        this._element.className = classNames.join(" ");
      }
    }

    return this;
  }

  public removeClass(cssClass: string) {
    if (cssClass == null) {
      return this;
    }

    if (this._element == null) {
      this._cssClasses.delete(cssClass);
    } else {
      const classNames = this._element.className.split(" ");
      const indexOfClass = classNames.indexOf(cssClass);
      if (indexOfClass > -1) {
        classNames.splice(indexOfClass, 1);
        this._element.className = classNames.join(" ");
      }
    }

    return this;
  }

  public detach() {
    this.parent(null);

    if (this._isAnchored) {
      d3.select(this._element).remove();
    }

    this._isAnchored = false;
    this._onDetachCallbacks.callCallbacks(this);

    return this;
  }

  public content() {
    return d3.select(this._element);
  }

  public translator(): Utils.Translator {
    return Utils.ClientToHTMLTranslator.getTranslator(this);
  }

  public element() {
    return d3.select(this._element);
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

    const classListSet = new Utils.Set<string>();
    this._element.className.split(" ").forEach((className) => classListSet.add(className));
    this._cssClasses.forEach((className) => classListSet.add(className));
    const classList: string[] = [];
    classListSet.forEach((className) => classList.push(className));
    this._element.className = classList.join(" ");

    if (this.parent() == null) {
      // the root element gets the plottable class name
      d3.select(this._element).classed("plottable", true);
    } else {
      // non-root components are simple components
      d3.select(this._element).classed("component", true);
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
