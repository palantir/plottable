///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    ;

    var Table = (function (_super) {
        __extends(Table, _super);
        /**
        * Creates a Table.
        *
        * @constructor
        * @param {Component[][]} [rows] A 2-D array of the Components to place in the table.
        * null can be used if a cell is empty.
        */
        function Table(rows) {
            if (typeof rows === "undefined") { rows = []; }
            var _this = this;
            _super.call(this);
            this.rowPadding = 0;
            this.colPadding = 0;
            this.rows = [];
            this.rowWeights = [];
            this.colWeights = [];
            this.nRows = 0;
            this.nCols = 0;
            this.classed("table", true);
            rows.forEach(function (row, rowIndex) {
                row.forEach(function (component, colIndex) {
                    _this.addComponent(rowIndex, colIndex, component);
                });
            });
        }
        /**
        * Adds a Component in the specified cell.
        *
        * @param {number} row The row in which to add the Component.
        * @param {number} col The column in which to add the Component.
        * @param {Component} component The Component to be added.
        */
        Table.prototype.addComponent = function (row, col, component) {
            if (this._addComponent(component)) {
                this.nRows = Math.max(row + 1, this.nRows);
                this.nCols = Math.max(col + 1, this.nCols);
                this.padTableToSize(this.nRows, this.nCols);

                var currentComponent = this.rows[row][col];
                if (currentComponent != null) {
                    throw new Error("Table.addComponent cannot be called on a cell where a component already exists (for the moment)");
                }

                this.rows[row][col] = component;
            }
            return this;
        };

        Table.prototype._removeComponent = function (c) {
            _super.prototype._removeComponent.call(this, c);
            var rowpos;
            var colpos;
            outer:
            for (var i = 0; i < this.nRows; i++) {
                for (var j = 0; j < this.nCols; j++) {
                    if (this.rows[i][j] === c) {
                        rowpos = i;
                        colpos = j;
                        break outer;
                    }
                }
            }

            if (rowpos === undefined) {
                return this;
            }

            this.rows[rowpos][colpos] = null;

            // check if can splice out row
            if (this.rows[rowpos].every(function (v) {
                return v === null;
            })) {
                this.rows.splice(rowpos, 1);
                this.rowWeights.splice(rowpos, 1);
                this.nRows--;
            }

            // check if can splice out column
            if (this.rows.every(function (v) {
                return v[colpos] === null;
            })) {
                this.rows.forEach(function (r) {
                    return r.splice(colpos, 1);
                });
                this.colWeights.splice(colpos, 1);
                this.nCols--;
            }

            return this;
        };

        Table.prototype.iterateLayout = function (availableWidth, availableHeight) {
            /*
            * Given availableWidth and availableHeight, figure out how to allocate it between rows and columns using an iterative algorithm.
            *
            * For both dimensions, keeps track of "guaranteedSpace", which the fixed-size components have requested, and
            * "proportionalSpace", which is being given to proportionally-growing components according to the weights on the table.
            * Here is how it works (example uses width but it is the same for height). First, columns are guaranteed no width, and
            * the free width is allocated to columns based on their colWeights. Then, in determineGuarantees, every component is
            * offered its column's width and may request some amount of it, which increases that column's guaranteed
            * width. If there are some components that were not satisfied with the width they were offered, and there is free
            * width that has not already been guaranteed, then the remaining width is allocated to the unsatisfied columns and the
            * algorithm runs again. If all components are satisfied, then the remaining width is allocated as proportional space
            * according to the colWeights.
            *
            * The guaranteed width for each column is monotonically increasing as the algorithm iterates. Since it is deterministic
            * and monotonically increasing, if the freeWidth does not change during an iteration it implies that no further progress
            * is possible, so the algorithm will not continue iterating on that dimension's account.
            *
            * If the algorithm runs more than 5 times, we stop and just use whatever we arrived at. It's not clear under what
            * circumstances this will happen or if it will happen at all. A message will be printed to the console if this occurs.
            *
            */
            var cols = d3.transpose(this.rows);
            var availableWidthAfterPadding = availableWidth - this.colPadding * (this.nCols - 1);
            var availableHeightAfterPadding = availableHeight - this.rowPadding * (this.nRows - 1);

            var rowWeights = Table.calcComponentWeights(this.rowWeights, this.rows, function (c) {
                return (c == null) || c._isFixedHeight();
            });
            var colWeights = Table.calcComponentWeights(this.colWeights, cols, function (c) {
                return (c == null) || c._isFixedWidth();
            });

            // To give the table a good starting position to iterate from, we give the fixed-width components half-weight
            // so that they will get some initial space allocated to work with
            var heuristicColWeights = colWeights.map(function (c) {
                return c === 0 ? 0.5 : c;
            });
            var heuristicRowWeights = rowWeights.map(function (c) {
                return c === 0 ? 0.5 : c;
            });

            var colProportionalSpace = Table.calcProportionalSpace(heuristicColWeights, availableWidthAfterPadding);
            var rowProportionalSpace = Table.calcProportionalSpace(heuristicRowWeights, availableHeightAfterPadding);

            var guaranteedWidths = Plottable.Utils.createFilledArray(0, this.nCols);
            var guaranteedHeights = Plottable.Utils.createFilledArray(0, this.nRows);

            var freeWidth;
            var freeHeight;

            var nIterations = 0;
            while (true) {
                var offeredHeights = Plottable.Utils.addArrays(guaranteedHeights, rowProportionalSpace);
                var offeredWidths = Plottable.Utils.addArrays(guaranteedWidths, colProportionalSpace);
                var guarantees = this.determineGuarantees(offeredWidths, offeredHeights);
                guaranteedWidths = guarantees.guaranteedWidths;
                guaranteedHeights = guarantees.guaranteedHeights;
                var wantsWidth = guarantees.wantsWidthArr.some(function (x) {
                    return x;
                });
                var wantsHeight = guarantees.wantsHeightArr.some(function (x) {
                    return x;
                });

                var lastFreeWidth = freeWidth;
                var lastFreeHeight = freeHeight;
                freeWidth = availableWidthAfterPadding - d3.sum(guarantees.guaranteedWidths);
                freeHeight = availableHeightAfterPadding - d3.sum(guarantees.guaranteedHeights);
                var xWeights;
                if (wantsWidth) {
                    xWeights = guarantees.wantsWidthArr.map(function (x) {
                        return x ? 1 : 0;
                    });
                } else {
                    xWeights = colWeights;
                }

                var yWeights;
                if (wantsHeight) {
                    yWeights = guarantees.wantsHeightArr.map(function (x) {
                        return x ? 1 : 0;
                    });
                } else {
                    yWeights = rowWeights;
                }

                colProportionalSpace = Table.calcProportionalSpace(xWeights, freeWidth);
                rowProportionalSpace = Table.calcProportionalSpace(yWeights, freeHeight);
                nIterations++;

                var canImproveWidthAllocation = freeWidth > 0 && wantsWidth && freeWidth !== lastFreeWidth;
                var canImproveHeightAllocation = freeHeight > 0 && wantsHeight && freeHeight !== lastFreeHeight;

                if (!(canImproveWidthAllocation || canImproveHeightAllocation)) {
                    break;
                }

                if (nIterations > 5) {
                    console.log("More than 5 iterations in Table.iterateLayout; please report the circumstances");
                    break;
                }
            }

            // Redo the proportional space one last time, to ensure we use the real weights not the wantsWidth/Height weights
            freeWidth = availableWidthAfterPadding - d3.sum(guarantees.guaranteedWidths);
            freeHeight = availableHeightAfterPadding - d3.sum(guarantees.guaranteedHeights);
            colProportionalSpace = Table.calcProportionalSpace(colWeights, freeWidth);
            rowProportionalSpace = Table.calcProportionalSpace(rowWeights, freeHeight);

            return {
                colProportionalSpace: colProportionalSpace,
                rowProportionalSpace: rowProportionalSpace,
                guaranteedWidths: guarantees.guaranteedWidths,
                guaranteedHeights: guarantees.guaranteedHeights,
                wantsWidth: wantsWidth,
                wantsHeight: wantsHeight };
        };

        Table.prototype.determineGuarantees = function (offeredWidths, offeredHeights) {
            var requestedWidths = Plottable.Utils.createFilledArray(0, this.nCols);
            var requestedHeights = Plottable.Utils.createFilledArray(0, this.nRows);
            var layoutWantsWidth = Plottable.Utils.createFilledArray(false, this.nCols);
            var layoutWantsHeight = Plottable.Utils.createFilledArray(false, this.nRows);
            this.rows.forEach(function (row, rowIndex) {
                row.forEach(function (component, colIndex) {
                    var spaceRequest;
                    if (component != null) {
                        spaceRequest = component._requestedSpace(offeredWidths[colIndex], offeredHeights[rowIndex]);
                    } else {
                        spaceRequest = { width: 0, height: 0, wantsWidth: false, wantsHeight: false };
                    }
                    if (spaceRequest.width > offeredWidths[colIndex] || spaceRequest.height > offeredHeights[rowIndex]) {
                        throw new Error("Invariant Violation: Component cannot request more space than is offered");
                    }

                    requestedWidths[colIndex] = Math.max(requestedWidths[colIndex], spaceRequest.width);
                    requestedHeights[rowIndex] = Math.max(requestedHeights[rowIndex], spaceRequest.height);
                    layoutWantsWidth[colIndex] = layoutWantsWidth[colIndex] || spaceRequest.wantsWidth;
                    layoutWantsHeight[rowIndex] = layoutWantsHeight[rowIndex] || spaceRequest.wantsHeight;
                });
            });
            return {
                guaranteedWidths: requestedWidths,
                guaranteedHeights: requestedHeights,
                wantsWidthArr: layoutWantsWidth,
                wantsHeightArr: layoutWantsHeight };
        };

        Table.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
            var layout = this.iterateLayout(offeredWidth, offeredHeight);
            return {
                width: d3.sum(layout.guaranteedWidths),
                height: d3.sum(layout.guaranteedHeights),
                wantsWidth: layout.wantsWidth,
                wantsHeight: layout.wantsHeight };
        };

        Table.prototype._computeLayout = function (xOffset, yOffset, availableWidth, availableHeight) {
            var _this = this;
            _super.prototype._computeLayout.call(this, xOffset, yOffset, availableWidth, availableHeight);
            var layout = this.iterateLayout(this.availableWidth, this.availableHeight);

            var sumPair = function (p) {
                return p[0] + p[1];
            };
            var rowHeights = Plottable.Utils.addArrays(layout.rowProportionalSpace, layout.guaranteedHeights);
            var colWidths = Plottable.Utils.addArrays(layout.colProportionalSpace, layout.guaranteedWidths);
            var childYOffset = 0;
            this.rows.forEach(function (row, rowIndex) {
                var childXOffset = 0;
                row.forEach(function (component, colIndex) {
                    // recursively compute layout
                    if (component != null) {
                        component._computeLayout(childXOffset, childYOffset, colWidths[colIndex], rowHeights[rowIndex]);
                    }
                    childXOffset += colWidths[colIndex] + _this.colPadding;
                });
                childYOffset += rowHeights[rowIndex] + _this.rowPadding;
            });
            return this;
        };

        /**
        * Sets the row and column padding on the Table.
        *
        * @param {number} rowPadding The padding above and below each row, in pixels.
        * @param {number} colPadding the padding to the left and right of each column, in pixels.
        * @returns {Table} The calling Table.
        */
        Table.prototype.padding = function (rowPadding, colPadding) {
            this.rowPadding = rowPadding;
            this.colPadding = colPadding;
            this._invalidateLayout();
            return this;
        };

        /**
        * Sets the layout weight of a particular row.
        * Space is allocated to rows based on their weight. Rows with higher weights receive proportionally more space.
        *
        * @param {number} index The index of the row.
        * @param {number} weight The weight to be set on the row.
        * @returns {Table} The calling Table.
        */
        Table.prototype.rowWeight = function (index, weight) {
            this.rowWeights[index] = weight;
            this._invalidateLayout();
            return this;
        };

        /**
        * Sets the layout weight of a particular column.
        * Space is allocated to columns based on their weight. Columns with higher weights receive proportionally more space.
        *
        * @param {number} index The index of the column.
        * @param {number} weight The weight to be set on the column.
        * @returns {Table} The calling Table.
        */
        Table.prototype.colWeight = function (index, weight) {
            this.colWeights[index] = weight;
            this._invalidateLayout();
            return this;
        };

        Table.prototype._isFixedWidth = function () {
            var cols = d3.transpose(this.rows);
            return Table.fixedSpace(cols, function (c) {
                return (c == null) || c._isFixedWidth();
            });
        };

        Table.prototype._isFixedHeight = function () {
            return Table.fixedSpace(this.rows, function (c) {
                return (c == null) || c._isFixedHeight();
            });
        };

        Table.prototype.padTableToSize = function (nRows, nCols) {
            for (var i = 0; i < nRows; i++) {
                if (this.rows[i] === undefined) {
                    this.rows[i] = [];
                    this.rowWeights[i] = null;
                }
                for (var j = 0; j < nCols; j++) {
                    if (this.rows[i][j] === undefined) {
                        this.rows[i][j] = null;
                    }
                }
            }
            for (j = 0; j < nCols; j++) {
                if (this.colWeights[j] === undefined) {
                    this.colWeights[j] = null;
                }
            }
        };

        Table.calcComponentWeights = function (setWeights, componentGroups, fixityAccessor) {
            // If the row/col weight was explicitly set, then return it outright
            // If the weight was not explicitly set, then guess it using the heuristic that if all components are fixed-space
            // then weight is 0, otherwise weight is 1
            return setWeights.map(function (w, i) {
                if (w != null) {
                    return w;
                }
                var fixities = componentGroups[i].map(fixityAccessor);
                var allFixed = fixities.reduce(function (a, b) {
                    return a && b;
                }, true);
                return allFixed ? 0 : 1;
            });
        };

        Table.calcProportionalSpace = function (weights, freeSpace) {
            var weightSum = d3.sum(weights);
            if (weightSum === 0) {
                return Plottable.Utils.createFilledArray(0, weights.length);
            } else {
                return weights.map(function (w) {
                    return freeSpace * w / weightSum;
                });
            }
        };

        Table.fixedSpace = function (componentGroup, fixityAccessor) {
            var all = function (bools) {
                return bools.reduce(function (a, b) {
                    return a && b;
                }, true);
            };
            var group_isFixed = function (components) {
                return all(components.map(fixityAccessor));
            };
            return all(componentGroup.map(group_isFixed));
        };
        return Table;
    })(Plottable.ComponentContainer);
    Plottable.Table = Table;
})(Plottable || (Plottable = {}));
