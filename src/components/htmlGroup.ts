import { SpaceRequest, Point } from "../core/interfaces";
import * as Utils from "../utils";

import { IComponent } from "./abstractComponent";
import { HTMLComponentContainer } from "./htmlComponentContainer";

export class HTMLGroup extends HTMLComponentContainer {
  private _components: IComponent<any>[] = [];

  /**
   * Constructs a Group.
   *
   * A Group contains Components that will be rendered on top of each other.
   * Components added later will be rendered above Components already in the Group.
   *
   * @constructor
   * @param {Component[]} [components=[]] Components to be added to the Group.
   */
  constructor(components: IComponent<any>[] = []) {
    super();
    this.addClass("component-group");
    components.forEach((c: IComponent<any>) => this.append(c));
  }

  protected _forEach(callback: (component: IComponent<any>) => any) {
    this.components().forEach(callback);
  }

  /**
   * Checks whether the specified Component is in the Group.
   */
  public has(component: IComponent<any>) {
    return this._components.indexOf(component) >= 0;
  }

  public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
    let requests = this._components.map((c: IComponent<any>) => c.requestedSpace(offeredWidth, offeredHeight));
    return {
      minWidth: Utils.Math.max<SpaceRequest, number>(requests, (request) => request.minWidth, 0),
      minHeight: Utils.Math.max<SpaceRequest, number>(requests, (request) => request.minHeight, 0),
    };
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);
    this._forEach((component) => {
      component.computeLayout({ x: 0, y: 0 }, this.width(), this.height());
    });
    return this;
  }

  protected _sizeFromOffer(availableWidth: number, availableHeight: number) {
    return {
      width: availableWidth,
      height: availableHeight,
    };
  }

  public fixedWidth(): boolean {
    return this._components.every((c) => c.fixedWidth());
  }

  public fixedHeight(): boolean {
    return this._components.every((c) => c.fixedHeight());
  }

  /**
   * @return {Component[]} The Components in this Group.
   */
  public components(): IComponent<any>[] {
    return this._components.slice();
  }

  /**
   * Adds a Component to this Group.
   * The added Component will be rendered above Components already in the Group.
   */
  public append(component: IComponent<any>): this {
    if (component != null && !this.has(component)) {
      component.detach();
      this._components.push(component);
      this._adoptAndAnchor(component);
      this.redraw();
    }
    return this;
  }

  protected _remove(component: IComponent<any>) {
    let removeIndex = this._components.indexOf(component);
    if (removeIndex >= 0) {
      this._components.splice(removeIndex, 1);
      return true;
    }
    return false;
  }

}
