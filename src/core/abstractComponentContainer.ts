///<reference path="../reference.ts" />

module Plottable {
  export class AbstractComponentContainer extends Component {
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
    public getComponents(): Component[] {
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
     * @returns {AbstractComponentContainer} The calling ComponentContainer
     */
    public removeAll() {
      this._components.forEach((c: Component) => c.remove());
      return this;
    }
  }
}
