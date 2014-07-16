///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class Label extends Abstract.Component {
    private textContainer: D3.Selection;
    private _text: string; // text assigned to the Label; may not be the actual text displayed due to truncation
    private orientation: string;
    private measurer: Util.Text.TextMeasurer;
    private xAlignment: string;
    private yAlignment: string;

    /**
     * Creates a Label.
     *
     * @constructor
     * @param {string} [displayText] The text of the Label.
     * @param {string} [orientation] The orientation of the Label (horizontal/vertical-left/vertical-right).
     */
    constructor(displayText = "", orientation = "horizontal") {
      super();
      this.classed("label", true);
      this.text(displayText);
      orientation = orientation.toLowerCase();
      if (orientation === "vertical-left")  { orientation = "left" ; }
      if (orientation === "vertical-right") { orientation = "right"; }
      if (orientation === "horizontal" || orientation === "left" || orientation === "right") {
        this.orientation = orientation;
      } else {
        throw new Error(orientation + " is not a valid orientation for LabelComponent");
      }
      this.xAlign("center").yAlign("center");
    }

    public xAlign(alignment: string): Label {
      var alignmentLC = alignment.toLowerCase();
      super.xAlign(alignmentLC);
      this.xAlignment = alignmentLC;
      return this;
    }
    public yAlign(alignment: string): Label {
      var alignmentLC = alignment.toLowerCase();
      super.yAlign(alignmentLC);
      this.yAlignment = alignmentLC;
      return this;
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      var desiredWH = this.measurer(this._text);
      var desiredWidth  = (this.orientation === "horizontal" ? desiredWH.width : desiredWH.height);
      var desiredHeight = (this.orientation === "horizontal" ? desiredWH.height : desiredWH.width);

      return {
        width : Math.min(desiredWidth , offeredWidth),
        height: Math.min(desiredHeight, offeredHeight),
        wantsWidth : desiredWidth  > offeredWidth,
        wantsHeight: desiredHeight > offeredHeight
      };
    }

    public _setup() {
      super._setup();
      this.textContainer = this.content.append("g");
      this.measurer = Util.Text.getTextMeasure(this.textContainer);
      this.text(this._text);
      return this;
    }

    /**
     * Retrieve the current text on the Label.
     *
     * @returns {string} The text on the label.
     */
    public text(): string;
    /**
     * Sets the text on the Label.
     *
     * @param {string} displayText The new text for the Label.
     * @returns {Label} The calling Label.
     */
    public text(displayText: string): Label;
    public text(displayText?: string): any {
      if (displayText === undefined) {
        return this._text;
      } else {
        this._text = displayText;
        this._invalidateLayout();
        return this;
      }
    }

    public _doRender() {
      super._doRender();
      this.textContainer.selectAll("text").remove();
      var dimension = this.orientation === "horizontal" ? this.availableWidth : this.availableHeight;
      var truncatedText = Util.Text.getTruncatedText(this._text, dimension, this.measurer);
      if (this.orientation === "horizontal") {
        Util.Text.writeLineHorizontally(truncatedText, this.textContainer, this.availableWidth, this.availableHeight,
                                        this.xAlignment, this.yAlignment);
      } else {
        Util.Text.writeLineVertically(truncatedText, this.textContainer, this.availableWidth, this.availableHeight,
                                        this.xAlignment, this.yAlignment, this.orientation);
      }
      return this;
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this.measurer = Util.Text.getTextMeasure(this.textContainer); // reset it in case fonts have changed
      return this;
    }
  }

  export class TitleLabel extends Label {
    constructor(text?: string, orientation?: string) {
      super(text, orientation);
      this.classed("title-label", true);
    }
  }

  export class AxisLabel extends Label {
    constructor(text?: string, orientation?: string) {
      super(text, orientation);
      this.classed("axis-label", true);
    }
  }
}
}
