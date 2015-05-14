///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class Group extends ComponentContainer {
    private _componentList: Component[] = [];

    /**
     * Constructs a Component.Group.
     *
     * A Component.Group is a set of Components that will be rendered on top of
     * each other. Components added later will be rendered on top of existing Components.
     *
     * @constructor
     * @param {Component[]} components The Components in the resultant Component.Group (default = []).
     */
    constructor(components: Component[] = []) {
      super();
      this.classed("component-group", true);
      components.forEach((c: Component) => this.add(c));
    }

    public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
      var requests = this._components().map((c: Component) => c.requestedSpace(offeredWidth, offeredHeight));
      return {
        minWidth: Utils.Methods.max<SpaceRequest, number>(requests, (request) => request.minWidth, 0),
        minHeight: Utils.Methods.max<SpaceRequest, number>(requests, (request) => request.minHeight, 0)
      };
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      this._components().forEach((c) => {
        c.computeLayout({ x: 0, y: 0 }, this.width(), this.height());
      });
      return this;
    }

    protected _getSize(availableWidth: number, availableHeight: number) {
      return {
        width: availableWidth,
        height: availableHeight
      };
    }

    public fixedWidth(): boolean {
      return this._components().every((c) => c.fixedWidth());
    }

    public fixedHeight(): boolean {
      return this._components().every((c) => c.fixedHeight());
    }

    /**
     * @return {Component[]} The Components in this Group.
     */
    public components(): Component[] {
      return this._componentList.slice();
    }

    protected _components(): Component[] {
      return this._componentList;
    }

    /**
     * Adds a Component to the Group.
     * 
     * @param {Component} component
     * @param {boolean} prepend If true, prepends the Component. If false, appends it.
     */
    public add(component: Component, prepend = false) {
      if (component != null && !this.has(component)) {
        component.detach();
        if (prepend) {
          this._componentList.unshift(component);
        } else {
          this._componentList.push(component);
        }

        this._adoptAndAnchor(component);
        this.redraw();
      }
      return this;
    }

    protected _remove(component: Component) {
      var removeIndex = this._componentList.indexOf(component);
      if (removeIndex >= 0) {
        this._componentList.splice(removeIndex, 1);
        return true;
      }
      return false;
    }

  }
}
}
