///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export class Component extends PlottableObject {
    public static AUTORESIZE_BY_DEFAULT = true;

    public _element: D3.Selection;
    public _content: D3.Selection;
    public _backgroundContainer: D3.Selection;
    public _foregroundContainer: D3.Selection;
    public clipPathEnabled = false;
    private xOrigin: number; // Origin of the coordinate space for the component. Passed down from parent
    private yOrigin: number;

    public _parent: ComponentContainer;
    public _xAlignProportion = 0; // What % along the free space do we want to position (0 = left, .5 = center, 1 = right)
    public _yAlignProportion = 0;
    public _fixedHeightFlag = false;
    public _fixedWidthFlag = false;
    public _isSetup = false;
    public _isAnchored = false;

    private hitBox: D3.Selection;
    private interactionsToRegister: Interaction[] = [];
    private boxes: D3.Selection[] = [];
    private boxContainer: D3.Selection;
    private rootSVG: D3.Selection;
    private isTopLevelComponent = false;
    private _width = 0; // Width and height of the component. Used to size the hitbox, bounding box, etc
    private _height = 0;
    private _xOffset = 0; // Offset from Origin, used for alignment and floating positioning
    private _yOffset = 0;
    private cssClasses: string[] = ["component"];
    private removed = false;

    /**
     * Attaches the Component as a child of a given a DOM element. Usually only directly invoked on root-level Components.
     *
     * @param {D3.Selection} element A D3 selection consisting of the element to anchor under.
     */
    public _anchor(element: D3.Selection) {
      if (this.removed) {
        throw new Error("Can't reuse remove()-ed components!");
      }

      if (element.node().nodeName === "svg") {
        // svg node gets the "plottable" CSS class
        this.rootSVG = element;
        this.rootSVG.classed("plottable", true);
        // visible overflow for firefox https://stackoverflow.com/questions/5926986/why-does-firefox-appear-to-truncate-embedded-svgs
        this.rootSVG.style("overflow", "visible");
        this.isTopLevelComponent = true;
      }

      if (this._element != null) {
        // reattach existing element
        element.node().appendChild(this._element.node());
      } else {
        this._element = element.append("g");
        this._setup();
      }
      this._isAnchored = true;
    }

    /**
     * Creates additional elements as necessary for the Component to function.
     * Called during _anchor() if the Component's element has not been created yet.
     * Override in subclasses to provide additional functionality.
     */
    public _setup() {
      if (this._isSetup) {
        return;
      }
      this.cssClasses.forEach((cssClass: string) => {
        this._element.classed(cssClass, true);
      });
      this.cssClasses = null;

      this._backgroundContainer = this._element.append("g").classed("background-container", true);
      this._content = this._element.append("g").classed("content", true);
      this._foregroundContainer = this._element.append("g").classed("foreground-container", true);
      this.boxContainer = this._element.append("g").classed("box-container", true);

      if (this.clipPathEnabled) {
        this.generateClipPath();
      };

      this.addBox("bounding-box");

      this.interactionsToRegister.forEach((r) => this.registerInteraction(r));
      this.interactionsToRegister = null;
      if (this.isTopLevelComponent) {
        this.autoResize(Component.AUTORESIZE_BY_DEFAULT);
      }
      this._isSetup = true;
    }

    public _requestedSpace(availableWidth : number, availableHeight: number): _ISpaceRequest {
      return {width: 0, height: 0, wantsWidth: false, wantsHeight: false};
    }

    /**
     * Computes the size, position, and alignment from the specified values.
     * If no parameters are supplied and the component is a root node,
     * they are inferred from the size of the component's element.
     *
     * @param {number} xOrigin x-coordinate of the origin of the component
     * @param {number} yOrigin y-coordinate of the origin of the component
     * @param {number} availableWidth available width for the component to render in
     * @param {number} availableHeight available height for the component to render in
     */
    public _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number) {
      if (xOrigin == null || yOrigin == null || availableWidth == null || availableHeight == null) {
        if (this._element == null) {
          throw new Error("anchor must be called before computeLayout");
        } else if (this.isTopLevelComponent) {
          // we are the root node, retrieve height/width from root SVG
          xOrigin = 0;
          yOrigin = 0;

          // Set width/height to 100% if not specified, to allow accurate size calculation
          // see http://www.w3.org/TR/CSS21/visudet.html#block-replaced-width
          // and http://www.w3.org/TR/CSS21/visudet.html#inline-replaced-height
          if (this.rootSVG.attr("width") == null) {
            this.rootSVG.attr("width", "100%");
          }
          if (this.rootSVG.attr("height") == null) {
            this.rootSVG.attr("height", "100%");
          }

          var elem: HTMLScriptElement = (<HTMLScriptElement> this.rootSVG.node());
          availableWidth  = _Util.DOM.getElementWidth(elem);
          availableHeight = _Util.DOM.getElementHeight(elem);
        } else {
          throw new Error("null arguments cannot be passed to _computeLayout() on a non-root node");
        }
      }
      this.xOrigin = xOrigin;
      this.yOrigin = yOrigin;
      var xPosition = this.xOrigin;
      var yPosition = this.yOrigin;

      var requestedSpace = this._requestedSpace(availableWidth , availableHeight);

      xPosition += (availableWidth  - requestedSpace.width) * this._xAlignProportion;
      xPosition += this._xOffset;
      if (this._isFixedWidth()) {
        // Decrease size so hitbox / bounding box and children are sized correctly
        availableWidth  = Math.min(availableWidth , requestedSpace.width);
      }

      yPosition += (availableHeight - requestedSpace.height) * this._yAlignProportion;
      yPosition += this._yOffset;
      if (this._isFixedHeight()) {
        availableHeight = Math.min(availableHeight, requestedSpace.height);
      }

      this._width  = availableWidth;
      this._height = availableHeight;
      this._element.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
      this.boxes.forEach((b: D3.Selection) => b.attr("width", this.width()).attr("height", this.height()));
    }

    /**
     * Renders the component.
     */
    public _render() {
      if (this._isAnchored && this._isSetup) {
        Core.RenderController.registerToRender(this);
      }
    }

    public _scheduleComputeLayout() {
      if (this._isAnchored && this._isSetup) {
        Core.RenderController.registerToComputeLayout(this);
      }
    }

    public _doRender() {
      //no-op
    }


    public _invalidateLayout() {
      if (this._isAnchored && this._isSetup) {
        if (this.isTopLevelComponent) {
          this._scheduleComputeLayout();
        } else {
          this._parent._invalidateLayout();
        }
      }
    }

    /**
     * Renders the Component into a given DOM element. The element must be as <svg>.
     *
     * @param {String|D3.Selection} element A D3 selection or a selector for getting the element to render into.
     * @returns {Component} The calling component.
     */
    public renderTo(selector: String): Component;
    public renderTo(element: D3.Selection): Component;
    public renderTo(element: any): Component {
      if (element != null) {
        var selection: D3.Selection;
        if (typeof(element.node) === "function") {
          selection = (<D3.Selection> element);
        } else {
          selection = d3.select(element);
        }
        this._anchor(selection);
      }
      this._computeLayout();
      this._render();
      return this;
    }

    /**
     * Causes the Component to recompute layout and redraw. If passed arguments, will resize the root SVG it lives in.
     *
     * This function should be called when CSS changes could influence the size
     * of the components, e.g. changing the font size.
     *
     * @param {number} [availableWidth]  - the width of the container element
     * @param {number} [availableHeight] - the height of the container element
     * @returns {Component} The calling component.
     */
    public resize(width?: number, height?: number): Component {
      if (!this.isTopLevelComponent) {
        throw new Error("Cannot resize on non top-level component");
      }
      if (width != null && height != null && this._isAnchored) {
        this.rootSVG.attr({width: width, height: height});
      }
      this._invalidateLayout();
      return this;
    }

    /**
     * Enables or disables resize on window resizes.
     *
     * If enabled, window resizes will enqueue this component for a re-layout
     * and re-render. Animations are disabled during window resizes when auto-
     * resize is enabled.
     *
     * @param {boolean} flag Enable (true) or disable (false) auto-resize.
     * @returns {Component} The calling component.
     */
    public autoResize(flag: boolean): Component {
      if (flag) {
        Core.ResizeBroadcaster.register(this);
      } else {
        Core.ResizeBroadcaster.deregister(this);
      }
      return this;
    }

    /**
     * Sets the x alignment of the Component. This will be used if the
     * Component is given more space than it needs.
     *
     * For example, you may want to make a Legend postition itself it the top
     * right, so you would call `legend.xAlign("right")` and
     * `legend.yAlign("top")`.
     *
     * @param {string} alignment The x alignment of the Component (one of ["left", "center", "right"]).
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
      this._invalidateLayout();
      return this;
    }

    /**
     * Sets the y alignment of the Component. This will be used if the
     * Component is given more space than it needs.
     *
     * For example, you may want to make a Legend postition itself it the top
     * right, so you would call `legend.xAlign("right")` and
     * `legend.yAlign("top")`.
     *
     * @param {string} alignment The x alignment of the Component (one of ["top", "center", "bottom"]).
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
      this._invalidateLayout();
      return this;
    }

    /**
     * Sets the x offset of the Component. This will be used if the Component
     * is given more space than it needs.
     *
     * @param {number} offset The desired x offset, in pixels, from the left
     * side of the container.
     * @returns {Component} The calling Component.
     */
    public xOffset(offset: number): Component {
      this._xOffset = offset;
      this._invalidateLayout();
      return this;
    }

    /**
     * Sets the y offset of the Component. This will be used if the Component
     * is given more space than it needs.
     *
     * @param {number} offset The desired y offset, in pixels, from the top
     * side of the container.
     * @returns {Component} The calling Component.
     */
    public yOffset(offset: number): Component {
      this._yOffset = offset;
      this._invalidateLayout();
      return this;
    }

    private addBox(className?: string, parentElement?: D3.Selection) {
      if (this._element == null) {
        throw new Error("Adding boxes before anchoring is currently disallowed");
      }
      var parentElement = parentElement == null ? this.boxContainer : parentElement;
      var box = parentElement.append("rect");
      if (className != null) {box.classed(className, true);};

      this.boxes.push(box);
      if (this.width() != null && this.height() != null) {
        box.attr("width", this.width()).attr("height", this.height());
      }
      return box;
    }

    private generateClipPath() {
      // The clip path will prevent content from overflowing its component space.
      // HACKHACK: IE <=9 does not respect the HTML base element in SVG.
      // They don't need the current URL in the clip path reference.
      var prefix = /MSIE [5-9]/.test(navigator.userAgent) ? "" : document.location.href;
      this._element.attr("clip-path", "url(" + prefix + "#clipPath" + this._plottableID + ")");
      var clipPathParent = this.boxContainer.append("clipPath")
                                      .attr("id", "clipPath" + this._plottableID);
      this.addBox("clip-rect", clipPathParent);
    }

    /**
     * Attaches an Interaction to the Component, so that the Interaction will listen for events on the Component.
     *
     * @param {Interaction} interaction The Interaction to attach to the Component.
     * @returns {Component} The calling Component.
     */
    public registerInteraction(interaction: Interaction) {
      // Interactions can be registered before or after anchoring. If registered before, they are
      // pushed to this.interactionsToRegister and registered during anchoring. If after, they are
      // registered immediately
      if (this._element != null) {
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


    /**
     * Adds/removes a given CSS class to/from the Component, or checks if the Component has a particular CSS class.
     *
     * @param {string} cssClass The CSS class to add/remove/check for.
     * @param {boolean} addClass Whether to add or remove the CSS class. If not supplied, checks for the CSS class.
     * @returns {boolean|Component} Whether the Component has the given CSS class, or the calling Component (if addClass is supplied).
     */
    public classed(cssClass: string): boolean;
    public classed(cssClass: string, addClass: boolean): Component;
    public classed(cssClass: string, addClass?: boolean): any {
      if (addClass == null) {
        if (cssClass == null) {
          return false;
        } else if (this._element == null) {
          return (this.cssClasses.indexOf(cssClass) !== -1);
        } else {
          return this._element.classed(cssClass);
        }
      } else {
        if (cssClass == null) {
          return this;
        }
        if (this._element == null) {
          var classIndex = this.cssClasses.indexOf(cssClass);
          if (addClass && classIndex === -1) {
            this.cssClasses.push(cssClass);
          } else if (!addClass && classIndex !== -1) {
            this.cssClasses.splice(classIndex, 1);
          }
        } else {
          this._element.classed(cssClass, addClass);
        }
        return this;
      }
    }

    /**
     * Checks if the Component has a fixed width or false if it grows to fill available space.
     * Returns false by default on the base Component class.
     *
     * @returns {boolean} Whether the component has a fixed width.
     */
    public _isFixedWidth(): boolean {
      return this._fixedWidthFlag;
    }

    /**
     * Checks if the Component has a fixed height or false if it grows to fill available space.
     * Returns false by default on the base Component class.
     *
     * @returns {boolean} Whether the component has a fixed height.
     */
    public _isFixedHeight(): boolean {
      return this._fixedHeightFlag;
    }

    /**
     * Merges this Component with another Component, returning a
     * ComponentGroup. This is used to layer Components on top of each other.
     *
     * There are four cases:
     * Component + Component: Returns a ComponentGroup with both components inside it.
     * ComponentGroup + Component: Returns the ComponentGroup with the Component appended.
     * Component + ComponentGroup: Returns the ComponentGroup with the Component prepended.
     * ComponentGroup + ComponentGroup: Returns a new ComponentGroup with two ComponentGroups inside it.
     *
     * @param {Component} c The component to merge in.
     * @returns {ComponentGroup} The relevant ComponentGroup out of the above four cases.
     */
    public merge(c: Component): Component.Group {
      var cg: Component.Group;
      if (this._isSetup || this._isAnchored) {
        throw new Error("Can't presently merge a component that's already been anchored");
      }
      if (Plottable.Component.Group.prototype.isPrototypeOf(c)) {
        cg = (<Plottable.Component.Group> c);
        cg._addComponent(this, true);
        return cg;
      } else {
        cg = new Plottable.Component.Group([this, c]);
        return cg;
      }
    }

    /**
     * Detaches a Component from the DOM. The component can be reused.
     *
     * This should only be used if you plan on reusing the calling
     * Components. Otherwise, use remove().
     *
     * @returns The calling Component.
     */
    public detach() {
      if (this._isAnchored) {
        this._element.remove();
      }
      if (this._parent != null) {
        this._parent._removeComponent(this);
      }
      this._isAnchored = false;
      this._parent = null;
      return this;
    }

    /**
     * Removes a Component from the DOM and disconnects it from everything it's
     * listening to (effectively destroying it).
     */
    public remove() {
      this.removed = true;
      this.detach();
      Core.ResizeBroadcaster.deregister(this);
    }

    /**
     * Return the width of the component
     *
     * @return {number} width of the component
     */
    public width(): number {
      return this._width;
    }

    /**
     * Return the height of the component
     *
     * @return {number} height of the component
     */
    public height(): number {
      return this._height;
    }

  }
}
}
