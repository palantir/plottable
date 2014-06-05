///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class Label extends Abstract.Component {
    private textElement: D3.Selection;
    private text: string; // text assigned to the Label; may not be the actual text displayed due to truncation
    private orientation: string;
    private textLength: number;
    private textHeight: number;

    /**
     * Creates a Label.
     *
     * @constructor
     * @param {string} [text] The text of the Label.
     * @param {string} [orientation] The orientation of the Label (horizontal/vertical-left/vertical-right).
     */
    constructor(text = "", orientation = "horizontal") {
      super();
      this.classed("label", true);
      this.setText(text);
      orientation = orientation.toLowerCase();
      if (orientation === "horizontal" || orientation === "vertical-left" || orientation === "vertical-right") {
        this.orientation = orientation;
      } else {
        throw new Error(orientation + " is not a valid orientation for LabelComponent");
      }
      this.xAlign("CENTER").yAlign("CENTER"); // the defaults
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      var desiredWidth : number;
      var desiredHeight: number;
      if (this.orientation === "horizontal") {
        desiredWidth  = this.textLength;
        desiredHeight = this.textHeight;
      } else {
        desiredWidth  = this.textHeight;
        desiredHeight = this.textLength;
      }
      return {
        width : Math.min(desiredWidth , offeredWidth),
        height: Math.min(desiredHeight, offeredHeight),
        wantsWidth : desiredWidth  > offeredWidth,
        wantsHeight: desiredHeight > offeredHeight
      };
    }

    public _setup() {
      super._setup();
      this.textElement = this.content.append("text");
      this.setText(this.text);
      return this;
    }

    /**
     * Sets the text on the Label.
     *
     * @param {string} text The new text for the Label.
     * @returns {Label} The calling Label.
     */
    public setText(text: string) {
      this.text = text;
      if (this.element != null) {
        this.textElement.text(text);
        this.measureAndSetTextSize();
      }
      this._invalidateLayout();
      return this;
    }

    private measureAndSetTextSize() {
      var bbox = UtilDOM.getBBox(this.textElement);
      this.textHeight = bbox.height;
      this.textLength = this.text === "" ? 0 : bbox.width;
    }

    private truncateTextAndRemeasure(availableLength: number) {
      var shortText = UtilText.getTruncatedText(this.text, availableLength, this.textElement);
      this.textElement.text(shortText);
      this.measureAndSetTextSize();
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth ?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this.textElement.attr("dy", 0); // Reset this so we maintain idempotence
      var bbox = UtilDOM.getBBox(this.textElement);
      this.textElement.attr("dy", -bbox.y);

      var xShift = 0;
      var yShift = 0;

      if (this.orientation === "horizontal") {
        this.truncateTextAndRemeasure(this.availableWidth );
        xShift = (this.availableWidth   - this.textLength) * this._xAlignProportion;
      } else {
        this.truncateTextAndRemeasure(this.availableHeight);
        xShift = (this.availableHeight - this.textLength) * this._yAlignProportion;

        if (this.orientation === "vertical-right") {
          this.textElement.attr("transform", "rotate(90)");
          yShift = -this.textHeight;
        } else { // vertical-left
          this.textElement.attr("transform", "rotate(-90)");
          xShift = -xShift - this.textLength; // flip xShift
        }
      }

      this.textElement.attr("x", xShift);
      this.textElement.attr("y", yShift);
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
