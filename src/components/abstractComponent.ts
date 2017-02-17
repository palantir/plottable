/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { ComponentContainer } from "./componentContainer";

import { Point, SpaceRequest, Bounds } from "../core/interfaces";
import * as RenderController from "../core/renderController";
import * as Utils from "../utils";
import { Set } from "../utils/set";

export type GenericComponentCallback<D> = (component: IComponent<D>) => void;

export type IResizeHandler = (size: { height: number, width: number }) => void;

export interface IComponent<D> {
  /**
   * Attaches the Component as a child of a given html element.
   *
   * @param {HTMLElement} The root element.
   * @returns {Component} The calling Component.
   */
  anchor(selection: d3.Selection<void>): this;
  /**
   * Adds a callback to be called on anchoring the Component to the DOM.
   * If the Component is already anchored, the callback is called immediately.
   *
   * @param {GenericComponentCallback} callback
   * @return {Component}
   */
  onAnchor(callback: GenericComponentCallback<D>): this;
  /**
   * Removes a callback that would be called on anchoring the Component to the DOM.
   * The callback is identified by reference equality.
   *
   * @param {GenericComponentCallback} callback
   * @return {Component}
   */
  offAnchor(callback: GenericComponentCallback<D>): this;
  /**
   * Given available space in pixels, returns the minimum width and height this Component will need.
   *
   * @param {number} availableWidth
   * @param {number} availableHeight
   * @returns {SpaceRequest}
   */
  requestedSpace(availableWidth: number, availableHeight: number): SpaceRequest;
  /**
   * Computes and sets the size, position, and alignment of the Component from the specified values.
   * If no parameters are supplied and the Component is a root node,
   * they are inferred from the size of the Component's element.
   *
   * @param {Point} [origin] Origin of the space offered to the Component.
   * @param {number} [availableWidth] Available width in pixels.
   * @param {number} [availableHeight] Available height in pixels.
   * @returns {IComponent} The calling Component.
   */
  computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;
  /**
   * Queues the Component for rendering.
   *
   * @returns {IComponent} The calling Component.
   */
  render(): this;
  /**
   * Sets a callback that gets called when the component resizes. The size change
   * is not guaranteed to be reflected by the DOM at the time the callback is fired.
   *
   * @param {IResizeHandler} [resizeHandler] Callback to be called when component resizes
   */
  onResize(resizeHandler: IResizeHandler): this;
  /**
   * Renders the Component without waiting for the next frame. This method is a no-op on
   * Component, Table, and Group; render them immediately with .renderTo() instead.
   *
   * @returns {IComponent} The calling Component.
   */
  renderImmediately(): this;
  /**
   * Causes the Component to re-layout and render.
   *
   * This function should be called when a CSS change has occured that could
   * influence the layout of the Component, such as changing the font size.
   *
   * @returns {IComponent} The calling Component.
   */
  redraw(): this;
  /**
   * Renders the Component to a given D
   *
   * @param {D} container The object to render to
   * @returns {IComponent} The calling Component.
   */
  renderTo(container: D): this;
  /**
   * Gets the x alignment of the Component.
   */
  xAlignment(): string;
  /**
   * Sets the x alignment of the Component.
   *
   * @param {string} xAlignment The x alignment of the Component ("left"/"center"/"right").
   * @returns {IComponent} The calling Component.
   */
  xAlignment(xAlignment: string): this;
  xAlignment(xAlignment?: string): any;
  /**
   * Gets the y alignment of the Component.
   */
  yAlignment(): string;
  /**
   * Sets the y alignment of the Component.
   *
   * @param {string} yAlignment The y alignment of the Component ("top"/"center"/"bottom").
   * @returns {IComponent} The calling Component.
   */
  yAlignment(yAlignment: string): this;
  yAlignment(yAlignment?: string): any;
  /**
   * Checks if the Component has a given CSS class.
   *
   * @param {string} cssClass The CSS class to check for.
   */
  hasClass(cssClass: string): boolean;
  /**
   * Adds a given CSS class to the Component.
   *
   * @param {string} cssClass The CSS class to add.
   * @returns {IComponent} The calling Component.
   */
  addClass(cssClass: string): this;
  /**
   * Removes a given CSS class from the Component.
   *
   * @param {string} cssClass The CSS class to remove.
   * @returns {IComponent} The calling Component.
   */
  removeClass(cssClass: string): this;
  /**
   * Checks if the Component has a fixed width or if it grows to fill available space.
   * Returns false by default on the base Component class.
   */
  fixedWidth(): boolean;
  /**
   * Checks if the Component has a fixed height or if it grows to fill available space.
   * Returns false by default on the base Component class.
   */
  fixedHeight(): boolean;
  /**
   * Detaches a Component from the DOM. The Component can be reused.
   *
   * This should only be used if you plan on reusing the calling Component. Otherwise, use destroy().
   *
   * @returns The calling Component.
   */
  detach(): this;
  /**
   * Adds a callback to be called when the Component is detach()-ed.
   *
   * @param {GenericComponentCallback} callback
   * @return {IComponent} The calling Component.
   */
  onDetach(callback: GenericComponentCallback<D>): this;
  /**
   * Removes a callback to be called when the Component is detach()-ed.
   * The callback is identified by reference equality.
   *
   * @param {GenericComponentCallback} callback
   * @return {IComponent} The calling Component.
   */
  offDetach(callback: GenericComponentCallback<D>): this;
  /**
   * Gets the parent ComponentContainer for this Component.
   */
  parent(): ComponentContainer;
  /**
   * Sets the parent ComponentContainer for this Component.
   * An error will be thrown if the parent does not contain this Component.
   * Adding a Component to a ComponentContainer should be done
   * using the appropriate method on the ComponentContainer.
   */
  parent(parent: ComponentContainer): this;
  parent(parent?: ComponentContainer): any;

  /**
   * Removes a Component from the DOM and disconnects all listeners.
   */
  destroy(): void;
  /**
   * Gets the width of the Component in pixels.
   */
  width(): number;
  /**
   * Gets the height of the Component in pixels.
   */
  height(): number;
  /**
   * Gets the origin of the Component relative to its parent.
   *
   * @return {Point}
   */
  origin(): Point;
  /**
   * Gets the container holding the visual elements of the Component.
   *
   * Will return undefined if the Component has not been anchored.
   *
   * @return {IContent} content selection for the Component
   */
  content(): d3.Selection<void>;
  /**
   * Gets the top-level element of the component
   */
  element(): d3.Selection<void>;
}

export abstract class AbstractComponent<D> implements IComponent<D> {
  private _parent: ComponentContainer;

  protected _content: D;
  protected _cssClasses = new Utils.Set<string>();
  protected _destroyed = false;
  protected _element: d3.Selection<void>;
  protected _height: number;
  protected _isAnchored = false;
  protected _isSetup = false;
  protected _onAnchorCallbacks: Utils.CallbackSet<GenericComponentCallback<D>>
    = new Utils.CallbackSet<GenericComponentCallback<D>>();
  protected _onDetachCallbacks: Utils.CallbackSet<GenericComponentCallback<D>>
    = new Utils.CallbackSet<GenericComponentCallback<D>>();
  protected _origin: Point = { x: 0, y: 0 };
  protected _resizeHandler: IResizeHandler;
  protected _width: number;
  protected _xAlignment: string = "left";
  protected _yAlignment: string = "top";

  protected static _xAlignToProportion: { [alignment: string]: number } = {
    "left": 0,
    "center": 0.5,
    "right": 1,
  };
  protected static _yAlignToProportion: { [alignment: string]: number } = {
    "top": 0,
    "center": 0.5,
    "bottom": 1,
  };

  abstract anchor(selection: d3.Selection<void>): this;

  public onAnchor(callback: GenericComponentCallback<D>) {
    if (this._isAnchored) {
      callback(this);
    }
    this._onAnchorCallbacks.add(callback);
    return this;
  }

  public offAnchor(callback: GenericComponentCallback<D>) {
    this._onAnchorCallbacks.delete(callback);
    return this;
  }

  public requestedSpace(availableWidth: number, availableHeight: number) {
    return {
      minWidth: 0,
      minHeight: 0,
    };
  }

  abstract computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;

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

  abstract renderImmediately(): this;

  abstract redraw(): this;

  abstract renderTo(container: D): this;

  public xAlignment(): string;
  public xAlignment(xAlignment: string): this;
  public xAlignment(xAlignment?: string): this | string {
    if (xAlignment == null) {
      return this._xAlignment;
    }

    xAlignment = xAlignment.toLowerCase();
    if (AbstractComponent._xAlignToProportion[xAlignment] == null) {
      throw new Error("Unsupported alignment: " + xAlignment);
    }
    this._xAlignment = xAlignment;
    this.redraw();
    return this;
  }

  public yAlignment(): string;
  public yAlignment(yAlignment: string): this;
  public yAlignment(yAlignment?: string): this | string {
    if (yAlignment == null) {
      return this._yAlignment;
    }

    yAlignment = yAlignment.toLowerCase();
    if (AbstractComponent._yAlignToProportion[yAlignment] == null) {
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
      return this._element.classed(cssClass);
    }
  }

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

  public fixedWidth() {
    return false;
  }

  public fixedHeight() {
    return false;
  }

  abstract detach(): this;

  public onDetach(callback: GenericComponentCallback<D>) {
    this._onDetachCallbacks.add(callback);
    return this;
  }

  public offDetach(callback: GenericComponentCallback<D>) {
    this._onDetachCallbacks.delete(callback);
    return this;
  }

  public parent(): ComponentContainer;
  public parent(parent: ComponentContainer): this;
  public parent(parent?: ComponentContainer): this | ComponentContainer {
    if (parent === undefined) {
      return this._parent;
    }
    if (parent !== null && !parent.has(this)) {
      throw new Error("Passed invalid parent");
    }
    this._parent = parent;
    return this;
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

  abstract content(): d3.Selection<void>;
  abstract element():  d3.Selection<void>;
}
