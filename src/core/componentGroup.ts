///<reference path="../reference.ts" />

module Plottable {
  export class ComponentGroup extends Component {
    private components: Component[];

    /**
     * Creates a ComponentGroup.
     *
     * @constructor
     * @param {Component[]} [components] The Components in the ComponentGroup.
     */
    constructor(components: Component[] = []){
      super();
      this.classed("component-group", true);
      this.components = components;
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      var requests = this.components.map((c: Component) => c._requestedSpace(offeredWidth, offeredHeight));
      var desiredWidth  = d3.max(requests, (l: ISpaceRequest) => l.width );
      var desiredHeight = d3.max(requests, (l: ISpaceRequest) => l.height);
      return {
        width : Math.min(desiredWidth , offeredWidth ),
        height: Math.min(desiredHeight, offeredHeight),
        wantsWidth : desiredWidth  > offeredWidth,
        wantsHeight: desiredHeight > offeredHeight
      };
    }

    public _addComponentToGroup(c: Component, prepend = false): ComponentGroup {
      this._invalidateLayout();
      if (prepend) {
        this.components.unshift(c);
      } else {
        this.components.push(c);
      }
      if (this.element != null) {
        c._anchor(this.content, this);
      }
      return this;
    }

    public merge(c: Component): ComponentGroup {
      this._addComponentToGroup(c);
      return this;
    }

    /**
     * If the given component exists in the ComponentGroup, removes it from the
     * group and the DOM.
     *
     * @param {Component} c The component to be removed.
     * @returns {ComponentGroup} The calling ComponentGroup.
     */
    public removeComponent(c: Component): ComponentGroup {
      var removeIndex = this.components.indexOf(c);
      if (removeIndex >= 0) {
        this.components.splice(removeIndex, 1);
        c.remove();
        this._invalidateLayout();
      }
      return this;
    }

    /**
     * Removes all Components in the ComponentGroup from the group and the DOM.
     *
     * @returns {ComponentGroup} The calling ComponentGroup.
     */
    public empty(): ComponentGroup {
      this.components.forEach((c: Component) => c.remove());
      this.components = [];
      this._invalidateLayout();
      return this;
    }

    public _anchor(element: D3.Selection, parent?: Component): ComponentGroup {
      super._anchor(element, parent);
      this.components.forEach((c) => c._anchor(this.content, this));
      return this;
    }

    public _computeLayout(xOrigin?: number,
                          yOrigin?: number,
                   availableWidth?: number,
                  availableHeight?: number): ComponentGroup {
      super._computeLayout(xOrigin, yOrigin, availableWidth, availableHeight);
      this.components.forEach((c) => {
        c._computeLayout(0, 0, this.availableWidth, this.availableHeight);
      });
      return this;
    }

    public _doRender() {
      super._doRender();
      this.components.forEach((c) => c._doRender());
      return this;
    }

    public isFixedWidth(): boolean {
      return this.components.every((c) => c.isFixedWidth());
    }

    public isFixedHeight(): boolean {
      return this.components.every((c) => c.isFixedHeight());
    }
  }
}
