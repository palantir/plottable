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

    public _addComponentToGroup(c: Component, prepend = false): ComponentGroup {
      if (prepend) {
        this.components.unshift(c);
      } else {
        this.components.push(c);
      }
      if (this.element != null) {
        c._anchor(this.content.insert("g", "g"));
      }
      return this;
    }

    public merge(c: Component): ComponentGroup {
      this._addComponentToGroup(c);
      return this;
    }

    public _anchor(element: D3.Selection): ComponentGroup {
      super._anchor(element);
      this.components.forEach((c) => c._anchor(this.content.insert("g", "g")));
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

    public remove() {
      this.components.forEach((c) => c.remove());
      super.remove();
    }
  }
}
