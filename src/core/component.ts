///<reference path="../reference.ts" />

module Plottable {
  export class Component extends PlottableObject {
    public element: D3.Selection;
    public content: D3.Selection;
    private hitBox: D3.Selection;
    private interactionsToRegister: Interaction[] = [];
    private boxes: D3.Selection[] = [];
    private boxContainer: D3.Selection;
    public backgroundContainer: D3.Selection;
    public foregroundContainer: D3.Selection;
    public clipPathEnabled = false;
    private broadcastersCurrentlyListeningTo: {[key: string]: Broadcaster} = {};
    private hasBeenRemoved = false;

    public _fixedWidth = true;
    public _fixedHeight = true;
    private _minimumHeight = 0;
    private _minimumWidth = 0;

    private rootSVG: D3.Selection;
    private isTopLevelComponent = false;

    public availableWidth : number; // Width and height of the component. Used to size the hitbox, bounding box, etc
    public availableHeight: number;
    public xOrigin        : number; // Origin of the coordinate space for the component. Passed down from parent
    public yOrigin        : number;
    private _xOffset = 0; // Offset from Origin, used for alignment and floating positioning
    private _yOffset = 0;
    public _xAlignProportion = 0; // What % along the free space do we want to position (0 = left, .5 = center, 1 = right)
    public _yAlignProportion = 0;

    private cssClasses: string[] = ["component"];

    /**
     * Attaches the Component to a DOM element. Usually only directly invoked on root-level Components.
     *
     * @param {D3.Selection} element A D3 selection consisting of the element to anchor to.
     * @returns {Component} The calling component.
     */
    public _anchor(element: D3.Selection) {
      if (element.node().childNodes.length > 0) {
        throw new Error("Can't anchor to a non-empty element");
      }
      if (this.hasBeenRemoved) {
        // Since we deregister all the model bindings, this would be dangerous
        throw new Error("Cannot reuse a component after removing it");
      }
      if (this.element != null) {
        throw new Error("Cannot re-anchor a component after it is already anchored");
      }
      if (element.node().nodeName === "svg") {
        // svg node gets the "plottable" CSS class
        this.rootSVG = element;
        this.rootSVG.classed("plottable", true);
        // visible overflow for firefox https://stackoverflow.com/questions/5926986/why-does-firefox-appear-to-truncate-embedded-svgs
        this.rootSVG.style("overflow", "visible");
        this.element = element.append("g");
        this.isTopLevelComponent = true;
      } else {
        this.element = element;
      }

      this.cssClasses.forEach((cssClass: string) => {
        this.element.classed(cssClass, true);
      });
      this.cssClasses = null;

      this.backgroundContainer = this.element.append("g").classed("background-container", true);
      this.content = this.element.append("g").classed("content", true);
      this.foregroundContainer = this.element.append("g").classed("foreground-container", true);
      this.boxContainer = this.element.append("g").classed("box-container", true);

      if (this.clipPathEnabled) {
        this.generateClipPath();
      };

      this.addBox("bounding-box");

      this.interactionsToRegister.forEach((r) => this.registerInteraction(r));
      this.interactionsToRegister = null;
      return this;
    }

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
    public _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number) {
      if (xOrigin == null || yOrigin == null || availableWidth == null || availableHeight == null) {
        if (this.element == null) {
          throw new Error("anchor must be called before computeLayout");
        } else if (this.isTopLevelComponent) {
          // we are the root node, retrieve height/width from root SVG
          xOrigin = 0;
          yOrigin = 0;

          var elem: HTMLScriptElement = (<HTMLScriptElement> this.rootSVG.node());
          availableWidth  = Utils.getElementWidth(elem);
          availableHeight = Utils.getElementHeight(elem);
        } else {
          throw new Error("null arguments cannot be passed to _computeLayout() on a non-root node");
        }
      }
      this.xOrigin = xOrigin;
      this.yOrigin = yOrigin;
      var xPosition = this.xOrigin;
      var yPosition = this.yOrigin;

      xPosition += (availableWidth - this.minimumWidth()) * this._xAlignProportion;
      xPosition += this._xOffset;
      if (this.minimumWidth() !== 0 && this.isFixedWidth()) {
        // Decrease size so hitbox / bounding box and children are sized correctly
        availableWidth = availableWidth > this.minimumWidth() ? this.minimumWidth() : availableWidth;
      }

      yPosition += (availableHeight - this.minimumHeight()) * this._yAlignProportion;
      yPosition += this._yOffset;
      if (this.minimumHeight() !== 0 && this.isFixedHeight()) {
        availableHeight = availableHeight > this.minimumHeight() ? this.minimumHeight() : availableHeight;
      }

      this.availableWidth  = availableWidth;
      this.availableHeight = availableHeight;
      this.element.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
      this.boxes.forEach((b: D3.Selection) => b.attr("width", this.availableWidth).attr("height", this.availableHeight));
      return this;
    }

    /**
     * Renders the component.
     *
     * @returns {Component} The calling Component.
     */
    public _render() {
      RenderController.registerToRender(this);
      return this;
    }

    public _doRender() {
      return this; //no-op
    }

    public renderTo(element: any): Component {
      // When called on top-level-component, a shortcut for component._anchor(svg)._computeLayout()._render()
      if (this.element == null) {
        var selection: D3.Selection;
        if (typeof(element.node) === "function") {
          selection = (<D3.Selection> element);
        } else {
          selection = d3.select(element);
        }
        this._anchor(selection);
      }
      this._computeLayout()._render();
      return this;
    }

    /**
     * Cause the Component to recompute layout and redraw. Useful if the window resized.
     *
     * @param {number} [availableWidth]  - the width of the container element
     * @param {number} [availableHeight] - the height of the container element
     */
    public resize(width?: number, height?: number): Component {
      if (this.element != null) {
        this._computeLayout(width, height)._render();
      }
      return this;
    }

    /**
     * Sets the x alignment of the Component.
     *
     * @param {string} alignment The x alignment of the Component (one of LEFT/CENTER/RIGHT).
     * @returns {Component} The calling Component.
     */
    public xAlign(alignment: string): Component {
      alignment = alignment.toLowerCase();
      if (alignment === "left") {
        this._xAlignProportion = 0;
      } else if (alignment === "center") {
        this._xAlignProportion = 0.5;
      } else if (alignment === "right") {
        this._xAlignProportion = 1;
      } else {
        throw new Error("Unsupported alignment");
      }
      return this;
    }

    /**
     * Sets the y alignment of the Component.
     *
     * @param {string} alignment The y alignment of the Component (one of TOP/CENTER/BOTTOM).
     * @returns {Component} The calling Component.
     */
    public yAlign(alignment: string): Component {
      alignment = alignment.toLowerCase();
      if (alignment === "top") {
        this._yAlignProportion = 0;
      } else if (alignment === "center") {
        this._yAlignProportion = 0.5;
      } else if (alignment === "bottom") {
        this._yAlignProportion = 1;
      } else {
        throw new Error("Unsupported alignment");
      }
      return this;
    }

    /**
     * Sets the x offset of the Component.
     *
     * @param {number} offset The desired x offset, in pixels.
     * @returns {Component} The calling Component.
     */
    public xOffset(offset: number): Component {
      this._xOffset = offset;
      return this;
    }

    /**
     * Sets the y offset of the Component.
     *
     * @param {number} offset The desired y offset, in pixels.
     * @returns {Component} The calling Component.
     */
    public yOffset(offset: number): Component {
      this._yOffset = offset;
      return this;
    }

    private addBox(className?: string, parentElement?: D3.Selection) {
      if (this.element == null) {
        throw new Error("Adding boxes before anchoring is currently disallowed");
      }
      var parentElement = parentElement == null ? this.boxContainer : parentElement;
      var box = parentElement.append("rect");
      if (className != null) {box.classed(className, true);};
      this.boxes.push(box);
      if (this.availableWidth != null && this.availableHeight != null) {
        box.attr("width", this.availableWidth).attr("height", this.availableHeight);
      }
      return box;
    }

    private generateClipPath() {
      // The clip path will prevent content from overflowing its component space.
      this.element.attr("clip-path", "url(#clipPath" + this._plottableID + ")");
      var clipPathParent = this.boxContainer.append("clipPath")
                                      .attr("id", "clipPath" + this._plottableID);
      this.addBox("clip-rect", clipPathParent);
    }

    /**
     * Attaches an Interaction to the Component, so that the Interaction will listen for events on the Component.
     *
     * @param {Interaction} interaction The Interaction to attach to the Component.
     * @return {Component} The calling Component.
     */
    public registerInteraction(interaction: Interaction) {
      // Interactions can be registered before or after anchoring. If registered before, they are
      // pushed to this.interactionsToRegister and registered during anchoring. If after, they are
      // registered immediately
      if (this.element != null) {
        if (this.hitBox == null) {
            this.hitBox = this.addBox("hit-box");
            this.hitBox.style("fill", "#ffffff").style("opacity", 0); // We need to set these so Chrome will register events
        }
        interaction._anchor(this.hitBox);
      } else {
        this.interactionsToRegister.push(interaction);
      }
      return this;
    }

    public _registerToBroadcaster(broadcaster: Broadcaster, callback: IBroadcasterCallback) {
      broadcaster.registerListener(this, callback);
      this.broadcastersCurrentlyListeningTo[broadcaster._plottableID] = broadcaster;
    }

    public _deregisterFromBroadcaster(broadcaster: Broadcaster) {
      broadcaster.deregisterListener(this);
      delete this.broadcastersCurrentlyListeningTo[broadcaster._plottableID];
    }

    /**
     * Adds/removes a given CSS class to/from the Component, or checks if the Component has a particular CSS class.
     *
     * @param {string} cssClass The CSS class to add/remove/check for.
     * @param {boolean} [addClass] Whether to add or remove the CSS class. If not supplied, checks for the CSS class.
     * @return {boolean|Component} Whether the Component has the given CSS class, or the calling Component (if addClass is supplied).
     */
    public classed(cssClass: string): boolean;
    public classed(cssClass: string, addClass: boolean): Component;
    public classed(cssClass: string, addClass?: boolean): any {
      if (addClass == null) {
        if (cssClass == null) {
          return false;
        } else if (this.element == null) {
          return (this.cssClasses.indexOf(cssClass) !== -1);
        } else {
          return this.element.classed(cssClass);
        }
      } else {
        if (cssClass == null) {
          return this;
        }
        if (this.element == null) {
          var classIndex = this.cssClasses.indexOf(cssClass);
          if (addClass && classIndex === -1) {
            this.cssClasses.push(cssClass);
          } else if (!addClass && classIndex !== -1) {
            this.cssClasses.splice(classIndex, 1);
          }
        } else {
          this.element.classed(cssClass, addClass);
        }
        return this;
      }
    }

    /**
     * Sets or retrieves the Component's minimum height.
     *
     * @param {number} [newVal] The new value for the Component's minimum height, in pixels.
     * @return {number|Component} The current minimum height, or the calling Component (if newVal is not supplied).
     */
    public minimumHeight(): number;
    public minimumHeight(newVal: number): Component;
    public minimumHeight(newVal?: number): any {
      if (newVal != null) {
        this._minimumHeight = newVal;
        return this;
      } else {
        return this._minimumHeight;
      }
    }

    /**
     * Sets or retrieves the Component's minimum width.
     *
     * @param {number} [newVal] The new value for the Component's minimum width, in pixels.
     * @return {number|Component} The current minimum width, or the calling Component (if newVal is not supplied).
     */
    public minimumWidth(): number;
    public minimumWidth(newVal: number): Component;
    public minimumWidth(newVal?: number): any {
      if (newVal != null) {
        this._minimumWidth = newVal;
        return this;
      } else {
        return this._minimumWidth;
      }
    }

    /**
     * Checks if the Component has a fixed width or scales to fill available space.
     * Returns true by default on the base Component class.
     *
     * @return {boolean} Whether the component has a fixed width.
     */
    public isFixedWidth(): boolean {
      return this._fixedWidth;
    }

    /**
     * Checks if the Component has a fixed height or scales to fill available space.
     * Returns true by default on the base Component class.
     *
     * @return {boolean} Whether the component has a fixed height.
     */
    public isFixedHeight(): boolean {
      return this._fixedHeight;
    }

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
    public merge(c: Component): ComponentGroup {
      var cg: ComponentGroup;
      if (ComponentGroup.prototype.isPrototypeOf(c)) {
        cg = (<ComponentGroup> c);
        cg._addComponentToGroup(this, true);
        return cg;
      } else {
        cg = new ComponentGroup([this, c]);
        return cg;
      }
    }

    /**
     * Blow up a component and its DOM, so it can be safely removed
     */
    public remove() {
      d3.values(this.broadcastersCurrentlyListeningTo).forEach((b) => {
        b.deregisterListener(this);
      });
      this.hasBeenRemoved = true;
      this.element.remove();
      this.element = null;
    }
  }
}
