import { GenericComponentCallback, IComponent, IResizeHandler } from "./component";
import { IComponentContainer } from "./componentContainer";

import { Point, SpaceRequest, Bounds } from "../core/interfaces";
import * as RenderController from "../core/renderController";
import * as Utils from "../utils";



export class HTMLComponent implements IComponent<HTMLElement> {
  private _cssClasses = new Utils.Set<string>();
  private _destroyed = false;
  private _element: HTMLDivElement;
  private _content: HTMLDivElement;
  private _height: number;
  private _onAnchorCallbacks = new Utils.CallbackSet<GenericComponentCallback<HTMLElement>>();
  private _onDetachCallbacks = new Utils.CallbackSet<GenericComponentCallback<HTMLElement>>();
  private _origin: Point = { x: 0, y: 0 };
  private _parent: IComponentContainer<HTMLElement>;
  private _resizeHandler: IResizeHandler;
  private _width: number;
  private _xAlignment: string = "left";
  private _yAlignment: string = "top";

  protected _isAnchored = false;
  protected _isSetup = false;

  private static _xAlignToProportion: { [alignment: string]: number } = {
    "left": 0,
    "center": 0.5,
    "right": 1,
  };
  private static _yAlignToProportion: { [alignment: string]: number } = {
    "top": 0,
    "center": 0.5,
    "bottom": 1,
  };

  public anchor(selection: HTMLElement) {
    if (this._destroyed) {
      throw new Error("Can't reuse destroy()-ed Components!");
    }

    if (this._element != null) {
      // reattach existing element
      selection.appendChild(this._element);
    } else {
      this._element = document.createElement("div");
      selection.appendChild(document.createElement("div"));
      this._setup();
    }

    this._isAnchored = true;
    this._onAnchorCallbacks.callCallbacks(this);
    return this;
  }

  public onAnchor(callback: GenericComponentCallback<HTMLElement>) {
    if (this._isAnchored) {
      callback(this);
    }
    this._onAnchorCallbacks.add(callback);
    return this;
  }

  public offAnchor(callback: GenericComponentCallback<HTMLElement>) {
    this._onAnchorCallbacks.delete(callback);
    return this;
  }

  public requestedSpace(availableWidth: number, availableHeight: number) {
    return {
      minWidth: 0,
      minHeight: 0,
    };
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    // TODO: Write this method
    return this;
  }

  public render() {
    if (this._isAnchored && this._isSetup && this.width() >= 0 && this.height() >= 0) {
      RenderController.registerToRender(this);
    }

    return this;
  }

  public onResize(resizeHandler: IResizeHandler) {
    this._resizeHandler = resizeHandler;
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

  public xAlignment(): string;
  public xAlignment(xAlignment: string): this;
  public xAlignment(xAlignment?: string) {
    if (xAlignment == null) {
      return this._xAlignment;
    }

    xAlignment = xAlignment.toLowerCase();
    if (HTMLComponent._xAlignToProportion[xAlignment] == null) {
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
   * @returns {IComponent} The calling Component.
   */
  public yAlignment(yAlignment: string): this;
  public yAlignment(yAlignment?: string) {
    if (yAlignment == null) {
      return this._yAlignment;
    }

    yAlignment = yAlignment.toLowerCase();
    if (HTMLComponent._yAlignToProportion[yAlignment] == null) {
      throw new Error("Unsupported alignment: " + yAlignment);
    }
    this._yAlignment = yAlignment;
    this.redraw();
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

  public fixedWidth() {
    return false;
  }

  public fixedHeight() {
    return false;
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

  public onDetach(callback: GenericComponentCallback<HTMLElement>) {
    this._onDetachCallbacks.add(callback);
    return this;
  }

  public offDetach(callback: GenericComponentCallback<HTMLElement>) {
    this._onDetachCallbacks.delete(callback);
    return this;
  }

  public parent(): IComponentContainer<any>;
  public parent(parent: IComponentContainer<any>): this;
  public parent(parent?: IComponentContainer<any>) {
    if (parent === undefined) {
      return this._parent;
    }

    if (parent !== null && !parent.has(this)) {
      throw new Error("Passed invalid parent");
    }

    this._parent = parent;
    return this;
  }

  public bounds() {
    const topLeft = this.origin();

    return {
      topLeft,
      bottomRight: {
        x: topLeft.x + this.width(),
        y: topLeft.y + this.height()
      },
    }
  }

  public destroy() {
    this._destroyed = true;
    this.detach();
  }

  public width() {
    return this._width;
  }

  public height() {
    return this._height;
  }

  public origin() {
    const { x, y } = this._origin;
    return { x, y };
  }

  public originToRoot() {
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

  public content() {
    return this._content;
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

    this._isSetup = true;
  }

  private _scheduleComputeLayout() {
    if (this._isAnchored && this._isSetup) {
      RenderController.registerToComputeLayoutAndRender(this);
    }
  }
}
