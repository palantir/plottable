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

    public getComponents(): Component[] {
      return this._components;
    }

    public empty() {
      return this._components.length === 0;
    }

    public removeAll() {
      this._components.forEach((c: Component) => c.remove());
    }
  }
}
