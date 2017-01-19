namespace Plottable.Components {
  /**
   * The Legend's column representation. Stores position information
   * as well as data
   */
  class LegendColumn<T> {
    constructor(private _width = 0, private _height = 0, private _data: T) {}

    /**
     * @return {T} data Returns any data stored in the column
     */
    public getData() {
      return this._data;
    }

    /**
     * @return {number} height The height of the column.
     */
    public getHeight() {
      return this._height;
    }

    /**
     * @return {number} width The width of the column.
     */
    public getWidth() {
      return this._width;
    }

    /**
     * @param {number} width Sets the width of the column
     */
    public setWidth(width: number) {
      return this._width = width;
    }
  }

  /**
   * The Legend's row representations. Stores positioning information
   * and column data.
   */
  class LegendRow {
    constructor(
        private _columns: LegendColumn<any>[] = [],
        private _bottomPadding = 0,
        private _maxWidth = Infinity) {}

    public addColumn(column: LegendColumn<any>) {
      const desiredColumnWidth = column.getWidth();
      // choose the smaller of 1) remaining space, 2) desired width
      const widthRemaining = this.getWidthAvailable();
      column.setWidth(Math.min(widthRemaining, desiredColumnWidth));
      this._columns.push(column);
    }

    public forEach(callback: (column: LegendColumn<any>, index?: number) => void) {
      this._columns.forEach(callback);
    }

    public reduce<U>(callbackfn: (
      previousValue: U,
      currentValue: LegendColumn<any>,
      currentIndex: number,
      array: LegendColumn<any>[]) => U, initialValue: U): U {
      return this._columns.reduce(callbackfn, initialValue);
    }

    /**
     * Returns the bounds the column, relative to the row.
     * @param {LegendColumn<any>} column The column in question
     * @returns {Bounds} bounds
     */
    public getBounds(column: LegendColumn<any>) {
      const indexOfColumn = this._columns.indexOf(column);
      const columnXOffset = this._columns.slice(0, indexOfColumn)
        .reduce((sum, column) => sum + column.getWidth(), 0);

      return {
        topLeft: { x: columnXOffset, y: 0 },
        bottomRight: {
          x: columnXOffset + column.getWidth(),
          y: column.getHeight(),
        }
      };
    }

    public getColumns() {
      return this._columns;
    }

    /**
     * Returns the height of the row, including the bottomPadding.
     * @return {number} height
     */
    public getHeight() {
      return Utils.Math.max(this._columns.map((column) => column.getHeight()), 0)
        + this._bottomPadding;
    }

    /**
     * Padding applied below the row. Affects the spacing between rows. Defaults to 0.
     * @param {bottomPadding} number
     */
    public setBottomPadding(bottomPadding: number) {
      this._bottomPadding = bottomPadding;
    }

    /**
     * Sets the maximum allowable width of this column.
     * @param {number} maxWidth
     */
    public setMaxWidth(maxWidth: number) {
      this._maxWidth = maxWidth;
    }

    /**
     * Returns the current width of the row constrained by maxWidth, if set.
     * @returns {number} width
     */
    public getWidth() {
      return Math.min(
        this._columns.reduce((sum, column) => sum + column.getWidth(), 0),
        this._maxWidth
      );
    }

    /**
     * Returns the remaining width available in the row based on the maximum
     * width of this row.
     * @returns {number} widthRemaining
     */
    public getWidthAvailable() {
      const widthConsumed = this.getWidth();
      return Math.max(this._maxWidth - widthConsumed, 0);
    }
  }

  /**
   * Stores LegendRows. Useful for calculating and maintaining
   * positioning information about the Legend.
   */
  class LegendTable {
    constructor(
        private _maxWidth = Infinity,
        private _maxHeight = Infinity,
        private _padding = 0,
        private _rows: LegendRow[] = []) {}

    public addRow(row: LegendRow) {
      row.setMaxWidth(this._maxWidth - this._padding * 2);
      this._rows.push(row);
    }

    public forEach(callback: (row: LegendRow, index?: number) => void) {
      this._rows.forEach(callback);
    }

    /**
     * Returns the bounds relative to the parent and siblings of the row or
     * column. If column is not specified, bounds will be calculate for the row only.
     * If the column is specified, the bounds will be calculate for the column only.
     *
     * @param {LegendRow} row The row to calculate bounds
     * @param {LegendColumn} column The column to calculate bounds.
     * @returns {Bounds}
     */
    public getBounds(row: LegendRow, column?: LegendColumn<any>) {
      const indexOfRow = this._rows.indexOf(row);
      const rowYOffset = this._rows.slice(0, indexOfRow)
        .reduce((sum, row) => sum + row.getHeight(), this._padding);
      const rowXOffset = this._padding;

      const rowBounds = {
        topLeft: { x: rowXOffset, y: rowYOffset },
        bottomRight: {
          x: rowXOffset + row.getWidth(),
          y: rowYOffset + row.getHeight(),
        }
      };

      if (column !== undefined) {
        const columnBounds = row.getBounds(column);
        columnBounds.topLeft.x += rowBounds.topLeft.x;
        columnBounds.bottomRight.x += rowBounds.topLeft.x;

        columnBounds.topLeft.y += rowBounds.topLeft.y;
        columnBounds.bottomRight.y += rowBounds.topLeft.y;
        return columnBounds;
      }

      return rowBounds;
    }

    public getRows() {
      return this._rows;
    }

    /**
     * Returns the height of the Table, constrained by a maximum height, if set.
     * The height includes the padding, if set.
     * @returns {number} height
     */
    public getHeight() {
      return Math.min(
        this._rows.reduce((sum, row) => sum + row.getHeight(), 0) + this._padding * 2,
        this._maxHeight
      );
    }

    /**
     * Returns the width of the table, constrained by the maximum width, if set.
     * The width includes the padding, if set.
     * @returns {number} width
     */
    public getWidth() {
      return Math.min(
        Utils.Math.max(this._rows.map((row) => row.getWidth()), 0) + this._padding * 2,
        this._maxWidth
      );
    }

    public reduce<U>(callbackfn: (
      previousValue: U,
      currentValue: LegendRow,
      currentIndex: number,
      array: LegendRow[]) => U, initialValue: U): U {
      return this._rows.reduce(callbackfn, initialValue);
    }
  }

  export class Legend extends Component {
    /**
     * The css class applied to each legend row
     */
    public static LEGEND_ROW_CLASS = "legend-row";
    /**
     * The css class applied to each legend entry
     */
    public static LEGEND_ENTRY_CLASS = "legend-entry";
    /**
     * The css class applied to each legend symbol
     */
    public static LEGEND_SYMBOL_CLASS = "legend-symbol";

    private _padding = 5;
    private _rowBottomPadding = 3;
    private _colorScale: Scales.Color;
    private _formatter: Formatter;
    private _maxEntriesPerRow: number;
    private _maxLinesPerEntry: number;
    private _maxWidth: number;
    private _comparator: (a: string, b: string) => number;
    private _measurer: SVGTypewriter.Measurer;
    private _wrapper: SVGTypewriter.Wrapper;
    private _writer: SVGTypewriter.Writer;
    private _symbolFactoryAccessor: (datum: any, index: number) => SymbolFactory;
    private _symbolOpacityAccessor: (datum: any, index: number) => number;
    private _redrawCallback: ScaleCallback<Scales.Color>;

    /**
     * The Legend consists of a series of entries, each with a color and label taken from the Color Scale.
     *
     * @constructor
     * @param {Scale.Color} scale
     */
    constructor(colorScale: Scales.Color) {
      super();
      this.addClass("legend");
      this.maxEntriesPerRow(1);

      if (colorScale == null ) {
        throw new Error("Legend requires a colorScale");
      }

      this._colorScale = colorScale;
      this._redrawCallback = (scale) => this.redraw();
      this._colorScale.onUpdate(this._redrawCallback);
      this._formatter = Formatters.identity();
      this.maxLinesPerEntry(1);
      this.xAlignment("right").yAlignment("top");
      this.comparator((a: string, b: string) => {
        let formattedText = this._colorScale.domain().slice().map((d: string) => this._formatter(d));
        return formattedText.indexOf(a) - formattedText.indexOf(b);
      });
      this._symbolFactoryAccessor = () => SymbolFactories.circle();
      this._symbolOpacityAccessor = () => 1;
    }

    protected _setup() {
      super._setup();
      let fakeLegendRow = this.content().append("g").classed(Legend.LEGEND_ROW_CLASS, true);
      let fakeLegendEntry = fakeLegendRow.append("g").classed(Legend.LEGEND_ENTRY_CLASS, true);
      fakeLegendEntry.append("text");
      this._measurer = new SVGTypewriter.Measurer(fakeLegendRow);
      this._wrapper = new SVGTypewriter.Wrappers.Wrapper().maxLines(this.maxLinesPerEntry());
      this._writer = new SVGTypewriter.Writer(this._measurer, this._wrapper).addTitleElement(Configs.ADD_TITLE_ELEMENTS);
    }

    /**
     * Gets the Formatter for the entry texts.
     */
    public formatter(): Formatter;
    /**
     * Sets the Formatter for the entry texts.
     *
     * @param {Formatter} formatter
     * @returns {Legend} The calling Legend.
     */
    public formatter(formatter: Formatter): this;
    public formatter(formatter?: Formatter): any {
      if (formatter == null) {
        return this._formatter;
      }
      this._formatter = formatter;
      this.redraw();
      return this;
    }
    /**
     * Gets the maximum number of entries per row.
     *
     * @returns {number}
     */
    public maxEntriesPerRow(): number;
    /**
     * Sets the maximum number of entries per row.
     *
     * @param {number} maxEntriesPerRow
     * @returns {Legend} The calling Legend.
     */
    public maxEntriesPerRow(maxEntriesPerRow: number): this;
    public maxEntriesPerRow(maxEntriesPerRow?: number): any {
      if (maxEntriesPerRow == null) {
        return this._maxEntriesPerRow;
      } else {
        this._maxEntriesPerRow = maxEntriesPerRow;
        this.redraw();
        return this;
      }
    }
    /**
     * Gets the maximum lines per row.
     *
     * @returns {number}
     */
    public maxLinesPerEntry(): number;
    /**
     * Sets the maximum number of lines per entry. This is distinct from
     * maxEntriesPerRow in that, maxEntriesPerRow determines the maximum allowable
     * number of series labels that may be displayed per row whereas maxLinesPerEntry
     * specifies the maximum number of times a single entry may be broken into new
     * lines before being truncated.
     *
     * @param {number} maxLinesPerEntry
     * @returns {Legend} The calling Legend.
     */
    public maxLinesPerEntry(maxLinesPerEntry: number): this;
    public maxLinesPerEntry(maxLinesPerEntry?: number): any {
      if (maxLinesPerEntry == null) {
        return this._maxLinesPerEntry;
      } else {
        this._maxLinesPerEntry = maxLinesPerEntry;
        this.redraw();
        return this;
      }
    }

    /**
     * Gets teh maximum width of the legend in pixels.
     * @returns {number}
     */
    public maxWidth(): number;
    /**
     * Sets the maximum width of the legend in pixels.
     * @param {number} maxWidth The maximum width in pixels.
     * @returns {Legend}
     */
    public maxWidth(maxWidth: number): this;
    public maxWidth(maxWidth?: number): any {
      if (maxWidth == null) {
        return this._maxWidth;
      } else {
        this._maxWidth = maxWidth;
        this.redraw();
        return this;
      }
    }
    /**
     * Gets the current comparator for the Legend's entries.
     *
     * @returns {(a: string, b: string) => number}
     */
    public comparator(): (a: string, b: string) => number;
    /**
     * Sets a new comparator for the Legend's entries.
     * The comparator is used to set the display order of the entries.
     *
     * @param {(a: string, b: string) => number} comparator
     * @returns {Legend} The calling Legend.
     */
    public comparator(comparator: (a: string, b: string) => number): this;
    public comparator(comparator?: (a: string, b: string) => number): any {
      if (comparator == null) {
        return this._comparator;
      } else {
        this._comparator = comparator;
        this.redraw();
        return this;
      }
    }

    /**
     * Gets the Color Scale.
     *
     * @returns {Scales.Color}
     */
    public colorScale(): Scales.Color;
    /**
     * Sets the Color Scale.
     *
     * @param {Scales.Color} scale
     * @returns {Legend} The calling Legend.
     */
    public colorScale(colorScale: Scales.Color): this;
    public colorScale(colorScale?: Scales.Color): any {
      if (colorScale != null) {
        this._colorScale.offUpdate(this._redrawCallback);
        this._colorScale = colorScale;
        this._colorScale.onUpdate(this._redrawCallback);
        this.redraw();
        return this;
      } else {
        return this._colorScale;
      }
    }

    public destroy() {
      super.destroy();
      this._colorScale.offUpdate(this._redrawCallback);
    }

    private _buildLegendTable(width: number, height: number) {
      let textHeight = this._measurer.measure().height;

      const table = new LegendTable(width, height, this._padding);
      const entryNames = this._colorScale.domain().slice().sort((a, b) => this._comparator(this._formatter(a), this._formatter(b)));

      let row: LegendRow = new LegendRow();
      table.addRow(row);
      entryNames.forEach((entryName, index) => {
        if (row.getColumns().length / 2 === this.maxEntriesPerRow()) {
          // we add two columns per entry, a symbol column and a name column
          // if the current row is full, according to the number of entries
          // we're allowed to have per row, we need to allocate new space
          row = new LegendRow();
          row.setBottomPadding(this._rowBottomPadding);
          table.addRow(row);
        }

        let availableWidth = row.getWidthAvailable();
        const formattedName = this._formatter(entryName);
        // this is the width of the series name without any line wrapping
        // it is the most optimal presentation of the name
        const unwrappedNameWidth = this._measurer.measure(formattedName).width;
        const willBeSquished = (availableWidth - textHeight - unwrappedNameWidth) < 0;

        if (willBeSquished && row.getColumns().length > 1) {
          // adding the entry to this row will squish this
          // entry. The row already contains entries so create
          // a new row to add this entry to for optimal display
          row = new LegendRow();
          row.setBottomPadding(this._rowBottomPadding);
          table.addRow(row);
        }

        const symbolColumn = new LegendColumn(textHeight, textHeight, entryName);
        row.addColumn(symbolColumn);

        // the space consumed by the name field is the minimum of the space available in the table
        // and the actual width consumed by the name
        availableWidth = row.getWidthAvailable();
        const usedNameWidth = Math.min(availableWidth, unwrappedNameWidth);

        this._wrapper.maxLines(this.maxLinesPerEntry());
        let numberOfRows = this._wrapper.wrap(formattedName, this._measurer, usedNameWidth).noLines;

        let nameColumnHeight = numberOfRows * textHeight;
        const nameColumn = new LegendColumn(usedNameWidth, nameColumnHeight, entryName);
        row.addColumn(nameColumn);
      });

      return table;
    }

    public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
      // if max width is set, the table is guaranteed to be at most maxWidth wide.
      // if max width is not set, the table will be as wide as the longest untruncated row
      const table = this._buildLegendTable(Utils.Math.min([this.maxWidth(), Infinity], Infinity), offeredHeight);

      return {
        minHeight: table.getHeight(),
        minWidth: table.getWidth()
      };
    }

    /**
     * Gets the Entities (representing Legend entries) at a particular point.
     * Returns an empty array if no Entities are present at that location.
     *
     * @param {Point} p
     * @returns {Entity<Legend>[]}
     */
    public entitiesAt(p: Point) {
      if (!this._isSetup) {
        return [];
      }

      function within(p: Point, bounds: Bounds) {
        return bounds.topLeft.x <= p.x
          && bounds.bottomRight.x >= p.x
          && bounds.topLeft.y <= p.y
          && bounds.bottomRight.y >= p.y;
      };

      const table = this._buildLegendTable(this.width(), this.height());
      return table.reduce((entity: Entity<Legend>[], row: LegendRow, rowIndex: number) => {
        if (entity.length !== 0) {
          // we've already found the nearest entity; just return it.
          return entity;
        }

        const rowBounds = table.getBounds(row);
        const withinRow = within(p, rowBounds);

        if (!withinRow) {
          // the nearest entity isn't within this row, continue;
          return entity;
        }

        return row.reduce((entity: Entity<Legend>[], column: LegendColumn<string>, columnIndex: number) => {
          const columnBounds = table.getBounds(row, column);
          const withinColumn = within(p, columnBounds);

          if (withinColumn) {
            const rowElement = this.content().selectAll(`.${Legend.LEGEND_ROW_CLASS}`)[0][rowIndex];
            // HACKHACK The 2.x API chooses the symbol element as the "selection" to return, regardless of what
            // was actually selected
            const entryElement = d3.select(rowElement)
              .selectAll(`.${Legend.LEGEND_ENTRY_CLASS}`)[0][Math.floor(columnIndex / 2)];
             const symbolElement = d3.select(entryElement).select(`.${Legend.LEGEND_SYMBOL_CLASS}`);

            // HACKHACK The 2.x API returns the center {x, y} of the symbol as the position.
            const rowTranslate = d3.transform(d3.select(rowElement).attr("transform")).translate;
            const symbolTranslate = d3.transform(symbolElement.attr("transform")).translate;

            return [{
              datum: column.getData(),
              position: { x: rowTranslate[0] + symbolTranslate[0], y: rowTranslate[1] + symbolTranslate[1] },
              selection: d3.select(entryElement),
              component: this,
            }];
          }

          return entity;
        }, entity);

      }, [] as Entity<Legend>[])
    }

    public renderImmediately() {
      super.renderImmediately();
      const table = this._buildLegendTable(this.width(), this.height());
      const entryNames = this._colorScale.domain().slice().sort((a, b) => this._comparator(this._formatter(a), this._formatter(b)));

      // clear content from previous renders
      this.content().selectAll("*").remove();
      const tableRoot = this.content();

      table.forEach((row: LegendRow, rowIndex: number) => {
        const rowBounds = table.getBounds(row);
        const rowRoot = tableRoot.append("g").classed(Legend.LEGEND_ROW_CLASS, true)
          .attr("transform", `translate(${rowBounds.topLeft.x}, ${rowBounds.topLeft.y})`);

        let rowEntry: d3.Selection<any>;
        const rowElement = row.forEach((column: LegendColumn<string>, index: number) => {
          const columnBounds = table.getBounds(row, column);

          if (index % 2  === 0) {
            // symbols are at even indices in the rows of our table

            // HACKHACK need a legend entry element to maintain back compat with 2.x
            rowEntry = rowRoot.append("g").classed(Legend.LEGEND_ENTRY_CLASS, true);
            rowEntry.append("path")
              .attr("d", this.symbol()(column.getData(), rowIndex)(column.getHeight() * 0.6))
              .attr("transform", `translate(${columnBounds.topLeft.x + column.getWidth() / 2}, ${column.getHeight() / 2})`)
              .attr("fill", this._colorScale.scale(column.getData()))
              .attr("opacity", this.symbolOpacity()(column.getData(), rowIndex))
              .classed(Legend.LEGEND_SYMBOL_CLASS, true);
          } else {
            // series names are at odd indicies in the rows of our table

            // HACKHACK add data to element to maintain backcompat with 2.x
            rowEntry.data(() => [column.getData()]);

            const textContainer = rowEntry.append("g").classed("text-container", true)
              .attr("transform", "translate(" + columnBounds.topLeft.x + ", 0)");

            const writeOptions = {
              selection: textContainer,
              xAlign: "left",
              yAlign: "top",
              textRotation: 0,
            };
            this._writer.write(this._formatter(column.getData()), column.getWidth(), this.height(), writeOptions);
          }
        });
      });

      return this;
    }

    /**
     * Gets the function determining the symbols of the Legend.
     *
     * @returns {(datum: any, index: number) => symbolFactory}
     */
    public symbol(): (datum: any, index: number) => SymbolFactory;
    /**
     * Sets the function determining the symbols of the Legend.
     *
     * @param {(datum: any, index: number) => SymbolFactory} symbol
     * @returns {Legend} The calling Legend
     */
    public symbol(symbol: (datum: any, index: number) => SymbolFactory): this;
    public symbol(symbol?: (datum: any, index: number) => SymbolFactory): any {
      if (symbol == null) {
        return this._symbolFactoryAccessor;
      } else {
        this._symbolFactoryAccessor = symbol;
        this.render();
        return this;
      }
    }

    /**
     * Gets the opacity of the symbols of the Legend.
     *
     * @returns {(datum: any, index: number) => number}
     */
    public symbolOpacity(): (datum: any, index: number) => number;
    /**
     * Sets the opacity of the symbols of the Legend.
     *
     * @param {number | ((datum: any, index: number) => number)} symbolOpacity
     * @returns {Legend} The calling Legend
     */
    public symbolOpacity(symbolOpacity: number | ((datum: any, index: number) => number)): this;
    public symbolOpacity(symbolOpacity?: number | ((datum: any, index: number) => number)): any {
      if (symbolOpacity == null) {
        return this._symbolOpacityAccessor;
      } else if (typeof symbolOpacity === "number") {
        this._symbolOpacityAccessor = () => symbolOpacity;
      } else {
        this._symbolOpacityAccessor = symbolOpacity;
      }
      this.render();
      return this;
    }

    public fixedWidth() {
      return true;
    }

    public fixedHeight() {
      return true;
    }
  }
}
