///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class Label extends AbstractComponent {
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
     * @param {string} displayText The text of the Label (default = "").
     * @param {string} orientation The orientation of the Label (horizontal/left/right) (default = "horizontal").
     */
    constructor(displayText = "", orientation = "horizontal") {
      super();
      this.classed("label", true);
      this.text(displayText);
      this.orient(orientation);
      this.xAlign("center").yAlign("center");
      this._fixedHeightFlag = true;
      this._fixedWidthFlag = true;
    }

    /**
     * Sets the horizontal side the label will go to given the label is given more space that it needs
     *
     * @param {string} alignment The new setting, one of `["left", "center",
     * "right"]`. Defaults to `"center"`.
     * @returns {Label} The calling Label.
     */
    public xAlign(alignment: string): Label {
      var alignmentLC = alignment.toLowerCase();
      super.xAlign(alignmentLC);
      this.xAlignment = alignmentLC;
      return this;
    }

    /**
     * Sets the vertical side the label will go to given the label is given more space that it needs
     *
     * @param {string} alignment The new setting, one of `["top", "center",
     * "bottom"]`. Defaults to `"center"`.
     * @returns {Label} The calling Label.
     */
    public yAlign(alignment: string): Label {
      var alignmentLC = alignment.toLowerCase();
      super.yAlign(alignmentLC);
      this.yAlignment = alignmentLC;
      return this;
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest {
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
      this.textContainer = this._content.append("g");
      this.measurer = _Util.Text.getTextMeasurer(this.textContainer.append("text"));
      this.text(this._text);
    }

    /**
     * Gets the current text on the Label.
     *
     * @returns {string} the text on the label.
     */
    public text(): string;
    /**
     * Sets the current text on the Label.
     *
     * @param {string} displayText If provided, the new text for the Label.
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

    /**
     * Gets the orientation of the Label.
     *
     * @returns {string} the current orientation.
     */
    public orient(): string;
    /**
     * Sets the orientation of the Label.
     *
     * @param {string} newOrientation If provided, the desired orientation
     * (horizontal/left/right).
     * @returns {Label} The calling Label.
     */
    public orient(newOrientation: string): Label;
    public orient(newOrientation?: string): any {
      if (newOrientation == null) {
        return this.orientation;
      } else {
        newOrientation = newOrientation.toLowerCase();
        if (newOrientation === "horizontal" || newOrientation === "left" || newOrientation === "right") {
          this.orientation = newOrientation;
        } else {
          throw new Error(newOrientation + " is not a valid orientation for LabelComponent");
        }
        this._invalidateLayout();
        return this;
      }
    }

    /**
     * Gets the amount of padding around the Label.
     *
     * @returns {number} the current padding amount.
     */
    public padding(): number;
    /**
     * Sets the amount of padding around the Label.
     * Also retriggers a layout calculation to calculate the appropriate layout.
     *
     * @param {number} padAmount The desired padding amount
     * @returns {Label} The calling Label.
     */
    public padding(padAmount: number): Label;
    public padding(padAmount?: number): any {
      // If padAmount is null return the padAmount
      // Otherwise store the new value and invalidate the layout
    }

    public _doRender() {
      super._doRender();
      this.textContainer.text("");
      var dimension = this.orientation === "horizontal" ? this.width() : this.height();
      var truncatedText = _Util.Text.getTruncatedText(this._text, dimension, this.measurer);
      if (this.orientation === "horizontal") {
        _Util.Text.writeLineHorizontally(truncatedText, this.textContainer, this.width(), this.height(),
                                        this.xAlignment, this.yAlignment);
      } else {
        _Util.Text.writeLineVertically(truncatedText, this.textContainer, this.width(), this.height(),
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

  export class AxisLabel extends Label {
    /**
     * Creates a AxisLabel, a type of label made for rendering axis labels.
     *
     * @constructor
     */
    constructor(text?: string, orientation?: string) {
      super(text, orientation);
      this.classed("axis-label", true);
    }
  }
}
}
