///<reference path="../reference.ts" />

module Plottable {
  export class Component extends Core.PlottableObject {
    protected element: D3.Selection;
    protected _content: D3.Selection;
    protected boundingBox: D3.Selection;
    private backgroundContainer: D3.Selection;
    private foregroundContainer: D3.Selection;
    public clipPathEnabled = false;
    private xOrigin: number; // Origin of the coordinate space for the component. Passed down from parent
    private yOrigin: number;

    private _parentElement: ComponentContainer;
    private xAlignProportion = 0; // What % along the free space do we want to position (0 = left, .5 = center, 1 = right)
    private yAlignProportion = 0;
    protected fixedHeightFlag = false;
    protected fixedWidthFlag = false;
    protected isSetup = false;
    protected isAnchored = false;

    private _hitBox: D3.Selection;
    private interactionsToRegister: Interaction[] = [];
    private boxes: D3.Selection[] = [];
    private boxContainer: D3.Selection;
    private rootSVG: D3.Selection;
    private isTopLevelComponent = false;
    private _width: number; // Width and height of the component. Used to size the hitbox, bounding box, etc
    private _height: number;
    private _xOffset = 0; // Offset from Origin, used for alignment and floating positioning
    private _yOffset = 0;
    private cssClasses: string[] = ["component"];
    private removed = false;
    private usedLastLayout = false;

    /**
     * Attaches the Component as a child of a given a DOM element. Usually only directly invoked on root-level Components.
     *
     * @param {D3.Selection} element A D3 selection consisting of the element to anchor under.
     */
    public anchor(element: D3.Selection) {
      if (this.removed) {
        throw new Error("Can't reuse remove()-ed components!");
      }

      if (element.node().nodeName.toLowerCase() === "svg") {
        // svg node gets the "plottable" CSS class
        this.rootSVG = element;
        this.rootSVG.classed("plottable", true);
        // visible overflow for firefox https://stackoverflow.com/questions/5926986/why-does-firefox-appear-to-truncate-embedded-svgs
        this.rootSVG.style("overflow", "visible");
        this.isTopLevelComponent = true;
      }

      if (this.element != null) {
        // reattach existing element
        element.node().appendChild(this.element.node());
      } else {
        this.element = element.append("g");
        this.setup();
      }
      this.isAnchored = true;
    }

    /**
     * Creates additional elements as necessary for the Component to function.
     * Called during anchor() if the Component's element has not been created yet.
     * Override in subclasses to provide additional functionality.
     */
    protected setup() {
      if (this.isSetup) {
        return;
      }
      this.cssClasses.forEach((cssClass: string) => {
        this.element.classed(cssClass, true);
      });
      this.cssClasses = null;

      this.backgroundContainer = this.element.append("g").classed("background-container", true);
      this.addBox("background-fill", this.backgroundContainer);
      this._content = this.element.append("g").classed("content", true);
      this.foregroundContainer = this.element.append("g").classed("foreground-container", true);
      this.boxContainer = this.element.append("g").classed("box-container", true);

      if (this.clipPathEnabled) {
        this.generateClipPath();
      };

      this.boundingBox = this.addBox("bounding-box");

      this.interactionsToRegister.forEach((r) => this.registerInteraction(r));
      this.interactionsToRegister = null;
      this.isSetup = true;
    }

    public requestedSpace(availableWidth: number, availableHeight: number): SpaceRequest {
      return {width: 0, height: 0, wantsWidth: false, wantsHeight: false};
    }

    /**
     * Computes the size, position, and alignment from the specified values.
     * If no parameters are supplied and the Component is a root node,
     * they are inferred from the size of the Component's element.
     *
     * @param {number} offeredXOrigin x-coordinate of the origin of the space offered the Component
     * @param {number} offeredYOrigin y-coordinate of the origin of the space offered the Component
     * @param {number} availableWidth available width for the Component to render in
     * @param {number} availableHeight available height for the Component to render in
     */
    public computeLayout(offeredXOrigin?: number, offeredYOrigin?: number, availableWidth?: number, availableHeight?: number) {
      if (offeredXOrigin == null || offeredYOrigin == null || availableWidth == null || availableHeight == null) {
        if (this.element == null) {
          throw new Error("anchor must be called before computeLayout");
        } else if (this.isTopLevelComponent) {
          // we are the root node, retrieve height/width from root SVG
          offeredXOrigin = 0;
          offeredYOrigin = 0;

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
          availableWidth  = Utils.DOM.getElementWidth(elem);
          availableHeight = Utils.DOM.getElementHeight(elem);
        } else {
          throw new Error("null arguments cannot be passed to _computeLayout() on a non-root node");
        }
      }
      var size = this.getSize(availableWidth, availableHeight);
      this._width = size.width;
      this._height = size.height;
      this.xOrigin = offeredXOrigin + this._xOffset + (availableWidth - this.width()) * this.xAlignProportion;
      this.yOrigin = offeredYOrigin + this._yOffset + (availableHeight - this.height()) * this.yAlignProportion;
      this.element.attr("transform", "translate(" + this.xOrigin + "," + this.yOrigin + ")");
      this.boxes.forEach((b: D3.Selection) => b.attr("width", this.width()).attr("height", this.height()));
    }

    protected getSize(availableWidth: number, availableHeight: number) {
      var requestedSpace = this.requestedSpace(availableWidth, availableHeight);
      return {
        width: this.isFixedWidth()  ? Math.min(availableWidth , requestedSpace.width)  : availableWidth,
        height: this.isFixedHeight() ? Math.min(availableHeight, requestedSpace.height) : availableHeight
      };
    }

    public render() {
      if (this.isAnchored && this.isSetup && this.width() >= 0 && this.height() >= 0) {
        Core.RenderControllers.registerToRender(this);
      }
    }

    private scheduleComputeLayout() {
      if (this.isAnchored && this.isSetup) {
        Core.RenderControllers.registerToComputeLayout(this);
      }
    }

    public _doRender() {/* overwrite */}

    public _useLastCalculatedLayout(): boolean;
    public _useLastCalculatedLayout(useLast: boolean): Component;
    public _useLastCalculatedLayout(useLast?: boolean): any {
      if (useLast == null) {
        return this.usedLastLayout;
      } else {
        this.usedLastLayout = useLast;
        return this;
      }
    }

    public invalidateLayout() {
      this._useLastCalculatedLayout(false);
      if (this.isAnchored && this.isSetup) {
        if (this.isTopLevelComponent) {
          this.scheduleComputeLayout();
        } else {
          this.parent().invalidateLayout();
        }
      }
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
      if (this.element == null) {
        throw new Error("If a component has never been rendered before, then renderTo must be given a node to render to, \
          or a D3.Selection, or a selector string");
      }
      this.computeLayout();
      this.render();
      // flush so that consumers can immediately attach to stuff we create in the DOM
      Core.RenderControllers.flush();
      return this;
    }

    /**
     * Causes the Component to recompute layout and redraw.
     *
     * This function should be called when CSS changes could influence the size
     * of the components, e.g. changing the font size.
     *
     * @returns {Component} The calling component.
     */
    public redraw(): Component {
      this.invalidateLayout();
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
        this.xAlignProportion = 0;
      } else if (alignment === "center") {
        this.xAlignProportion = 0.5;
      } else if (alignment === "right") {
        this.xAlignProportion = 1;
      } else {
        throw new Error("Unsupported alignment");
      }
      this.invalidateLayout();
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
        this.yAlignProportion = 0;
      } else if (alignment === "center") {
        this.yAlignProportion = 0.5;
      } else if (alignment === "bottom") {
        this.yAlignProportion = 1;
      } else {
        throw new Error("Unsupported alignment");
      }
      this.invalidateLayout();
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
      this.invalidateLayout();
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
      this.invalidateLayout();
      return this;
    }

    private addBox(className?: string, parentElement?: D3.Selection) {
      if (this.element == null) {
        throw new Error("Adding boxes before anchoring is currently disallowed");
      }
      parentElement = parentElement == null ? this.boxContainer : parentElement;
      var box = parentElement.append("rect");
      if (className != null) { box.classed(className, true); }

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
      prefix = prefix.split("#")[0]; // To fix cases where an anchor tag was used
      this.element.attr("clip-path", "url(\"" + prefix + "#clipPath" + this.getID() + "\")");
      var clipPathParent = this.boxContainer.append("clipPath")
                                      .attr("id", "clipPath" + this.getID());
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
      // pushed to this._interactionsToRegister and registered during anchoring. If after, they are
      // registered immediately
      if (this.element) {
        if (!this._hitBox && interaction._requiresHitbox()) {
            this._hitBox = this.addBox("hit-box");
            this._hitBox.style("fill", "#ffffff").style("opacity", 0); // We need to set these so Chrome will register events
        }
        interaction.anchor(this, this._hitBox);
      } else {
        this.interactionsToRegister.push(interaction);
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
     * Checks if the Component has a fixed width or false if it grows to fill available space.
     * Returns false by default on the base Component class.
     *
     * @returns {boolean} Whether the component has a fixed width.
     */
    public isFixedWidth(): boolean {
      return this.fixedWidthFlag;
    }

    /**
     * Checks if the Component has a fixed height or false if it grows to fill available space.
     * Returns false by default on the base Component class.
     *
     * @returns {boolean} Whether the component has a fixed height.
     */
    public isFixedHeight(): boolean {
      return this.fixedHeightFlag;
    }

    public merge(c: Component, below: boolean): Components.Group {
      var cg: Components.Group;
      if (Plottable.Components.Group.prototype.isPrototypeOf(c)) {
        cg = (<Plottable.Components.Group> c);
        cg._addComponent(this, below);
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
      return this.merge(c, false);
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
      return this.merge(c, true);
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
      if (this.isAnchored) {
        this.element.remove();
      }

      var parent: ComponentContainer = this.parent();

      if (parent != null) {
        parent._removeComponent(this);
      }
      this.isAnchored = false;
      this._parentElement = null;
      return this;
    }

    public parent(): ComponentContainer;
    public parent(parentElement: ComponentContainer): any;
    public parent(parentElement?: ComponentContainer): any {
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
    public remove() {
      this.removed = true;
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
        x: this.xOrigin,
        y: this.yOrigin
      };
    }

    /**
     * Gets the origin of the Component relative to the root <svg>.
     *
     * @return {Point} The x-y position of the Component relative to the root <svg>
     */
    public originToSVG(): Point {
      var origin = this.origin();
      var ancestor = this.parent();
      while (ancestor != null) {
        var ancestorOrigin = ancestor.origin();
        origin.x += ancestorOrigin.x;
        origin.y += ancestorOrigin.y;
        ancestor = ancestor.parent();
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
      return this.foregroundContainer;
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
      return this.backgroundContainer;
    }

    /**
     * Returns the hitbox selection for the component
     * (A selection in front of the foreground used mainly for interactions)
     *
     * Will return undefined if the component has not been anchored
     *
     * @return {D3.Selection} hitbox selection for the component
     */
    public hitBox(): D3.Selection {
      return this._hitBox;
    }
  }
}
