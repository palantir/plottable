var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Axis = (function () {
    function Axis(scale, orientation, formatter, rowMinimumVal, colMinimumVal) {
        this.scale = scale;
        this.orientation = orientation;
        this.formatter = formatter;
        this.rowMinimumVal = rowMinimumVal;
        this.colMinimumVal = colMinimumVal;
        this.isXAligned = this.orientation === "bottom" || this.orientation === "top";
        var rowMinimum = this.isXAligned ? Axis.xHeight : 0;
        var colMinimum = this.isXAligned ? 0 : Axis.yWidth;

        this.d3axis = d3.svg.axis().scale(this.scale).orient(this.orientation);
        if (this.formatter == null) {
            this.formatter = d3.format("s3");
        }
        this.d3axis.tickFormat(this.formatter);
        this.cachedScale = 1;
        this.cachedTranslate = 0;
        this.className = "axis";
    }
    Axis.axisXTransform = function (selection, x) {
        selection.attr("transform", function (d) {
            return "translate(" + x(d) + ",0)";
        });
    };

    Axis.axisYTransform = function (selection, y) {
        selection.attr("transform", function (d) {
            return "translate(0," + y(d) + ")";
        });
    };

    Axis.prototype.transformString = function (translate, scale) {
        var translateS = this.isXAligned ? "" + translate : "0," + translate;
        return "translate(" + translateS + ")";
    };

    Axis.prototype.rowWeight = function (newVal) {
        if (typeof newVal === "undefined") { newVal = null; }
        return 0;
    };
    Axis.prototype.colWeight = function (newVal) {
        if (typeof newVal === "undefined") { newVal = null; }
        return 0;
    };

    Axis.prototype.rowMinimum = function () {
        return this.rowMinimumVal;
    };
    Axis.prototype.colMinimum = function () {
        return this.colMinimumVal;
    };

    Axis.prototype.render = function (element, width, height) {
        this.element = element.append("g").classed("axis", true);
        this.element.append("rect").attr("width", width).attr("height", height).classed("axis-box", true);
        if (this.orientation === "left")
            this.element.attr("transform", "translate(" + Axis.yWidth + ")");
        if (this.orientation === "top")
            this.element.attr("transform", "translate(0," + Axis.xHeight + ")");
        var domain = this.scale.domain();
        var extent = Math.abs(domain[1] - domain[0]);
        var min = +d3.min(domain);
        var max = +d3.max(domain);
        var newDomain;
        var standardOrder = domain[0] < domain[1];
        if (typeof (domain[0]) == "number") {
            newDomain = standardOrder ? [min - extent, max + extent] : [max + extent, min - extent];
        } else {
            newDomain = standardOrder ? [new Date(min - extent), new Date(max + extent)] : [new Date(max + extent), new Date(min - extent)];
        }

        this.element.call(this.d3axis);
    };

    Axis.prototype.rescale = function () {
        var tickTransform = this.isXAligned ? Axis.axisXTransform : Axis.axisYTransform;
        var tickSelection = this.element.selectAll(".tick");
        tickSelection.call(tickTransform, this.scale);
        this.element.attr("transform", "");
    };

    Axis.prototype.transform = function (translatePair, scale) {
        var translate = this.isXAligned ? translatePair[0] : translatePair[1];
        if (scale != null && scale != this.cachedScale) {
            this.cachedTranslate = translate;
            this.cachedScale = scale;
            this.rescale();
        } else {
            translate -= this.cachedTranslate;
            var transform = this.transformString(translate, scale);
            this.element.attr("transform", transform);
        }
    };
    Axis.yWidth = 50;
    Axis.xHeight = 30;
    return Axis;
})();

var XAxis = (function (_super) {
    __extends(XAxis, _super);
    function XAxis(scale, orientation, formatter) {
        if (typeof formatter === "undefined") { formatter = null; }
        _super.call(this, scale, orientation, formatter, Axis.xHeight, 0);
    }
    return XAxis;
})(Axis);

var YAxis = (function (_super) {
    __extends(YAxis, _super);
    function YAxis(scale, orientation, formatter) {
        if (typeof formatter === "undefined") { formatter = null; }
        _super.call(this, scale, orientation, formatter, 0, Axis.yWidth);
    }
    return YAxis;
})(Axis);
var Utils;
(function (Utils) {
    function readyCallback(numToTrigger, callbackWhenReady) {
        var timesCalled = 0;
        return function () {
            timesCalled++;
            if (timesCalled === numToTrigger) {
                callbackWhenReady();
            }
        };
    }
    Utils.readyCallback = readyCallback;

    function translate(element, translatePair) {
        return element.attr("transform", "translate(" + translatePair + ")");
    }
    Utils.translate = translate;
})(Utils || (Utils = {}));
var Table = (function () {
    function Table(rows, rowWeightVal, colWeightVal) {
        if (typeof rowWeightVal === "undefined") { rowWeightVal = 1; }
        if (typeof colWeightVal === "undefined") { colWeightVal = 1; }
        this.rowPadding = 5;
        this.colPadding = 5;
        this.rows = rows;
        this.cols = d3.transpose(rows);
        this.nRows = this.rows.length;
        this.nCols = this.cols.length;
        this.renderables = _.flatten(this.rows);
        this.tables = this.renderables.filter(function (x) {
            return x != null && x.computeLayout != null;
        });
        this.rowWeightVal = rowWeightVal;
        this.colWeightVal = colWeightVal;
        this.className = "table";
    }
    Table.prototype.rowMinimum = function () {
        return this.minHeight;
    };
    Table.prototype.colMinimum = function () {
        return this.minWidth;
    };

    Table.prototype.rowWeight = function (newVal) {
        if (typeof newVal === "undefined") { newVal = null; }
        if (newVal != null) {
            this.rowWeightVal = newVal;
        }
        return this.rowWeightVal;
    };

    Table.prototype.colWeight = function (newVal) {
        if (typeof newVal === "undefined") { newVal = null; }
        if (newVal != null) {
            this.colWeightVal = newVal;
        }
        return this.colWeightVal;
    };

    Table.prototype.computeLayout = function () {
        this.tables.forEach(function (t) {
            return t.computeLayout();
        });
        this.rowMinimums = this.rows.map(function (row) {
            return d3.max(row, function (r) {
                return (r != null) ? r.rowMinimum() : 0;
            });
        });
        this.colMinimums = this.cols.map(function (col) {
            return d3.max(col, function (r) {
                return (r != null) ? r.colMinimum() : 0;
            });
        });
        this.minWidth = d3.sum(this.colMinimums) + this.colPadding * (this.cols.length - 1);
        this.minHeight = d3.sum(this.rowMinimums) + this.rowPadding * (this.rows.length - 1);

        this.rowWeights = this.rows.map(function (row) {
            return d3.max(row, function (r) {
                return (r != null) ? r.rowWeight() : 0;
            });
        });
        this.colWeights = this.cols.map(function (col) {
            return d3.max(col, function (r) {
                return (r != null) ? r.colWeight() : 0;
            });
        });
        this.rowWeightSum = d3.sum(this.rowWeights);
        this.colWeightSum = d3.sum(this.colWeights);
    };

    Table.prototype.render = function (element, availableWidth, availableHeight) {
        var _this = this;
        var rect = element.append("rect");
        rect.attr("width", availableWidth).attr("height", availableHeight).classed("table-rect", true);
        chai.assert.operator(availableWidth, '>=', 0, "availableWidth is >= 0");
        chai.assert.operator(availableHeight, '>=', 0, "availableHeight is >= 0");
        this.computeLayout();
        var freeWidth = availableWidth - this.minWidth;
        var freeHeight = availableHeight - this.minHeight;

        if (freeWidth < 0 || freeHeight < 0) {
            throw "InsufficientSpaceError";
        }
        if (this.rowWeightSum === 0) {
            var nRows = this.rowWeights.length;
            var rowProportionalSpace = this.rowWeights.map(function (w) {
                return freeHeight / nRows;
            });
        } else {
            var rowProportionalSpace = this.rowWeights.map(function (w) {
                return w / _this.rowWeightSum * freeHeight;
            });
        }
        if (this.colWeightSum === 0) {
            var nCols = this.colWeights.length;
            var colProportionalSpace = this.colWeights.map(function (w) {
                return freeWidth / nCols;
            });
        } else {
            var colProportionalSpace = this.colWeights.map(function (w) {
                return w / _this.colWeightSum * freeWidth;
            });
        }
        var sumPair = function (p) {
            return p[0] + p[1];
        };
        var rowHeights = d3.zip(rowProportionalSpace, this.rowMinimums).map(sumPair);
        var colWidths = d3.zip(colProportionalSpace, this.colMinimums).map(sumPair);

        chai.assert.closeTo(d3.sum(rowHeights) + (this.nRows - 1) * this.rowPadding, availableHeight, 1, "row heights sum to available height");
        chai.assert.closeTo(d3.sum(colWidths) + (this.nCols - 1) * this.colPadding, availableWidth, 1, "col widths sum to available width");
        var yOffset = 0;
        this.rows.forEach(function (row, i) {
            var xOffset = 0;
            row.forEach(function (renderable, j) {
                if (renderable == null) {
                    xOffset += colWidths[j];
                    return;
                }
                Table.renderChild(element, renderable, xOffset, yOffset, colWidths[j], rowHeights[i]);
                xOffset += colWidths[j] + _this.colPadding;
            });
            chai.assert.operator(xOffset - _this.colPadding, "<=", availableWidth, "final xOffset was <= availableWidth");
            yOffset += rowHeights[i] + _this.rowPadding;
        });
        chai.assert.operator(yOffset - this.rowPadding, "<=", availableHeight, "final xOffset was <= availableHeight");
    };

    Table.renderChild = function (parentElement, renderable, xOffset, yOffset, width, height) {
        var childElement = parentElement.append("g").classed(renderable.className, true);
        Utils.translate(childElement, [xOffset, yOffset]);
        renderable.render(childElement, width, height);
    };
    return Table;
})();
var Renderer = (function () {
    function Renderer(dataset) {
        this.dataset = dataset;
        this.rowWeightVal = 1;
        this.colWeightVal = 1;
    }
    Renderer.prototype.rowWeight = function (newVal) {
        if (typeof newVal === "undefined") { newVal = null; }
        if (newVal != null) {
            this.rowWeightVal = newVal;
        }
        return this.rowWeightVal;
    };

    Renderer.prototype.colWeight = function (newVal) {
        if (typeof newVal === "undefined") { newVal = null; }
        if (newVal != null) {
            this.colWeightVal = newVal;
        }
        return this.colWeightVal;
    };

    Renderer.prototype.rowMinimum = function () {
        return this.rowMinimumVal;
    };

    Renderer.prototype.colMinimum = function () {
        return this.colMinimumVal;
    };

    Renderer.prototype.transform = function (translate, scale) {
        return;
    };

    Renderer.prototype.render = function (element, width, height) {
        this.element = element;
        var bb = this.element.append("rect").attr("width", width).attr("height", height).classed("renderer-box", true);
        chai.assert.operator(width, '>=', 0, "width is >= 0");
        chai.assert.operator(height, '>=', 0, "height is >= 0");
        return;
    };

    Renderer.prototype.setDimensions = function (width, height) {
        this.width = width;
        this.height = height;
    };

    Renderer.prototype.generateElement = function (container) {
        this.element = container.append("g").classed("render-area", true).classed(this.dataset.seriesName, true);
    };
    return Renderer;
})();

var XYRenderer = (function (_super) {
    __extends(XYRenderer, _super);
    function XYRenderer(dataset, xScale, yScale) {
        _super.call(this, dataset);
        this.className = "XYRenderer";
        this.xScale = xScale;
        this.yScale = yScale;
        var data = dataset.data;
        var xDomain = d3.extent(data, function (d) {
            return d.x;
        });
        var yDomain = d3.extent(data, function (d) {
            return d.y;
        });
        this.xScale.domain(xDomain);
        this.yScale.domain(yDomain);
    }
    XYRenderer.prototype.render = function (element, width, height) {
        _super.prototype.render.call(this, element, width, height);
        this.setDimensions(width, height);
    };

    XYRenderer.prototype.setDimensions = function (width, height) {
        _super.prototype.setDimensions.call(this, width, height);
        this.xScale.range([0, width]);
        this.yScale.range([height, 0]);
    };
    return XYRenderer;
})(Renderer);

var LineRenderer = (function (_super) {
    __extends(LineRenderer, _super);
    function LineRenderer(dataset, xScale, yScale) {
        _super.call(this, dataset, xScale, yScale);
    }
    LineRenderer.prototype.render = function (element, width, height) {
        var _this = this;
        _super.prototype.render.call(this, element, width, height);
        this.line = d3.svg.line().x(function (d) {
            return _this.xScale(d.x);
        }).y(function (d) {
            return _this.yScale(d.y);
        });
        this.renderArea = this.element.append("path").classed("line", true).classed(this.dataset.seriesName, true).datum(this.dataset.data);
        this.renderArea.attr("d", this.line);
    };
    return LineRenderer;
})(XYRenderer);
function makeRandomData(numPoints, scaleFactor) {
    if (typeof scaleFactor === "undefined") { scaleFactor = 1; }
    var data = [];
    for (var i = 0; i < numPoints; i++) {
        var r = { x: Math.random(), y: Math.random() * Math.random() * scaleFactor };
        data.push(r);
    }
    data = _.sortBy(data, function (d) {
        return d.x;
    });
    return { "data": data, "seriesName": "random-data" };
}

function makeBasicChartTable() {
    var xScale = d3.scale.linear();
    var xAxis = new XAxis(xScale, "bottom");
    var yScale = d3.scale.linear();
    var yAxis = new YAxis(yScale, "right");
    var data = makeRandomData(30);
    var renderArea = new LineRenderer(data, xScale, yScale);
    var rootTable = new Table([[renderArea, yAxis], [xAxis, null]]);
    return rootTable;
}

var svg1 = d3.select("#svg1");
svg1.attr("width", 500).attr("height", 500);
makeBasicChartTable().render(svg1, 500, 500);

var svg2 = d3.select("#svg2");

var t1 = makeBasicChartTable();
var t2 = makeBasicChartTable();
var t3 = makeBasicChartTable();
var t4 = makeBasicChartTable();

var metaTable = new Table([[t1, t2], [t3, t4]]);
svg2.attr("width", 800).attr("height", 600);
metaTable.render(svg2, 800, 600);

function makeMultiAxisChart() {
    var xScale = d3.scale.linear();
    var yScale = d3.scale.linear();
    var rightAxes = [new YAxis(yScale, "right"), new YAxis(yScale, "right")];
    var rightAxesTable = new Table([rightAxes]);
    rightAxesTable.colWeight(0);
    var xAxis = new XAxis(xScale, "bottom");
    var data = makeRandomData(30);
    var renderArea = new LineRenderer(data, xScale, yScale);
    var rootTable = new Table([[renderArea, rightAxesTable], [xAxis, null]]);
    console.log(rootTable);
    return rootTable;
}

var svg3 = d3.select("#svg3");
svg3.attr("width", 400).attr("height", 400);
var multiaxischart = makeMultiAxisChart();
multiaxischart.render(svg3, 400, 400);

function makeSparklineMultichart() {
    var xScale1 = d3.scale.linear();
    var yScale1 = d3.scale.linear();
    var leftAxes = [new YAxis(yScale1, "left"), new YAxis(yScale1, "left")];
    var leftAxesTable = new Table([leftAxes]);
    leftAxesTable.colWeight(0);
    var rightAxes = [new YAxis(yScale1, "right"), new YAxis(yScale1, "right")];
    var rightAxesTable = new Table([rightAxes]);
    rightAxesTable.colWeight(0);
    var data1 = makeRandomData(30, .0005);
    var renderer1 = new LineRenderer(data1, xScale1, yScale1);
    var row1 = [rightAxesTable, renderer1, leftAxesTable];
    var yScale2 = d3.scale.linear();
    var leftAxis = new YAxis(yScale2, "left");
    var data2 = makeRandomData(100, 100000);
    var renderer2 = new LineRenderer(data2, xScale1, yScale2);
    var row2 = [leftAxis, renderer2, null];
    var bottomAxis = new XAxis(xScale1, "bottom");
    var row3 = [null, bottomAxis, null];
    var yScaleSpark = d3.scale.linear();
    var sparkline = new LineRenderer(data2, xScale1, yScaleSpark);
    sparkline.rowWeight(0.25);
    var row4 = [null, sparkline, null];
    var multiChart = new Table([row1, row2, row3, row4]);
    return multiChart;
}

var svg4 = d3.select("#svg4");
svg4.attr("width", 800).attr("height", 600);
var multichart = makeSparklineMultichart();
multichart.render(svg4, 800, 600);
svg4.selectAll("g").remove();
multichart.render(svg4, 800, 600);

function iterate(n, fn) {
    var out = [];
    for (var i = 0; i < n; i++) {
        out.push(fn());
    }
    return out;
}
var PerfDiagnostics;
(function (_PerfDiagnostics) {
    var PerfDiagnostics = (function () {
        function PerfDiagnostics() {
            this.total = 0;
            this.numCalls = 0;
            this.start = null;
        }
        PerfDiagnostics.toggle = function (measurementName) {
            if (PerfDiagnostics.diagnostics[measurementName] != null) {
                var diagnostic = PerfDiagnostics.diagnostics[measurementName];
            } else {
                var diagnostic = new PerfDiagnostics();
                PerfDiagnostics.diagnostics[measurementName] = diagnostic;
            }
            diagnostic.toggle();
        };

        PerfDiagnostics.getTime = function () {
            if (false && performance.now) {
                return performance.now();
            } else {
                return Date.now();
            }
        };

        PerfDiagnostics.logResults = function () {
            var grandTotal = PerfDiagnostics.diagnostics["total"] ? PerfDiagnostics.diagnostics["total"].total : null;
            var measurementNames = Object.keys(PerfDiagnostics.diagnostics);
            measurementNames.forEach(function (measurementName) {
                var result = PerfDiagnostics.diagnostics[measurementName].total;
                console.log(measurementName);
                console.group();
                console.log("Time:", result);
                (grandTotal && measurementName !== "total") ? console.log("%   :", Math.round(result / grandTotal * 10000) / 100) : null;
                console.groupEnd();
            });
        };

        PerfDiagnostics.prototype.toggle = function () {
            if (this.start == null) {
                this.start = PerfDiagnostics.getTime();
            } else {
                this.total += PerfDiagnostics.getTime() - this.start;
                this.numCalls++;
                this.start = null;
            }
        };
        PerfDiagnostics.diagnostics = {};
        return PerfDiagnostics;
    })();
    function toggle(measurementName) {
        return PerfDiagnostics.toggle(measurementName);
    }
    _PerfDiagnostics.toggle = toggle;
    ;
    function logResults() {
        return PerfDiagnostics.logResults();
    }
    _PerfDiagnostics.logResults = logResults;
    ;
})(PerfDiagnostics || (PerfDiagnostics = {}));
window.report = PerfDiagnostics.logResults;
//# sourceMappingURL=plottable.js.map
