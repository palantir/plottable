///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Label = (function (_super) {
        __extends(Label, _super);
        /**
        * Creates a Label.
        *
        * @constructor
        * @param {string} [text] The text of the Label.
        * @param {string} [orientation] The orientation of the Label (horizontal/vertical-left/vertical-right).
        */
        function Label(text, orientation) {
            if (typeof text === "undefined") { text = ""; }
            if (typeof orientation === "undefined") { orientation = "horizontal"; }
            _super.call(this);
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
        Label.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
            var desiredWidth;
            var desiredHeight;
            if (this.orientation === "horizontal") {
                desiredWidth = this.textLength;
                desiredHeight = this.textHeight;
            } else {
                desiredWidth = this.textHeight;
                desiredHeight = this.textLength;
            }
            return {
                width: Math.min(desiredWidth, offeredWidth),
                height: Math.min(desiredHeight, offeredHeight),
                wantsWidth: desiredWidth > offeredWidth,
                wantsHeight: desiredHeight > offeredHeight
            };
        };

        Label.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.textElement = this.content.append("text");
            this.setText(this.text);
            return this;
        };

        /**
        * Sets the text on the Label.
        *
        * @param {string} text The new text for the Label.
        * @returns {Label} The calling Label.
        */
        Label.prototype.setText = function (text) {
            this.text = text;
            if (this.element != null) {
                this.textElement.text(text);
                this.measureAndSetTextSize();
            }
            this._invalidateLayout();
            return this;
        };

        Label.prototype.measureAndSetTextSize = function () {
            var bbox = Plottable.DOMUtils.getBBox(this.textElement);
            this.textHeight = bbox.height;
            this.textLength = this.text === "" ? 0 : bbox.width;
        };

        Label.prototype.truncateTextAndRemeasure = function (availableLength) {
            var shortText = Plottable.TextUtils.getTruncatedText(this.text, availableLength, this.textElement);
            this.textElement.text(shortText);
            this.measureAndSetTextSize();
        };

        Label.prototype._computeLayout = function (xOffset, yOffset, availableWidth, availableHeight) {
            _super.prototype._computeLayout.call(this, xOffset, yOffset, availableWidth, availableHeight);
            this.textElement.attr("dy", 0); // Reset this so we maintain idempotence
            var bbox = Plottable.DOMUtils.getBBox(this.textElement);
            this.textElement.attr("dy", -bbox.y);

            var xShift = 0;
            var yShift = 0;

            if (this.orientation === "horizontal") {
                this.truncateTextAndRemeasure(this.availableWidth);
                xShift = (this.availableWidth - this.textLength) * this._xAlignProportion;
            } else {
                this.truncateTextAndRemeasure(this.availableHeight);
                xShift = (this.availableHeight - this.textLength) * this._yAlignProportion;

                if (this.orientation === "vertical-right") {
                    this.textElement.attr("transform", "rotate(90)");
                    yShift = -this.textHeight;
                } else {
                    this.textElement.attr("transform", "rotate(-90)");
                    xShift = -xShift - this.textLength; // flip xShift
                }
            }

            this.textElement.attr("x", xShift);
            this.textElement.attr("y", yShift);
            return this;
        };
        return Label;
    })(Plottable.Component);
    Plottable.Label = Label;

    var TitleLabel = (function (_super) {
        __extends(TitleLabel, _super);
        function TitleLabel(text, orientation) {
            _super.call(this, text, orientation);
            this.classed("title-label", true);
        }
        return TitleLabel;
    })(Label);
    Plottable.TitleLabel = TitleLabel;

    var AxisLabel = (function (_super) {
        __extends(AxisLabel, _super);
        function AxisLabel(text, orientation) {
            _super.call(this, text, orientation);
            this.classed("axis-label", true);
        }
        return AxisLabel;
    })(Label);
    Plottable.AxisLabel = AxisLabel;
})(Plottable || (Plottable = {}));
