/// <reference path="../reference.d.ts" />
declare module Plottable {
    class Component extends PlottableObject {
        public element: D3.Selection;
        public content: D3.Selection;
        private hitBox;
        private interactionsToRegister;
        private boxes;
        private boxContainer;
        public backgroundContainer: D3.Selection;
        public foregroundContainer: D3.Selection;
        public clipPathEnabled: boolean;
        private broadcastersCurrentlyListeningTo;
        private rootSVG;
        private isTopLevelComponent;
        public _parent: ComponentContainer;
        public availableWidth: number;
        public availableHeight: number;
        public xOrigin: number;
        public yOrigin: number;
        private _xOffset;
        private _yOffset;
        public _xAlignProportion: number;
        public _yAlignProportion: number;
        private cssClasses;
        public _isSetup: boolean;
        public _isAnchored: boolean;
        /**
        * Attaches the Component as a child of a given a DOM element. Usually only directly invoked on root-level Components.
        *
        * @param {D3.Selection} element A D3 selection consisting of the element to anchor under.
        * @returns {Component} The calling component.
        */
        public _anchor(element: D3.Selection): Component;
        /**
        * Creates additional elements as necessary for the Component to function.
        * Called during _anchor() if the Component's element has not been created yet.
        * Override in subclasses to provide additional functionality.
        *
        * @returns {Component} The calling Component.
        */
        public _setup(): Component;
        public _requestedSpace(availableWidth: number, availableHeight: number): ISpaceRequest;
        /**
        * Computes the size, position, and alignment from the specified values.
        * If no parameters are supplied and the component is a root node,
        * they are inferred from the size of the component's element.
        *
        * @param {number} xOrigin
        * @param {number} yOrigin
        * @param {number} availableWidth
        * @param {number} availableHeight
        * @returns {Component} The calling Component.
        */
        public _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): Component;
        /**
        * Renders the component.
        *
        * @returns {Component} The calling Component.
        */
        public _render(): Component;
        public _scheduleComputeLayout(): Component;
        public _doRender(): Component;
        public _invalidateLayout(): void;
        /**
        * Renders the Component into a given DOM element.
        *
        * @param {String|D3.Selection} element A D3 selection or a selector for getting the element to render into.
        * @return {Component} The calling component.
        */
        public renderTo(element: any): Component;
        /**
        * Cause the Component to recompute layout and redraw. If passed arguments, will resize the root SVG it lives in.
        *
        * @param {number} [availableWidth]  - the width of the container element
        * @param {number} [availableHeight] - the height of the container element
        */
        public resize(width?: number, height?: number): Component;
        /**
        * Sets the x alignment of the Component.
        *
        * @param {string} alignment The x alignment of the Component (one of LEFT/CENTER/RIGHT).
        * @returns {Component} The calling Component.
        */
        public xAlign(alignment: string): Component;
        /**
        * Sets the y alignment of the Component.
        *
        * @param {string} alignment The y alignment of the Component (one of TOP/CENTER/BOTTOM).
        * @returns {Component} The calling Component.
        */
        public yAlign(alignment: string): Component;
        /**
        * Sets the x offset of the Component.
        *
        * @param {number} offset The desired x offset, in pixels.
        * @returns {Component} The calling Component.
        */
        public xOffset(offset: number): Component;
        /**
        * Sets the y offset of the Component.
        *
        * @param {number} offset The desired y offset, in pixels.
        * @returns {Component} The calling Component.
        */
        public yOffset(offset: number): Component;
        private addBox(className?, parentElement?);
        private generateClipPath();
        /**
        * Attaches an Interaction to the Component, so that the Interaction will listen for events on the Component.
        *
        * @param {Interaction} interaction The Interaction to attach to the Component.
        * @return {Component} The calling Component.
        */
        public registerInteraction(interaction: Interaction): Component;
        public _registerToBroadcaster(broadcaster: Broadcaster, callback: IBroadcasterCallback): void;
        public _deregisterFromBroadcaster(broadcaster: Broadcaster): void;
        /**
        * Adds/removes a given CSS class to/from the Component, or checks if the Component has a particular CSS class.
        *
        * @param {string} cssClass The CSS class to add/remove/check for.
        * @param {boolean} [addClass] Whether to add or remove the CSS class. If not supplied, checks for the CSS class.
        * @return {boolean|Component} Whether the Component has the given CSS class, or the calling Component (if addClass is supplied).
        */
        public classed(cssClass: string): boolean;
        public classed(cssClass: string, addClass: boolean): Component;
        /**
        * Checks if the Component has a fixed width or false if it grows to fill available space.
        * Returns false by default on the base Component class.
        *
        * @return {boolean} Whether the component has a fixed width.
        */
        public _isFixedWidth(): boolean;
        /**
        * Checks if the Component has a fixed height or false if it grows to fill available space.
        * Returns false by default on the base Component class.
        *
        * @return {boolean} Whether the component has a fixed height.
        */
        public _isFixedHeight(): boolean;
        /**
        * Merges this Component with another Component, returning a ComponentGroup.
        * There are four cases:
        * Component + Component: Returns a ComponentGroup with both components inside it.
        * ComponentGroup + Component: Returns the ComponentGroup with the Component appended.
        * Component + ComponentGroup: Returns the ComponentGroup with the Component prepended.
        * ComponentGroup + ComponentGroup: Returns a new ComponentGroup with two ComponentGroups inside it.
        *
        * @param {Component} c The component to merge in.
        * @return {ComponentGroup}
        */
        public merge(c: Component): ComponentGroup;
        /**
        * Removes a Component from the DOM.
        */
        public remove(): Component;
    }
}
