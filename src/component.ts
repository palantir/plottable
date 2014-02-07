///<reference path="reference.ts" />

class Component {
  private static clipPathId = 0; // Used for unique namespacing for the clipPaths
  public element: D3.Selection;
  public hitBox: D3.Selection;
  private registeredInteractions: Interaction[] = [];
  private boxes: D3.Selection[] = [];

  private rowWeightVal  = 0;
  private colWeightVal  = 0;
  private rowMinimumVal = 0;
  private colMinimumVal = 0;

  public availableWidth : number;
  public availableHeight: number;
  private xOffset       : number;
  private yOffset       : number;

  private cssClasses: string[] = [];

  public xAlignment = "LEFT"; // LEFT, CENTER, RIGHT
  public yAlignment = "TOP"; // TOP, CENTER, BOTTOM

  public classed(cssClass: string): boolean;
  public classed(cssClass: string, addClass: boolean): Component;
  public classed(cssClass: string, addClass?:boolean): any {
    if (addClass == null) {
      if (this.element == null) {
        return (this.cssClasses.indexOf(cssClass) != -1);
      } else {
        return this.element.classed(cssClass);
      }
    } else {
      if (this.element == null) {
        var classIndex = this.cssClasses.indexOf(cssClass);
        if (addClass && classIndex == -1) {
          this.cssClasses.push(cssClass);
        } else if (!addClass && classIndex != -1) {
          this.cssClasses.splice(classIndex, 1);
        }
      } else {
        this.element.classed(cssClass, addClass);
      }
      return this;
    }
  }

  private addBox(className?: string, parentElement?: D3.Selection) {
    var parentElement = parentElement == null ? this.element : parentElement;
    var box = parentElement.append("rect");
    if (className != null) {box.classed(className, true)};
    this.boxes.push(box);
    return box;
  }

  public anchor(element: D3.Selection) {
    this.element = element;
    this.generateClipPath();
    this.cssClasses.forEach((cssClass: string) => {
      this.element.classed(cssClass, true);
    });
    this.cssClasses = null;

    this.hitBox = this.addBox("hit-box");
    this.addBox("bounding-box");

    this.registeredInteractions.forEach((r) => r.anchor(this.hitBox));
  }

  public generateClipPath() {
    // The clip path will prevent content from overflowing its component space.
    var clipPathId = Component.clipPathId++;
    this.element.attr("clip-path", "url(#clipPath" + clipPathId + ")");
    var clipPathParent = this.element.append("clipPath")
                                    .attr("id", "clipPath" + clipPathId);
    this.addBox("clip-rect", clipPathParent);
  }

  public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
    if (xOffset == null || yOffset == null || availableWidth == null || availableHeight == null) {
      if (this.element == null) {
        throw new Error("It's impossible to computeLayout before anchoring");
      } else if (this.element.node().nodeName === "svg") {
        // we are the root node, let's guess width and height for convenience
        xOffset = 0;
        yOffset = 0;
        availableWidth  = parseFloat(this.element.attr("width" ));
        availableHeight = parseFloat(this.element.attr("height"));
      } else {
        throw new Error("You need to pass non-null arguments when calling computeLayout on a non-root node");
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
          throw new Error("unsupported alignment");
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
          throw new Error("unsupported alignment");
      }
      availableWidth = this.colMinimum();
    }
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.availableWidth = availableWidth;
    this.availableHeight = availableHeight;
    this.element.attr("transform", "translate(" + this.xOffset + "," + this.yOffset + ")");
    this.boxes.forEach((b: D3.Selection) => b.attr("width", this.availableWidth).attr("height", this.availableHeight));
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

  public render() {
    //no-op
  }

  public zoom(translate, scale) {
    this.render(); // if not overwritten, a zoom event just causes the component to rerender
  }

  public rowWeight(): number;
  public rowWeight(newVal: number): Component;
  public rowWeight(newVal?: number): any {
    if (newVal != null) {
      this.rowWeightVal = newVal;
      chai.assert.operator(this.rowWeightVal, '>=', 0, "rowWeight is a reasonable number");
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
      chai.assert.operator(this.colWeightVal, '>=', 0, "colWeight is a reasonable number");
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
      chai.assert.operator(this.rowMinimumVal, '>=', 0, "rowMinimum is a reasonable number");
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
      chai.assert.operator(this.colMinimumVal, '>=', 0, "colMinimum is a reasonable number");
      return this;
    } else {
      return this.colMinimumVal;
    }
  }
}
