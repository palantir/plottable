/// <reference path="../reference.d.ts" />
declare module Plottable {
    class ComponentContainer extends Component {
        public _components: Component[];
        public _anchor(element: D3.Selection): ComponentContainer;
        public _render(): ComponentContainer;
        public _removeComponent(c: Component): ComponentContainer;
        public _addComponent(c: Component, prepend?: boolean): boolean;
        /**
        * Returns a list of components in the ComponentContainer
        *
        * @returns{Component[]} the contained Components
        */
        public components(): Component[];
        /**
        * Returns true iff the ComponentContainer is empty.
        *
        * @returns {boolean} Whether the calling ComponentContainer is empty.
        */
        public empty(): boolean;
        /**
        * Remove all components contained in the  ComponentContainer
        *
        * @returns {ComponentContainer} The calling ComponentContainer
        */
        public removeAll(): ComponentContainer;
    }
}
