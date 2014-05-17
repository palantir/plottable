///<reference path="../reference.ts" />

module Plottable {
  export class ComponentContainer extends Component {
    /*
     * An abstract ComponentContainer class to encapsulate Table and ComponentGroup's shared functionality.
     * It will not do anything if instantiated directly.
     */
    public _components: Component[] = [];

    public _anchor(element: D3.Selection) {
      super._anchor(element);
      this._components.forEach((c) => c._anchor(this.content));
      return this;
    }

    public _removeComponent(c: Component) {
      var removeIndex = this._components.indexOf(c);
      if (removeIndex >= 0) {
        this._components.splice(removeIndex, 1);
        this._invalidateLayout();
      }
      return this;
    }

    public _addComponent(c: Component) {
      this._components.push(c);
      c._parent = this;
      if (this.element != null) {
        c._anchor(this.content);
      }
      this._invalidateLayout();
      return this;
    }

    /**
     * Returns a list of components in the ComponentContainer
     *
     * @returns{Component[]} the contained Components
     */
    public components(): Component[] {
      return this._components;
    }

    /**
     * Returns true iff the ComponentContainer is empty.
     *
     * @returns {boolean} Whether the calling ComponentContainer is empty.
     */
    public empty() {
      return this._components.length === 0;
    }

    /**
     * Remove all components contained in the  ComponentContainer
     *
     * @returns {ComponentContainer} The calling ComponentContainer
     */
    public removeAll() {
      // Iterate over a copy, not the array directly, since remove mutates this._components
      this._components.slice().forEach((c: Component) => c.remove());
      return this;
    }
  }
}
