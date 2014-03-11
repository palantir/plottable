///<reference path="reference.ts" />

module Plottable {
  export class ComponentGroup extends Component {
    private static CSS_CLASS = "component-group";

    private components: Component[];

    /**
     * Creates a ComponentGroup.
     *
     * @constructor
     * @param {Component[]} [components] The Components in the ComponentGroup.
     */
    constructor(components: Component[] = []){
      super();
      this.classed(ComponentGroup.CSS_CLASS, true);
      this.components = components;
    }

    /**
     * Adds a Component to the ComponentGroup.
     *
     * @param {Component} c The Component to add.
     * @returns {ComponentGroup} The calling ComponentGroup.
     */
    public addComponent(c: Component): ComponentGroup {
      this.components.push(c);
      if (this.element != null) {
        c.anchor(this.content.append("g"));
      }
      return this;
    }

    public anchor(element: D3.Selection): ComponentGroup {
      super.anchor(element);
      this.components.forEach((c) => c.anchor(this.content.append("g")));
      return this;
    }

    public computeLayout(xOrigin?: number,
                         yOrigin?: number,
                  availableWidth?: number,
                 availableHeight?: number): ComponentGroup {
      super.computeLayout(xOrigin, yOrigin, availableWidth, availableHeight);
      this.components.forEach((c) => {
        c.computeLayout(this.xOrigin, this.yOrigin, this.availableWidth, this.availableHeight);
      });
      return this;
    }

    public render() {
      super.render();
      this.components.forEach((c) => c.render());
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
