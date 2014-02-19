///<reference path="reference.ts" />

class Component {
  private static clipPathId = 0; // Used for unique namespacing for the clipPaths
  public element: D3.Selection;
  public hitBox: D3.Selection;
  private registeredInteractions: Interaction[] = [];
  private boxes: D3.Selection[] = [];
  public clipPathEnabled = false;

  private rowWeightVal  = 0;
  private colWeightVal  = 0;
  private rowMinimumVal = 0;
  private colMinimumVal = 0;

  public availableWidth : number;
  public availableHeight: number;
  public xOffset       : number;
  public yOffset       : number;

  private cssClasses: string[] = ["component"];

  public xAlignment = "LEFT"; // LEFT, CENTER, RIGHT
  public yAlignment = "TOP"; // TOP, CENTER, BOTTOM

  public anchor(element: D3.Selection) {
    if (element.node().childNodes.length > 0) {
      throw new Error("Can't anchor to a non-empty element");
    }
    this.element = element;
    if (this.clipPathEnabled) {this.generateClipPath();};
    this.cssClasses.forEach((cssClass: string) => {
      this.element.classed(cssClass, true);
    });
    this.cssClasses = null;

    this.hitBox = this.addBox("hit-box");
    this.addBox("bounding-box");

    this.hitBox.style("fill", "#ffffff").style("opacity", 0); // We need to set these so Chrome will register events
    this.registeredInteractions.forEach((r) => r.anchor(this.hitBox));
    return this;
  }

  public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
    if (xOffset == null || yOffset == null || availableWidth == null || availableHeight == null) {
      if (this.element == null) {
        throw new Error("anchor must be called before computeLayout");
      } else if (this.element.node().nodeName === "svg") {
        // we are the root node, let's guess width and height for convenience
        xOffset = 0;
        yOffset = 0;
        availableWidth  = parseFloat(this.element.attr("width" ));
        availableHeight = parseFloat(this.element.attr("height"));
      } else {
        throw new Error("null arguments cannot be passed to computeLayout() on a non-root (non-<svg>) node");
      }
    }
    if (this.rowWeight() === 0 && this.rowMinimum() !== 0) {
      switch (this.yAlignment) {
        case "TOP":
          break;
        case "CENTER":
          yOffset += (availableHeight - this.rowMinimum()) / 2;
          break;
        case "BOTTOM":
          yOffset += availableHeight - this.rowMinimum();
          break;
        default:
          throw new Error(this.yAlignment + " is not a supported alignment");
      }
      availableHeight = this.rowMinimum();
    }
    if (this.colWeight() === 0 && this.colMinimum() !== 0) {
      switch (this.xAlignment) {
        case "LEFT":
          break;
        case "CENTER":
          xOffset += (availableWidth - this.colMinimum()) / 2;
          break;
        case "RIGHT":
          xOffset += availableWidth - this.colMinimum();
          break;
        default:
          throw new Error(this.xAlignment + " is not a supported alignment");
      }
      availableWidth = this.colMinimum();
    }
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.availableWidth = availableWidth;
    this.availableHeight = availableHeight;
    this.element.attr("transform", "translate(" + this.xOffset + "," + this.yOffset + ")");
    this.boxes.forEach((b: D3.Selection) => b.attr("width", this.availableWidth).attr("height", this.availableHeight));
    return this;
  }

  public render() {
    return this;
  }

  private addBox(className?: string, parentElement?: D3.Selection) {
    if (this.element == null) {
      throw new Error("Adding boxes before anchoring is currently disallowed");
    }
    var parentElement = parentElement == null ? this.element : parentElement;
    var box = parentElement.append("rect");
    if (className != null) {box.classed(className, true);};
    this.boxes.push(box);
    if (this.availableWidth != null && this.availableHeight != null) {
      box.attr("width", this.availableWidth).attr("height", this.availableHeight);
    }
    return box;
  }

  public generateClipPath() {
    // The clip path will prevent content from overflowing its component space.
    var clipPathId = Component.clipPathId++;
    this.element.attr("clip-path", "url(#clipPath" + clipPathId + ")");
    var clipPathParent = this.element.append("clipPath")
                                    .attr("id", "clipPath" + clipPathId);
    this.addBox("clip-rect", clipPathParent);
  }

  public registerInteraction(interaction: Interaction) {
    // Interactions can be registered before or after anchoring. If registered before, they are
    // pushed to this.registeredInteractions and registered during anchoring. If after, they are
    // registered immediately
    this.registeredInteractions.push(interaction);
    if (this.element != null) {
      interaction.anchor(this.hitBox);
    }
  }

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

  public rowWeight(): number;
  public rowWeight(newVal: number): Component;
  public rowWeight(newVal?: number): any {
    if (newVal != null) {
      this.rowWeightVal = newVal;
      chai.assert.operator(this.rowWeightVal, ">=", 0, "rowWeight is a reasonable number");
      return this;
    } else {
      return this.rowWeightVal;
    }
  }

  public colWeight(): number;
  public colWeight(newVal: number): Component;
  public colWeight(newVal?: number): any {
    if (newVal != null) {
      this.colWeightVal = newVal;
      chai.assert.operator(this.colWeightVal, ">=", 0, "colWeight is a reasonable number");
      return this;
    } else {
      return this.colWeightVal;
    }
  }

  public rowMinimum(): number;
  public rowMinimum(newVal: number): Component;
  public rowMinimum(newVal?: number): any {
    if (newVal != null) {
      this.rowMinimumVal = newVal;
      chai.assert.operator(this.rowMinimumVal, ">=", 0, "rowMinimum is a reasonable number");
      return this;
    } else {
      return this.rowMinimumVal;
    }
  }

  public colMinimum(): number;
  public colMinimum(newVal: number): Component;
  public colMinimum(newVal?: number): any {
    if (newVal != null) {
      this.colMinimumVal = newVal;
      chai.assert.operator(this.colMinimumVal, ">=", 0, "colMinimum is a reasonable number");
      return this;
    } else {
      return this.colMinimumVal;
    }
  }
}
