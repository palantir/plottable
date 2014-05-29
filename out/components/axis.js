///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Axis = (function (_super) {
        __extends(Axis, _super);
        /**
        * Creates an Axis.
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
        * @param {any} [formatter] a D3 formatter
        */
        function Axis(axisScale, orientation, formatter) {
            var _this = this;
            _super.call(this);
            this._showEndTickLabels = false;
            this.tickPositioning = "center";
            console.log("hello from axis.ts!");
            this._axisScale = axisScale;
            orientation = orientation.toLowerCase();
            this.d3Axis = d3.svg.axis().scale(axisScale._d3Scale).orient(orientation);
            this.classed("axis", true);
            if (formatter == null) {
                var numberFormatter = d3.format(".3s");
                formatter = function (d) {
                    if (typeof d === "number") {
                        if (Math.abs(d) < 1) {
                            return String(Math.round(1000 * d) / 1000);
                        }
                        return numberFormatter(d);
                    }
                    return d;
                };
            }
            this.tickFormat(formatter);
            this._registerToBroadcaster(this._axisScale, function () {
                return _this._render();
            });
        }
        Axis.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.axisElement = this.content.append("g").classed("axis", true);
            return this;
        };

        Axis.prototype._doRender = function () {
            var domain = this.d3Axis.scale().domain();
            var extent = Math.abs(domain[1] - domain[0]);
            var min = +d3.min(domain);
            var max = +d3.max(domain);
            var newDomain;
            var standardOrder = domain[0] < domain[1];
            if (typeof (domain[0]) === "number") {
                newDomain = standardOrder ? [min - extent, max + extent] : [max + extent, min - extent];
            } else {
                newDomain = standardOrder ? [new Date(min - extent), new Date(max + extent)] : [new Date(max + extent), new Date(min - extent)];
            }

            // hackhack Make tiny-zero representations not look terrible, by rounding them to 0
            if (this._axisScale.ticks != null) {
                var scale = this._axisScale;
                var nTicks = 10;
                var ticks = scale.ticks(nTicks);
                var numericDomain = scale.domain();
                var interval = numericDomain[1] - numericDomain[0];
                var cleanTick = function (n) {
                    return Math.abs(n / interval / nTicks) < 0.0001 ? 0 : n;
                };
                ticks = ticks.map(cleanTick);
                this.d3Axis.tickValues(ticks);
            }

            this.axisElement.call(this.d3Axis);

            this.axisElement.selectAll(".tick").select("text").style("visibility", "visible");

            return this;
        };

        Axis.prototype.showEndTickLabels = function (show) {
            if (show == null) {
                return this._showEndTickLabels;
            }
            this._showEndTickLabels = show;
            return this;
        };

        Axis.prototype._hideCutOffTickLabels = function () {
            var _this = this;
            var availableWidth = this.availableWidth;
            var availableHeight = this.availableHeight;
            var tickLabels = this.axisElement.selectAll(".tick").select("text");

            var boundingBox = this.element.select(".bounding-box")[0][0].getBoundingClientRect();

            var isInsideBBox = function (tickBox) {
                return (boundingBox.left <= tickBox.left && boundingBox.top <= tickBox.top && tickBox.right <= boundingBox.left + _this.availableWidth && tickBox.bottom <= boundingBox.top + _this.availableHeight);
            };

            tickLabels.each(function (d) {
                if (!isInsideBBox(this.getBoundingClientRect())) {
                    d3.select(this).style("visibility", "hidden");
                }
            });

            return this;
        };

        Axis.prototype._hideOverlappingTickLabels = function () {
            var tickLabels = this.axisElement.selectAll(".tick").select("text");
            var lastLabelClientRect;

            function boxesOverlap(boxA, boxB) {
                if (boxA.right < boxB.left) {
                    return false;
                }
                if (boxA.left > boxB.right) {
                    return false;
                }
                if (boxA.bottom < boxB.top) {
                    return false;
                }
                if (boxA.top > boxB.bottom) {
                    return false;
                }
                return true;
            }

            tickLabels.each(function (d) {
                var clientRect = this.getBoundingClientRect();
                if (lastLabelClientRect != null && boxesOverlap(clientRect, lastLabelClientRect)) {
                    d3.select(this).style("visibility", "hidden");
                } else {
                    lastLabelClientRect = clientRect;
                    d3.select(this).style("visibility", "visible");
                }
            });
        };

        Axis.prototype.scale = function (newScale) {
            if (newScale == null) {
                return this._axisScale;
            } else {
                this._axisScale = newScale;
                this.d3Axis.scale(newScale._d3Scale);
                return this;
            }
        };

        Axis.prototype.tickLabelPosition = function (position) {
            if (position == null) {
                return this.tickPositioning;
            } else {
                this.tickPositioning = position;
                return this;
            }
        };

        Axis.prototype.orient = function (newOrient) {
            if (newOrient == null) {
                return this.d3Axis.orient();
            } else {
                this.d3Axis.orient(newOrient);
                return this;
            }
        };

        Axis.prototype.ticks = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (args == null || args.length === 0) {
                return this.d3Axis.ticks();
            } else {
                this.d3Axis.ticks(args);
                return this;
            }
        };

        Axis.prototype.tickValues = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (args == null) {
                return this.d3Axis.tickValues();
            } else {
                this.d3Axis.tickValues(args);
                return this;
            }
        };

        Axis.prototype.tickSize = function (inner, outer) {
            if (inner != null && outer != null) {
                this.d3Axis.tickSize(inner, outer);
                return this;
            } else if (inner != null) {
                this.d3Axis.tickSize(inner);
                return this;
            } else {
                return this.d3Axis.tickSize();
            }
        };

        Axis.prototype.innerTickSize = function (val) {
            if (val == null) {
                return this.d3Axis.innerTickSize();
            } else {
                this.d3Axis.innerTickSize(val);
                return this;
            }
        };

        Axis.prototype.outerTickSize = function (val) {
            if (val == null) {
                return this.d3Axis.outerTickSize();
            } else {
                this.d3Axis.outerTickSize(val);
                return this;
            }
        };

        Axis.prototype.tickPadding = function (val) {
            if (val == null) {
                return this.d3Axis.tickPadding();
            } else {
                this.d3Axis.tickPadding(val);
                return this;
            }
        };

        Axis.prototype.tickFormat = function (formatter) {
            if (formatter == null) {
                return this.d3Axis.tickFormat();
            } else {
                this.d3Axis.tickFormat(formatter);
                this._invalidateLayout();
                return this;
            }
        };
        Axis._DEFAULT_TICK_SIZE = 6;
        return Axis;
    })(Plottable.Component);
    Plottable.Axis = Axis;

    var XAxis = (function (_super) {
        __extends(XAxis, _super);
        /**
        * Creates an XAxis (a horizontal Axis).
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (top/bottom)
        * @param {any} [formatter] a D3 formatter
        */
        function XAxis(scale, orientation, formatter) {
            if (typeof orientation === "undefined") { orientation = "bottom"; }
            if (typeof formatter === "undefined") { formatter = null; }
            _super.call(this, scale, orientation, formatter);
            this._height = 30;
            var orientation = orientation.toLowerCase();
            if (orientation !== "top" && orientation !== "bottom") {
                throw new Error(orientation + " is not a valid orientation for XAxis");
            }
            this.tickLabelPosition("center");
        }
        XAxis.prototype.height = function (h) {
            this._height = h;
            this._invalidateLayout();
            return this;
        };

        XAxis.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.axisElement.classed("x-axis", true);
            return this;
        };

        XAxis.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
            return {
                width: 0,
                height: Math.min(offeredHeight, this._height),
                wantsWidth: false,
                wantsHeight: offeredHeight < this._height
            };
        };

        XAxis.prototype.tickLabelPosition = function (position) {
            if (position == null) {
                return _super.prototype.tickLabelPosition.call(this);
            } else {
                var positionLC = position.toLowerCase();
                if (positionLC === "left" || positionLC === "center" || positionLC === "right") {
                    if (positionLC === "center") {
                        this.tickSize(XAxis._DEFAULT_TICK_SIZE);
                    } else {
                        this.tickSize(12); // longer than default tick size
                    }
                    return _super.prototype.tickLabelPosition.call(this, positionLC);
                } else {
                    throw new Error(position + " is not a valid tick label position for XAxis");
                }
            }
        };

        XAxis.prototype._doRender = function () {
            var _this = this;
            _super.prototype._doRender.call(this);
            if (this.orient() === "top") {
                this.axisElement.attr("transform", "translate(0," + this._height + ")");
            } else if (this.orient() === "bottom") {
                this.axisElement.attr("transform", "");
            }

            var tickTextLabels = this.axisElement.selectAll("text");
            if (tickTextLabels[0].length > 0) {
                if (this.tickLabelPosition() !== "center") {
                    tickTextLabels.attr("y", "0px");

                    if (this.orient() === "bottom") {
                        tickTextLabels.attr("dy", "1em");
                    } else {
                        tickTextLabels.attr("dy", "-0.25em");
                    }

                    if (this.tickLabelPosition() === "right") {
                        tickTextLabels.attr("dx", "0.2em").style("text-anchor", "start");
                    } else if (this.tickLabelPosition() === "left") {
                        tickTextLabels.attr("dx", "-0.2em").style("text-anchor", "end");
                    }
                }

                if (this._axisScale.rangeType != null) {
                    var scaleRange = this._axisScale.range();
                    var availableWidth = this.availableWidth;
                    var tickLengthWithPadding = Math.abs(parseFloat(d3.select(tickTextLabels[0][0]).attr("y")));
                    var availableHeight = this.availableHeight - tickLengthWithPadding;
                    if (tickTextLabels[0].length > 1) {
                        var tickValues = tickTextLabels.data();
                        var tickPositions = tickValues.map(function (v) {
                            return _this._axisScale.scale(v);
                        });
                        tickPositions.forEach(function (p, i) {
                            var spacing = Math.abs(tickPositions[i + 1] - p);
                            availableWidth = (spacing < availableWidth) ? spacing : availableWidth;
                        });
                    }

                    availableWidth = 0.9 * availableWidth; // add in some padding

                    tickTextLabels.each(function (t, i) {
                        var textEl = d3.select(this);
                        var currentText = textEl.text();
                        var wrappedLines = Plottable.TextUtils.getWrappedText(currentText, availableWidth, availableHeight, textEl);
                        if (wrappedLines.length === 1) {
                            textEl.text(Plottable.TextUtils.getTruncatedText(currentText, availableWidth, textEl));
                        } else {
                            textEl.text("");
                            var tspans = textEl.selectAll("tspan").data(wrappedLines);
                            tspans.enter().append("tspan");
                            tspans.text(function (line) {
                                return line;
                            }).attr("x", "0").attr("dy", function (line, i) {
                                return (i === 0) ? textEl.attr("dy") : "1em";
                            }).style("text-anchor", textEl.style("text-anchor"));
                        }
                    });
                } else {
                    this._hideOverlappingTickLabels();
                }
            }

            if (!this.showEndTickLabels()) {
                this._hideCutOffTickLabels();
            }
            return this;
        };
        return XAxis;
    })(Axis);
    Plottable.XAxis = XAxis;

    var YAxis = (function (_super) {
        __extends(YAxis, _super);
        /**
        * Creates a YAxis (a vertical Axis).
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (left/right)
        * @param {any} [formatter] a D3 formatter
        */
        function YAxis(scale, orientation, formatter) {
            if (typeof orientation === "undefined") { orientation = "left"; }
            if (typeof formatter === "undefined") { formatter = null; }
            _super.call(this, scale, orientation, formatter);
            this._width = 50;
            orientation = orientation.toLowerCase();
            if (orientation !== "left" && orientation !== "right") {
                throw new Error(orientation + " is not a valid orientation for YAxis");
            }
            this.tickLabelPosition("middle");
        }
        YAxis.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.axisElement.classed("y-axis", true);
            return this;
        };

        YAxis.prototype.width = function (w) {
            this._width = w;
            this._invalidateLayout();
            return this;
        };

        YAxis.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
            return {
                width: Math.min(offeredWidth, this._width),
                height: 0,
                wantsWidth: offeredWidth < this._width,
                wantsHeight: false
            };
        };

        YAxis.prototype.tickLabelPosition = function (position) {
            if (position == null) {
                return _super.prototype.tickLabelPosition.call(this);
            } else {
                var positionLC = position.toLowerCase();
                if (positionLC === "top" || positionLC === "middle" || positionLC === "bottom") {
                    if (positionLC === "middle") {
                        this.tickSize(YAxis._DEFAULT_TICK_SIZE);
                    } else {
                        this.tickSize(30); // longer than default tick size
                    }
                    return _super.prototype.tickLabelPosition.call(this, positionLC);
                } else {
                    throw new Error(position + " is not a valid tick label position for YAxis");
                }
            }
        };

        YAxis.prototype._doRender = function () {
            var _this = this;
            _super.prototype._doRender.call(this);
            if (this.orient() === "left") {
                this.axisElement.attr("transform", "translate(" + this._width + ", 0)");
            } else if (this.orient() === "right") {
                this.axisElement.attr("transform", "");
            }

            var tickTextLabels = this.axisElement.selectAll("text");
            if (tickTextLabels[0].length > 0) {
                if (this.tickLabelPosition() !== "middle") {
                    tickTextLabels.attr("x", "0px");

                    if (this.orient() === "left") {
                        tickTextLabels.attr("dx", "-0.25em");
                    } else {
                        tickTextLabels.attr("dx", "0.25em");
                    }

                    if (this.tickLabelPosition() === "top") {
                        tickTextLabels.attr("dy", "-0.3em");
                    } else if (this.tickLabelPosition() === "bottom") {
                        tickTextLabels.attr("dy", "1em");
                    }
                }

                if (this._axisScale.rangeType != null) {
                    var scaleRange = this._axisScale.range();
                    var tickLengthWithPadding = Math.abs(parseFloat(d3.select(tickTextLabels[0][0]).attr("x")));
                    var availableWidth = this.availableWidth - tickLengthWithPadding;
                    var availableHeight = this.availableHeight;
                    if (tickTextLabels[0].length > 1) {
                        var tickValues = tickTextLabels.data();
                        var tickPositions = tickValues.map(function (v) {
                            return _this._axisScale.scale(v);
                        });
                        tickPositions.forEach(function (p, i) {
                            var spacing = Math.abs(tickPositions[i + 1] - p);
                            availableHeight = (spacing < availableHeight) ? spacing : availableHeight;
                        });
                    }

                    var tickLabelPosition = this.tickLabelPosition();
                    tickTextLabels.each(function (t, i) {
                        var textEl = d3.select(this);
                        var currentText = textEl.text();
                        var wrappedLines = Plottable.TextUtils.getWrappedText(currentText, availableWidth, availableHeight, textEl);
                        if (wrappedLines.length === 1) {
                            textEl.text(Plottable.TextUtils.getTruncatedText(currentText, availableWidth, textEl));
                        } else {
                            var baseY = 0;
                            if (tickLabelPosition === "top") {
                                baseY = -(wrappedLines.length - 1);
                            } else if (tickLabelPosition === "middle") {
                                baseY = -(wrappedLines.length - 1) / 2;
                            }

                            textEl.text("");
                            var tspans = textEl.selectAll("tspan").data(wrappedLines);
                            tspans.enter().append("tspan");
                            tspans.text(function (line) {
                                return line;
                            }).attr({
                                "dy": textEl.attr("dy"),
                                "x": textEl.attr("x"),
                                "y": function (line, i) {
                                    return (baseY + i) + "em";
                                }
                            }).style("text-anchor", textEl.style("text-anchor"));
                        }
                    });
                } else {
                    this._hideOverlappingTickLabels();
                }
            }

            if (!this.showEndTickLabels()) {
                this._hideCutOffTickLabels();
            }
            return this;
        };
        return YAxis;
    })(Axis);
    Plottable.YAxis = YAxis;
})(Plottable || (Plottable = {}));
