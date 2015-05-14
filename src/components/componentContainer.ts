///<reference path="../reference.ts" />

module Plottable {
  /*
   * ComponentContainer class encapsulates Table and ComponentGroup's shared functionality.
   * It will not do anything if instantiated directly.
   */
  export class ComponentContainer extends Component {
    private _detachCallback: ComponentCallback;

    constructor() {
      super();
      this._detachCallback = (component: Component) => this.remove(component);
    }

    public anchor(selection: D3.Selection) {
      super.anchor(selection);
      this._components().forEach((c) => c.anchor(this._content));
      return this;
    }

    public render() {
      this._components().forEach((c) => c.render());
      return this;
    }

    /**
     * Checks whether the specified Component is in the ComponentContainer.
     */
    public has(component: Component) {
      return this._components().indexOf(component) >= 0;
    }

    protected _adoptAndAnchor(component: Component) {
      component.parent(this);
      component.onDetach(this._detachCallback);
      if (this._isAnchored) {
        component.anchor(this._content);
      }
    }

    /**
     * Removes the specified Component from the ComponentContainer.
     */
    public remove(component: Component) {
      if (this.has(component)) {
        component.offDetach(this._detachCallback);
        this._remove(component);
        component.detach();
        this.redraw();
      }
      return this;
    }

    /**
     * Carry out the actual removal of a Component.
     * Implementation dependent on the type of container.
     * 
     * @return {boolean} true if the Component was successfully removed, false otherwise.
     */
    protected _remove(component: Component) {
      return false;
    }

    /**
     * Returns a list of components in the ComponentContainer.
     *
     * @returns {Component[]} the contained Components
     */
    protected _components(): Component[] {
      return [];
    }

    /**
     * Destroys the ComponentContainer and all Components within it.
     */
    public destroy() {
      super.destroy();
      this._components().slice().forEach((c: Component) => c.destroy());
    }
  }
}
