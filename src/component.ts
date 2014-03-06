///<reference path="reference.ts" />

module Plottable {
  export class Component {
    private static clipPathId = 0; // Used for unique namespacing for the clipPaths
    public element: D3.Selection;
    private hitBox: D3.Selection;
    private interactionsToRegister: Interaction[] = [];
    private boxes: D3.Selection[] = [];
    private boxContainer: D3.Selection;
    public foregroundContainer: D3.Selection;
    public clipPathEnabled = false;

    public fixedWidthVal = true;
    public fixedHeightVal = true;
    private rowMinimumVal = 0;
    private colMinimumVal = 0;

    public availableWidth : number; // Width and height of the component. Used to size the hitbox, bounding box, etc
    public availableHeight: number;
    public xOrigin        : number; // Origin of the coordinate space for the component. Passed down from parent
    public yOrigin        : number;
    private xOffsetVal = 0; // Offset from Origin, used for alignment and floating positioning
    private yOffsetVal = 0;
    public xAlignProportion = 0; // What % along the free space do we want to position (0 = left, .5 = center, 1 = right)
    public yAlignProportion = 0;

    private cssClasses: string[] = ["component"];

    /**
     * Attaches the Component to a DOM element. Usually only directly invoked on root-level Components.
     * @param {D3.Selection} element A D3 selection consisting of the element to anchor to.
     * @returns {Component} The calling component.
     */
    public anchor(element: D3.Selection) {
      if (element.node().childNodes.length > 0) {
        throw new Error("Can't anchor to a non-empty element");
      }
      this.element = element;
      this.boxContainer = this.element.append("g").classed("box-container", true);
      this.foregroundContainer = this.element.append("g").classed("foreground-container", true);

      if (this.clipPathEnabled) {
        this.generateClipPath();
      };

      this.cssClasses.forEach((cssClass: string) => {
        this.element.classed(cssClass, true);
      });
      this.cssClasses = null;

      this.addBox("bounding-box");

      this.interactionsToRegister.forEach((r) => this.registerInteraction(r));
      this.interactionsToRegister = null;
      return this;
    }

    /**
     * Computes the size, position, and alignment from the specified values.
     * If no parameters are supplied and the component is a root node,
     * they are inferred from the size of the component's element.
     * @param {number} xOrigin
     * @param {number} yOrigin
     * @param {number} availableWidth
     * @param {number} availableHeight
     * @returns {Component} The calling Component.
     */
    public computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number) {
      if (xOrigin == null || yOrigin == null || availableWidth == null || availableHeight == null) {
        if (this.element == null) {
          throw new Error("anchor must be called before computeLayout");
        } else if (this.element.node().nodeName === "svg") {
          // we are the root node, let's guess width and height for convenience
          xOrigin = 0;
          yOrigin = 0;
          availableWidth  = parseFloat(this.element.attr("width" ));
          availableHeight = parseFloat(this.element.attr("height"));
        } else {
          throw new Error("null arguments cannot be passed to computeLayout() on a non-root (non-<svg>) node");
        }
      }
      this.xOrigin = xOrigin;
      this.yOrigin = yOrigin;
      var xPosition = this.xOrigin;
      var yPosition = this.yOrigin;

      if (this.colMinimum() !== 0 && this.isFixedWidth()) {
        // The component has free space, so it makes sense to think about how to position or offset it
        xPosition += (availableWidth - this.colMinimum()) * this.xAlignProportion;
        xPosition += this.xOffsetVal;
        // Decrease size so hitbox / bounding box and children are sized correctly
        availableWidth = availableWidth > this.colMinimum() ? this.colMinimum() : availableWidth;
      }

      if (this.rowMinimum() !== 0 && this.isFixedHeight()) {
        yPosition += (availableHeight - this.rowMinimum()) * this.yAlignProportion;
        yPosition += this.yOffsetVal;
        availableHeight = availableHeight > this.rowMinimum() ? this.rowMinimum() : availableHeight;
      }

      this.availableWidth  = availableWidth;
      this.availableHeight = availableHeight;
      this.element.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
      this.boxes.forEach((b: D3.Selection) => b.attr("width", this.availableWidth).attr("height", this.availableHeight));
      return this;
    }

    /**
     * Renders the component.
     * @returns {Component} The calling Component.
     */
    public render() {
      return this;
    }

    public renderTo(element: D3.Selection): Component {
      // When called on top-level-component, a shortcut for component.anchor(svg).computeLayout().render()
      if (this.element == null) {
        this.anchor(element);
      };
      if (this.element !== element) {
        throw new Error("Can't renderTo a different element than was anchored to");
      }
      this.computeLayout().render();
      return this;
    }
    /**
     * Sets the x alignment of the Component.
     * @param {string} alignment The x alignment of the Component (one of LEFT/CENTER/RIGHT).
     * @returns {Component} The calling Component.
     */
    public xAlign(alignment: string): Component {
      if (alignment === "LEFT") {
        this.xAlignProportion = 0;
      } else if (alignment === "CENTER") {
        this.xAlignProportion = 0.5;
      } else if (alignment === "RIGHT") {
        this.xAlignProportion = 1;
      } else {
        throw new Error("Unsupported alignment");
      }
      return this;
    }

    /**
     * Sets the y alignment of the Component.
     * @param {string} alignment The y alignment of the Component (one of TOP/CENTER/BOTTOM).
     * @returns {Component} The calling Component.
     */
    public yAlign(alignment: string): Component {
      if (alignment === "TOP") {
        this.yAlignProportion = 0;
      } else if (alignment === "CENTER") {
        this.yAlignProportion = 0.5;
      } else if (alignment === "BOTTOM") {
        this.yAlignProportion = 1;
      } else {
        throw new Error("Unsupported alignment");
      }
      return this;
    }

    /**
     * Sets the x offset of the Component.
     * @param {number} offset The desired x offset, in pixels.
     * @returns {Component} The calling Component.
     */
    public xOffset(offset: number): Component {
      this.xOffsetVal = offset;
      return this;
    }

    /**
     * Sets the y offset of the Component.
     * @param {number} offset The desired y offset, in pixels.
     * @returns {Component} The calling Component.
     */
    public yOffset(offset: number): Component {
      this.yOffsetVal = offset;
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
      var clipPathId = Component.clipPathId++;
      this.element.attr("clip-path", "url(#clipPath" + clipPathId + ")");
      var clipPathParent = this.element.append("clipPath")
                                      .attr("id", "clipPath" + clipPathId);
      this.addBox("clip-rect", clipPathParent);
    }

    /**
     * Attaches an Interaction to the Component, so that the Interaction will listen for events on the Component.
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
        interaction.anchor(this.hitBox);
      } else {
        this.interactionsToRegister.push(interaction);
      }
      return this;
    }

    /**
     * Adds/removes a given CSS class to/from the Component, or checks if the Component has a particular CSS class.
     * @param {string} cssClass The CSS class to add/remove/check for.
     * @param {boolean} [addClass] Whether to add or remove the CSS class. If not supplied, checks for the CSS class.
     * @return {boolean|Component} Whether the Component has the given CSS class, or the calling Component (if addClass is supplied).
     */
    public classed(cssClass: string): boolean;
    public classed(cssClass: string, addClass: boolean): Component;
    public classed(cssClass: string, addClass?:boolean): any {
      if (addClass == null) {
        if (this.element == null) {
          return (this.cssClasses.indexOf(cssClass) !== -1);
        } else {
          return this.element.classed(cssClass);
        }
      } else {
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
     * @param {number} [newVal] The new value for the Component's minimum height, in pixels.
     * @return {number|Component} The current minimum height, or the calling Component (if newVal is not supplied).
     */
    public rowMinimum(): number;
    public rowMinimum(newVal: number): Component;
    public rowMinimum(newVal?: number): any {
      if (newVal != null) {
        this.rowMinimumVal = newVal;
        return this;
      } else {
        return this.rowMinimumVal;
      }
    }

    /**
     * Sets or retrieves the Component's minimum width.
     * @param {number} [newVal] The new value for the Component's minimum width, in pixels.
     * @return {number|Component} The current minimum width, or the calling Component (if newVal is not supplied).
     */
    public colMinimum(): number;
    public colMinimum(newVal: number): Component;
    public colMinimum(newVal?: number): any {
      if (newVal != null) {
        this.colMinimumVal = newVal;
        return this;
      } else {
        return this.colMinimumVal;
      }
    }

    /**
     * Checks if the Component has a fixed width or scales to fill available space.
     * Returns true by default on the base Component class.
     * @return {boolean} Whether the component has a fixed width.
     */
    public isFixedWidth(): boolean {
      return this.fixedWidthVal;
    }

    /**
     * Checks if the Component has a fixed height or scales to fill available space.
     * Returns true by default on the base Component class.
     * @return {boolean} Whether the component has a fixed height.
     */
    public isFixedHeight(): boolean {
      return this.fixedHeightVal;
    }
  }
}
