import * as d3 from "d3";

import { AbstractComponent } from "./abstractComponent";
import { GenericComponentCallback, IResizeHandler } from "./component";
import { IComponentContainer } from "./componentContainer";

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
        // we are the root node, retrieve height/width from root SVG
        origin = { x: 0, y: 0 };

        // Set width/height to 100% if not specified, to allow accurate size calculation
        // see http://www.w3.org/TR/CSS21/visudet.html#block-replaced-width
        // and http://www.w3.org/TR/CSS21/visudet.html#inline-replaced-height
        if (this.content().attr("width") == null) {
          this.content().attr("width", "100%");
        }
        if (this.content().attr("height") == null) {
          this.content().attr("height", "100%");
        }

        let elem: HTMLScriptElement = (<HTMLScriptElement> this.content().node());
        availableWidth = Utils.DOM.elementWidth(elem);
        availableHeight = Utils.DOM.elementHeight(elem);
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
    d3.select(this._element).attr("transform", "translate(" + this._origin.x + "," + this._origin.y + ")");

    if (this._resizeHandler != null) {
      this._resizeHandler(size);
    }

    return this;
  }

  public renderImmediately() {
    // TODO render immediately
    return this;
  }

  public redraw() {
    // TODO make redraw actually work
    if (this._isAnchored && this._isSetup) {
        this._scheduleComputeLayout();
    }

    return this;
  }

  public renderTo(element: HTMLElement) {
    this.detach();

    if (element == null || !element.nodeName) {
      throw new Error("Plottable requires a valid SVG to renderTo");
    }

    this.anchor(element);

    if (this._element == null) {
      throw new Error("If a Component has never been rendered before, then renderTo must be given a node to render to, " +
        "or a d3.Selection, or a selector string");
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
      this._element.remove();
    }

    this._isAnchored = false;
    this._onDetachCallbacks.callCallbacks(this);

    return this;
  }

  public content() {
    return d3.select(this._content);
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

    this._cssClasses = new Utils.Set<string>();
    this._content = document.createElement("div");
    this._content.className = "content";
    this._element.appendChild(this._content);

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
