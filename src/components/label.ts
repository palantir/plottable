///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class Label extends Component {
    private _textContainer: D3.Selection;
    private _text: string; // text assigned to the Label; may not be the actual text displayed due to truncation
    private _angle: number;
    private _measurer: SVGTypewriter.Measurers.Measurer;
    private _wrapper: SVGTypewriter.Wrappers.Wrapper;
    private _writer: SVGTypewriter.Writers.Writer;
    private _padding: number;

    /**
     * Creates a Label.
     *
     * A label is component that renders just text. The most common use of
     * labels is to create a title or axis labels.
     *
     * @constructor
     * @param {string} displayText The text of the Label (default = "").
     * @param {number} angle The rotation angle of the text (default = 0). 
     */
    constructor(displayText = "", angle = 0) {
      super();
      this.classed("label", true);
      this.text(displayText);
      this.angle(angle);
      this.xAlignment("center").yAlignment("center");
      this._padding = 0;
    }

    public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
      var desiredWH = this._measurer.measure(this._text);
      var desiredWidth  = (this.angle() === 0 ? desiredWH.width : desiredWH.height) + 2 * this.padding();
      var desiredHeight = (this.angle() === 0 ? desiredWH.height : desiredWH.width) + 2 * this.padding();

      return {
        minWidth: desiredWidth,
        minHeight: desiredHeight
      };
    }

    protected _setup() {
      super._setup();
      this._textContainer = this._content.append("g");
      this._measurer = new SVGTypewriter.Measurers.Measurer(this._textContainer);
      this._wrapper = new SVGTypewriter.Wrappers.Wrapper();
      this._writer = new SVGTypewriter.Writers.Writer(this._measurer, this._wrapper);
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
        this.redraw();
        return this;
      }
    }

    /**
     * Gets the angle of the Label.
     *
     * @returns {number} the current angle.
     */
    public angle(): number;
    /**
     * Sets the angle of the Label.
     *
     * @param {number} angle If provided, the desired angle (0/-90/90)
     * @returns {Label} The calling Label.
     */
    public angle(angle: number): Label;
    public angle(angle?: number): any {
      if (angle == null) {
        return this._angle;
      } else {
        if (angle === -90 || angle === 0 || angle === 90) {
          this._angle = angle;
        } else {
          throw new Error(angle + " is not a valid angle for Label");
        }
        this.redraw();
        return this;
      }
    }

    /**
     * Gets the amount of padding in pixels around the Label.
     *
     * @returns {number} the current padding amount.
     */
    public padding(): number;
    /**
     * Sets the amount of padding in pixels around the Label.
     *
     * @param {number} padAmount The desired padding amount in pixel values
     * @returns {Label} The calling Label.
     */
    public padding(padAmount: number): Label;
    public padding(padAmount?: number): any {
      if (padAmount == null) {
        return this._padding;
      } else {
        padAmount = +padAmount;
        if (padAmount < 0) {
          throw new Error(padAmount + " is not a valid padding value.  Cannot be less than 0.");
        }
        this._padding = padAmount;
        this.redraw();
        return this;
      }
    }

    public fixedWidth() {
      return true;
    }

    public fixedHeight() {
      return true;
    }

    public renderImmediately() {
      super.renderImmediately();
      // HACKHACK SVGTypewriter should remove existing content - #21 on SVGTypewriter.
      this._textContainer.selectAll("g").remove();
      var textMeasurement = this._measurer.measure(this._text);
      var heightPadding = Math.max(Math.min((this.height() - textMeasurement.height) / 2, this.padding()), 0);
      var widthPadding = Math.max(Math.min((this.width() - textMeasurement.width) / 2, this.padding()), 0);
      this._textContainer.attr("transform", "translate(" + widthPadding + "," + heightPadding + ")");
      var writeWidth = this.width() - 2 * widthPadding;
      var writeHeight = this.height() - 2 * heightPadding;
      var writeOptions = {
                        selection: this._textContainer,
                        xAlign: this.xAlignment(),
                        yAlign: this.yAlignment(),
                        textRotation: this.angle()
                    };
      this._writer.write(this._text, writeWidth, writeHeight, writeOptions);
      return this;
    }
  }

  export class TitleLabel extends Label {
    public static TITLE_LABEL_CLASS = "title-label";
    /**
     * Creates a TitleLabel, a type of label made for rendering titles.
     *
     * @constructor
     */
    constructor(text?: string, angle?: number) {
      super(text, angle);
      this.classed(TitleLabel.TITLE_LABEL_CLASS, true);
    }
  }

  export class AxisLabel extends Label {
    public static AXIS_LABEL_CLASS = "axis-label";
    /**
     * Creates a AxisLabel, a type of label made for rendering axis labels.
     *
     * @constructor
     */
    constructor(text?: string, angle?: number) {
      super(text, angle);
      this.classed(AxisLabel.AXIS_LABEL_CLASS, true);
    }
  }
}
}
