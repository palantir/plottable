///<reference path="../reference.ts" />

module Plottable {
  export class ComponentContainer extends Component {
    /*
     * An abstract ComponentContainer class to encapsulate Table and ComponentGroup's shared functionality.
     * It will not do anything if instantiated directly.
     */
    public _components: Component[] = [];
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
      // It's not safe to iterate over the list of components, because removing them will modify the list during iteration
      // So get all the functions to call, and then call them all
      this._components.map((c: Component) => (() => c.remove())).forEach((f) => f());
      return this;
    }
  }
}
