///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class Label extends Abstract.Component {
    private textContainer: D3.Selection;
    private _text: string; // text assigned to the Label; may not be the actual text displayed due to truncation
    private orientation: string;
    private measurer: _Util.Text.TextMeasurer;
    private xAlignment: string;
    private yAlignment: string;

    /**
     * Creates a Label.
     *
     * A label is component that renders just text. The most common use of
     * labels is to create a title or axis labels.
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
      this._fixedHeightFlag = true;
      this._fixedWidthFlag = true;
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
        width : desiredWidth,
        height: desiredHeight,
        wantsWidth : desiredWidth  > offeredWidth,
        wantsHeight: desiredHeight > offeredHeight
      };
    }

    public _setup() {
      super._setup();
      this.textContainer = this.content.append("g");
      this.measurer = _Util.Text.getTextMeasurer(this.textContainer.append("text"));
      this.text(this._text);
    }

    /**
     * Get the current text on the Label.
     *
     * @returns {string} the text on the label.
     */
    public text(): string;
    /**
     * Set the current text on the Label.
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
      this.textContainer.text("");
      var dimension = this.orientation === "horizontal" ? this.availableWidth : this.availableHeight;
      var truncatedText = _Util.Text.getTruncatedText(this._text, dimension, this.measurer);
      if (this.orientation === "horizontal") {
        _Util.Text.writeLineHorizontally(truncatedText, this.textContainer, this.availableWidth, this.availableHeight,
                                        this.xAlignment, this.yAlignment);
      } else {
        _Util.Text.writeLineVertically(truncatedText, this.textContainer, this.availableWidth, this.availableHeight,
                                        this.xAlignment, this.yAlignment, this.orientation);
      }
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
      this.measurer = _Util.Text.getTextMeasurer(this.textContainer.append("text")); // reset it in case fonts have changed
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      return this;
    }
  }

  export class TitleLabel extends Label {
    /**
     * Creates a TitleLabel, a type of label made for rendering titles.
     *
     * @constructor
     */
    constructor(text?: string, orientation?: string) {
      super(text, orientation);
      this.classed("title-label", true);
    }
  }

  /**
   * Creates a AxisLabel, a type of label made for rendering axis labels.
   *
   * @constructor
   */
  export class AxisLabel extends Label {
    constructor(text?: string, orientation?: string) {
      super(text, orientation);
      this.classed("axis-label", true);
    }
  }
}
}
