///<reference path="../reference.ts" />

module Plottable {
  export module Components {
    export class Alignment {
      static TOP = "top";
      static BOTTOM = "bottom";
      static LEFT = "left";
      static RIGHT = "right";
      static CENTER = "center";
    }
  }
  export class Component extends Core.PlottableObject {
    protected _element: D3.Selection;
    protected _content: D3.Selection;
    protected _boundingBox: D3.Selection;
    private _backgroundContainer: D3.Selection;
    private _foregroundContainer: D3.Selection;
    public clipPathEnabled = false;
    private _origin: Point = { x: 0, y: 0 }; // Origin of the coordinate space for the Component.

    private _parentElement: ComponentContainer;
    private _xAlignProportion = 0; // What % along the free space do we want to position (0 = left, .5 = center, 1 = right)
    private _yAlignProportion = 0;
    protected _fixedHeightFlag = false;
    protected _fixedWidthFlag = false;
    protected _isSetup = false;
    protected _isAnchored = false;

    private _interactionsToRegister: Interaction[] = [];
    private _boxes: D3.Selection[] = [];
    private _boxContainer: D3.Selection;
    private _rootSVG: D3.Selection;
    private _isTopLevelComponent = false;
    private _width: number; // Width and height of the component. Used to size the hitbox, bounding box, etc
    private _height: number;
    private _xOffset = 0; // Offset from Origin, used for alignment and floating positioning
    private _yOffset = 0;
    private _cssClasses: string[] = ["component"];
    private _destroyed = false;

    /**
     * Attaches the Component as a child of a given D3 Selection.
     *
     * @param {D3.Selection} selection The Selection containing the Element to anchor under.
     * @returns {Component} The calling Component.
     */
    public anchor(selection: D3.Selection) {
      if (this._destroyed) {
        throw new Error("Can't reuse remove()-ed components!");
      }

      if (selection.node().nodeName.toLowerCase() === "svg") {
        // svg node gets the "plottable" CSS class
        this._rootSVG = selection;
        this._rootSVG.classed("plottable", true);
        // visible overflow for firefox https://stackoverflow.com/questions/5926986/why-does-firefox-appear-to-truncate-embedded-svgs
        this._rootSVG.style("overflow", "visible");
        this._isTopLevelComponent = true;
      }

      if (this._element != null) {
        // reattach existing element
        selection.node().appendChild(this._element.node());
      } else {
        this._element = selection.append("g");
        this._setup();
      }
      this._isAnchored = true;
      return this;
    }

    /**
     * Creates additional elements as necessary for the Component to function.
     * Called during _anchor() if the Component's element has not been created yet.
     * Override in subclasses to provide additional functionality.
     */
    protected _setup() {
      if (this._isSetup) {
        return;
      }
      this._cssClasses.forEach((cssClass: string) => {
        this._element.classed(cssClass, true);
      });
      this._cssClasses = null;

      this._backgroundContainer = this._element.append("g").classed("background-container", true);
      this._addBox("background-fill", this._backgroundContainer);
      this._content = this._element.append("g").classed("content", true);
      this._foregroundContainer = this._element.append("g").classed("foreground-container", true);
      this._boxContainer = this._element.append("g").classed("box-container", true);

      if (this.clipPathEnabled) {
        this._generateClipPath();
      };

      this._boundingBox = this._addBox("bounding-box");

      this._interactionsToRegister.forEach((r) => this.registerInteraction(r));
      this._interactionsToRegister = null;
      this._isSetup = true;
    }

    public requestedSpace(availableWidth: number, availableHeight: number): _SpaceRequest {
      return {
        minWidth: 0,
        minHeight: 0
      };
    }

    /**
     * Computes the size, position, and alignment from the specified values.
     * If no parameters are supplied and the Component is a root node,
     * they are inferred from the size of the Component's element.
     *
     * @param {Point} origin Origin of the space offered to the Component.
     * @param {number} availableWidth
     * @param {number} availableHeight
     * @returns {Component} The calling Component.
     */
    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      if (origin == null || availableWidth == null || availableHeight == null) {
        if (this._element == null) {
          throw new Error("anchor() must be called before computeLayout()");
        } else if (this._isTopLevelComponent) {
          // we are the root node, retrieve height/width from root SVG
          origin = { x: 0, y: 0 };

          // Set width/height to 100% if not specified, to allow accurate size calculation
          // see http://www.w3.org/TR/CSS21/visudet.html#block-replaced-width
          // and http://www.w3.org/TR/CSS21/visudet.html#inline-replaced-height
          if (this._rootSVG.attr("width") == null) {
            this._rootSVG.attr("width", "100%");
          }
          if (this._rootSVG.attr("height") == null) {
            this._rootSVG.attr("height", "100%");
          }

          var elem: HTMLScriptElement = (<HTMLScriptElement> this._rootSVG.node());
          availableWidth  = Utils.DOM.getElementWidth(elem);
          availableHeight = Utils.DOM.getElementHeight(elem);
        } else {
          throw new Error("null arguments cannot be passed to computeLayout() on a non-root node");
        }
      }
      var size = this._getSize(availableWidth, availableHeight);
      this._width = size.width;
      this._height = size.height;
      this._origin = {
        x: origin.x + this._xOffset + (availableWidth - this.width()) * this._xAlignProportion,
        y: origin.y + this._yOffset + (availableHeight - this.height()) * this._yAlignProportion
      };
      this._element.attr("transform", "translate(" + this._origin.x + "," + this._origin.y + ")");
      this._boxes.forEach((b: D3.Selection) => b.attr("width", this.width()).attr("height", this.height()));
      return this;
    }

    protected _getSize(availableWidth: number, availableHeight: number) {
      var requestedSpace = this.requestedSpace(availableWidth, availableHeight);
      return {
        width: this.fixedWidth()  ? Math.min(availableWidth , requestedSpace.minWidth)  : availableWidth,
        height: this.fixedHeight() ? Math.min(availableHeight, requestedSpace.minHeight) : availableHeight
      };
    }

    /**
     * Queues the Component for rendering. Set immediately to true if the Component should be rendered
     * immediately as opposed to queued to the RenderController.
     *
     * @returns {Component} The calling Component
     */
    public render(immediately = false) {
      if (immediately) {
        this._render();
        return this;
      }
      if (this._isAnchored && this._isSetup && this.width() >= 0 && this.height() >= 0) {
        RenderController.registerToRender(this);
      }
      return this;
    }

    private _scheduleComputeLayout() {
      if (this._isAnchored && this._isSetup) {
        RenderController.registerToComputeLayout(this);
      }
    }

    protected _render() {/* overwrite */}

    /**
     * Causes the Component to recompute layout and redraw.
     *
     * This function should be called when CSS changes could influence the size
     * of the components, e.g. changing the font size.
     *
     * @returns {Component} The calling Component.
     */
    public redraw() {
      if (this._isAnchored && this._isSetup) {
        if (this._isTopLevelComponent) {
          this._scheduleComputeLayout();
        } else {
          this._parent().redraw();
        }
      }
      return this;
    }

    /**
     * Renders the Component into a given DOM element. The element must be as <svg>.
     *
     * @param {String|D3.Selection} element A D3 selection or a selector for getting the element to render into.
     * @returns {Component} The calling component.
     */
    public renderTo(element: String | D3.Selection): Component {
      this.detach();
      if (element != null) {
        var selection: D3.Selection;
        if (typeof(element) === "string") {
          selection = d3.select(<string> element);
        } else {
          selection = <D3.Selection> element;
        }
        if (!selection.node() || selection.node().nodeName.toLowerCase() !== "svg") {
          throw new Error("Plottable requires a valid SVG to renderTo");
        }
        this.anchor(selection);
      }
      if (this._element == null) {
        throw new Error("If a component has never been rendered before, then renderTo must be given a node to render to, \
          or a D3.Selection, or a selector string");
      }
      this.computeLayout();
      this.render();
      // flush so that consumers can immediately attach to stuff we create in the DOM
      RenderController.flush();
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
      if (alignment === Components.Alignment.LEFT) {
        this._xAlignProportion = 0;
      } else if (alignment === Components.Alignment.CENTER) {
        this._xAlignProportion = 0.5;
      } else if (alignment === Components.Alignment.RIGHT) {
        this._xAlignProportion = 1;
      } else {
        throw new Error("Unsupported alignment");
      }
      this.redraw();
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
      if (alignment === Components.Alignment.TOP) {
        this._yAlignProportion = 0;
      } else if (alignment === Components.Alignment.CENTER) {
        this._yAlignProportion = 0.5;
      } else if (alignment === Components.Alignment.BOTTOM) {
        this._yAlignProportion = 1;
      } else {
        throw new Error("Unsupported alignment");
      }
      this.redraw();
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
      this.redraw();
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
      this.redraw();
      return this;
    }

    private _addBox(className?: string, parentElement?: D3.Selection) {
      if (this._element == null) {
        throw new Error("Adding boxes before anchoring is currently disallowed");
      }
      parentElement = parentElement == null ? this._boxContainer : parentElement;
      var box = parentElement.append("rect");
      if (className != null) { box.classed(className, true); }

      this._boxes.push(box);
      if (this.width() != null && this.height() != null) {
        box.attr("width", this.width()).attr("height", this.height());
      }
      return box;
    }

    private _generateClipPath() {
      // The clip path will prevent content from overflowing its component space.
      // HACKHACK: IE <=9 does not respect the HTML base element in SVG.
      // They don't need the current URL in the clip path reference.
      var prefix = /MSIE [5-9]/.test(navigator.userAgent) ? "" : document.location.href;
      prefix = prefix.split("#")[0]; // To fix cases where an anchor tag was used
      var clipPathId = Utils.DOM.getUniqueClipPathId();
      this._element.attr("clip-path", "url(\"" + prefix + "#clipPath" + clipPathId + "\")");
      var clipPathParent = this._boxContainer.append("clipPath")
                                             .attr("id", "clipPath" + clipPathId);
      this._addBox("clip-rect", clipPathParent);
    }

    /**
     * Attaches an Interaction to the Component, so that the Interaction will listen for events on the Component.
     *
     * @param {Interaction} interaction The Interaction to attach to the Component.
     * @returns {Component} The calling Component.
     */
    public registerInteraction(interaction: Interaction) {
      // Interactions can be registered before or after anchoring. If registered before, they are
      // pushed to this._interactionsToRegister and registered during anchoring. If after, they are
      // registered immediately
      if (this._element) {
        interaction._anchor(this);
      } else {
        this._interactionsToRegister.push(interaction);
      }
      return this;
    }

    /**
     * Checks if the Component has a given CSS class.
     *
     * @param {string} cssClass The CSS class to check for.
     * @returns {boolean} Whether the Component has the given CSS class.
     */
    public classed(cssClass: string): boolean;
    /**
     * Adds/removes a given CSS class to/from the Component.
     *
     * @param {string} cssClass The CSS class to add or remove.
     * @param {boolean} addClass If true, adds the provided CSS class; otherwise, removes it.
     * @returns {Component} The calling Component.
     */
    public classed(cssClass: string, addClass: boolean): Component;
    public classed(cssClass: string, addClass?: boolean): any {
      if (addClass == null) {
        if (cssClass == null) {
          return false;
        } else if (this._element == null) {
          return (this._cssClasses.indexOf(cssClass) !== -1);
        } else {
          return this._element.classed(cssClass);
        }
      } else {
        if (cssClass == null) {
          return this;
        }
        if (this._element == null) {
          var classIndex = this._cssClasses.indexOf(cssClass);
          if (addClass && classIndex === -1) {
            this._cssClasses.push(cssClass);
          } else if (!addClass && classIndex !== -1) {
            this._cssClasses.splice(classIndex, 1);
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
    public fixedWidth(): boolean {
      return this._fixedWidthFlag;
    }

    /**
     * Checks if the Component has a fixed height or false if it grows to fill available space.
     * Returns false by default on the base Component class.
     *
     * @returns {boolean} Whether the component has a fixed height.
     */
    public fixedHeight(): boolean {
      return this._fixedHeightFlag;
    }

    public _merge(c: Component, below: boolean): Components.Group {
      var cg: Components.Group;
      if (Plottable.Components.Group.prototype.isPrototypeOf(c)) {
        cg = (<Plottable.Components.Group> c);
        cg.add(this, below);
        return cg;
      } else {
        var mergedComponents = below ? [this, c] : [c, this];
        cg = new Plottable.Components.Group(mergedComponents);
        return cg;
      }
    }

    /**
     * Merges this Component above another Component, returning a
     * ComponentGroup. This is used to layer Components on top of each other.
     *
     * There are four cases:
     * Component + Component: Returns a ComponentGroup with the first component after the second component.
     * ComponentGroup + Component: Returns the ComponentGroup with the Component prepended.
     * Component + ComponentGroup: Returns the ComponentGroup with the Component appended.
     * ComponentGroup + ComponentGroup: Returns a new ComponentGroup with the first group after the second group.
     *
     * @param {Component} c The component to merge in.
     * @returns {ComponentGroup} The relevant ComponentGroup out of the above four cases.
     */
    public above(c: Component): Components.Group {
      return this._merge(c, false);
    }

    /**
     * Merges this Component below another Component, returning a
     * ComponentGroup. This is used to layer Components on top of each other.
     *
     * There are four cases:
     * Component + Component: Returns a ComponentGroup with the first component before the second component.
     * ComponentGroup + Component: Returns the ComponentGroup with the Component appended.
     * Component + ComponentGroup: Returns the ComponentGroup with the Component prepended.
     * ComponentGroup + ComponentGroup: Returns a new ComponentGroup with the first group before the second group.
     *
     * @param {Component} c The component to merge in.
     * @returns {ComponentGroup} The relevant ComponentGroup out of the above four cases.
     */
    public below(c: Component): Components.Group {
      return this._merge(c, true);
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

      var parent: ComponentContainer = this._parent();

      if (parent != null) {
        parent.remove(this);
      }
      this._isAnchored = false;
      this._parentElement = null;
      return this;
    }

    public _parent(): ComponentContainer;
    public _parent(parentElement: ComponentContainer): any;
    public _parent(parentElement?: ComponentContainer): any {
      if (parentElement === undefined) {
        return this._parentElement;
      }

      this.detach();
      this._parentElement = parentElement;
    }

    /**
     * Removes a Component from the DOM and disconnects it from everything it's
     * listening to (effectively destroying it).
     */
    public destroy() {
      this._destroyed = true;
      this.detach();
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

    /**
     * Gets the origin of the Component relative to its parent.
     *
     * @return {Point} The x-y position of the Component relative to its parent.
     */
    public origin(): Point {
      return {
        x: this._origin.x,
        y: this._origin.y
      };
    }

    /**
     * Gets the origin of the Component relative to the root <svg>.
     *
     * @return {Point} The x-y position of the Component relative to the root <svg>
     */
    public originToSVG(): Point {
      var origin = this.origin();
      var ancestor = this._parent();
      while (ancestor != null) {
        var ancestorOrigin = ancestor.origin();
        origin.x += ancestorOrigin.x;
        origin.y += ancestorOrigin.y;
        ancestor = ancestor._parent();
      }
      return origin;
    }

    /**
     * Returns the foreground selection for the Component
     * (A selection covering the front of the Component)
     *
     * Will return undefined if the Component has not been anchored.
     *
     * @return {D3.Selection} foreground selection for the Component
     */
    public foreground(): D3.Selection {
      return this._foregroundContainer;
    }

    /**
     * Returns the content selection for the Component
     * (A selection containing the visual elements of the Component)
     *
     * Will return undefined if the Component has not been anchored.
     *
     * @return {D3.Selection} content selection for the Component
     */
    public content(): D3.Selection {
      return this._content;
    }

    /**
     * Returns the background selection for the Component
     * (A selection appearing behind of the Component)
     *
     * Will return undefined if the Component has not been anchored.
     *
     * @return {D3.Selection} background selection for the Component
     */
    public background(): D3.Selection {
      return this._backgroundContainer;
    }
  }
}
