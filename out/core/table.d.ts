/// <reference path="../reference.d.ts" />
declare module Plottable {
    interface IterateLayoutResult {
        colProportionalSpace: number[];
        rowProportionalSpace: number[];
        guaranteedWidths: number[];
        guaranteedHeights: number[];
        wantsWidth: boolean;
        wantsHeight: boolean;
    }
    class Table extends ComponentContainer {
        private rowPadding;
        private colPadding;
        private rows;
        private minimumHeights;
        private minimumWidths;
        private rowWeights;
        private colWeights;
        private nRows;
        private nCols;
        /**
        * Creates a Table.
        *
        * @constructor
        * @param {Component[][]} [rows] A 2-D array of the Components to place in the table.
        * null can be used if a cell is empty.
        */
        constructor(rows?: Component[][]);
        /**
        * Adds a Component in the specified cell.
        *
        * @param {number} row The row in which to add the Component.
        * @param {number} col The column in which to add the Component.
        * @param {Component} component The Component to be added.
        */
        public addComponent(row: number, col: number, component: Component): Table;
        public _removeComponent(c: Component): Table;
        private iterateLayout(availableWidth, availableHeight);
        private determineGuarantees(offeredWidths, offeredHeights);
        public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest;
        public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): Table;
        /**
        * Sets the row and column padding on the Table.
        *
        * @param {number} rowPadding The padding above and below each row, in pixels.
        * @param {number} colPadding the padding to the left and right of each column, in pixels.
        * @returns {Table} The calling Table.
        */
        public padding(rowPadding: number, colPadding: number): Table;
        /**
        * Sets the layout weight of a particular row.
        * Space is allocated to rows based on their weight. Rows with higher weights receive proportionally more space.
        *
        * @param {number} index The index of the row.
        * @param {number} weight The weight to be set on the row.
        * @returns {Table} The calling Table.
        */
        public rowWeight(index: number, weight: number): Table;
        /**
        * Sets the layout weight of a particular column.
        * Space is allocated to columns based on their weight. Columns with higher weights receive proportionally more space.
        *
        * @param {number} index The index of the column.
        * @param {number} weight The weight to be set on the column.
        * @returns {Table} The calling Table.
        */
        public colWeight(index: number, weight: number): Table;
        public _isFixedWidth(): boolean;
        public _isFixedHeight(): boolean;
        private padTableToSize(nRows, nCols);
        private static calcComponentWeights(setWeights, componentGroups, fixityAccessor);
        private static calcProportionalSpace(weights, freeSpace);
        private static fixedSpace(componentGroup, fixityAccessor);
    }
}
