/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as Typesetter from "typesettable";

import * as Configs from "../core/config";
import * as Formatters from "../core/formatters";
import { Formatter } from "../core/formatters";
import { SpaceRequest, Point, Entity } from "../core/interfaces";
import * as SymbolFactories from "../core/symbolFactories";
import { SymbolFactory } from "../core/symbolFactories";
import { ScaleCallback } from "../scales/scale";
import * as Scales from "../scales";
import * as Utils from "../utils";

import { Component } from "./component";

/**
 * The Legend's column representation. Stores position information
 * as well as data
 */
interface LegendColumn<T> {
  /**
   * Data stored in the column
   */
  data: T;
  /**
   * Width of the column in pixels
   */
  width: number;
  /**
   * Height of the column in pixels
   */
  height: number;
}

/**
 * The Legend's row representations. Stores positioning information
 * and column data.
 */
class LegendRow {
  constructor(
    /**
     * Columns within the row
     * @param {LegendColumn<any>[]} columns
     */
    public columns: LegendColumn<any>[] = [],
    /**
     * Padding applied below the row. Affects the spacing between rows. Defaults to 0.
     * @param {bottomPadding} number
     */
    public bottomPadding = 0,
    /**
     * Sets the maximum allowable width of this column.
     * @param {number} maxWidth
     */
    public maxWidth = Infinity) {}

  /**
   * Adds a column to the list of columns within the row. May readjust the size of the
   * column to fit within the row
   *
   * @param {LegendColumn<any>} column
   */
  public addColumn(column: LegendColumn<any>) {
    const desiredColumnWidth = column.width;

    // choose the smaller of 1) remaining space, 2) desired width
    const widthRemaining = this.getWidthAvailable();
    column.width = Math.min(widthRemaining, desiredColumnWidth);
    this.columns.push(column);
  }

  /**
   * Returns the bounds the column, relative to the row.
   * @param {number} columnIndex The index of the column in question
   * @returns {Bounds} bounds
   */
  public getBounds(columnIndex: number) {
    const column = this.columns[columnIndex];

    let columnXOffset = 0;
    for (let i = 0; i < columnIndex; i++) {
      columnXOffset += this.columns[i].width;
    }

    return {
      topLeft: { x: columnXOffset, y: 0 },
      bottomRight: {
        x: columnXOffset + column.width,
        y: column.height,
      }
    };
  }

  /**
   * Returns the height of the row, including the bottomPadding.
   * @return {number} height
   */
  public getHeight() {
    return Utils.Math.max(this.columns.map(({ height }) => height), 0) + this.bottomPadding;
  }

  /**
   * Returns the current width of the row constrained by maxWidth, if set.
   * @returns {number} width
   */
  public getWidth() {
    return Math.min(
      this.columns.reduce((sum, { width }) => sum + width, 0),
      this.maxWidth
    );
  }

  /**
   * Returns the remaining width available in the row based on the maximum
   * width of this row.
   * @returns {number} widthRemaining
   */
  public getWidthAvailable() {
    const widthConsumed = this.getWidth();
    return Math.max(this.maxWidth - widthConsumed, 0);
  }
}

/**
 * Stores LegendRows. Useful for calculating and maintaining
 * positioning information about the Legend.
 */
class LegendTable {
  constructor(public maxWidth = Infinity,
              public maxHeight = Infinity,
              public padding = 0,
              public rows: LegendRow[] = []) {
  }

  public addRow(row: LegendRow) {
    row.maxWidth = this.maxWidth - this.padding * 2;
    this.rows.push(row);
  }

  /**
   * Returns the bounds of the column relative to the parent and siblings of the
   * column.
   *
   * @param {number} rowIndex The parent row containing the desired column.
   * @param {number} columnIndex The column to calculate bounds.
   * @returns {Bounds}
   */
  public getColumnBounds(rowIndex: number, columnIndex: number) {
    const rowBounds = this.getRowBounds(rowIndex);

    const columnBounds = this.rows[rowIndex].getBounds(columnIndex);
    columnBounds.topLeft.x += rowBounds.topLeft.x;
    columnBounds.bottomRight.x += rowBounds.topLeft.x;

    columnBounds.topLeft.y += rowBounds.topLeft.y;
    columnBounds.bottomRight.y += rowBounds.topLeft.y;
    return columnBounds;
  }

  /**
   * Returns the bounds relative to the parent and siblings of the row.
   *
   * @param {number} rowIndex The row to calculate bounds
   * @returns {Bounds}
   */
  public getRowBounds(rowIndex: number) {
    const rowXOffset = this.padding;

    let rowYOffset = this.padding;
    for (let i = 0; i < rowIndex; i++) {
      rowYOffset += this.rows[i].getHeight();
    }

    const rowBounds = {
      topLeft: { x: rowXOffset, y: rowYOffset },
      bottomRight: {
        x: rowXOffset + this.rows[rowIndex].getWidth(),
        y: rowYOffset + this.rows[rowIndex].getHeight(),
      }
    };

    return rowBounds;
  }

  /**
   * Returns the height of the Table, constrained by a maximum height, if set.
   * The height includes the padding, if set.
   * @returns {number} height
   */
  public getHeight() {
    return Math.min(
      this.rows.reduce((sum, row) => sum + row.getHeight(), 0) + this.padding * 2,
      this.maxHeight
    );
  }

  /**
   * Returns the width of the table, constrained by the maximum width, if set.
   * The width includes the padding, if set.
   * @returns {number} width
   */
  public getWidth() {
    return Math.min(
      Utils.Math.max(this.rows.map((row) => row.getWidth()), 0) + this.padding * 2,
      this.maxWidth
    );
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
  private _measurer: Typesetter.Measurer;
  private _wrapper: Typesetter.Wrapper;
  private _writer: Typesetter.Writer;
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

    if (colorScale == null) {
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
    const context = new Typesetter.SvgContext(fakeLegendRow.node() as SVGElement, null, Configs.ADD_TITLE_ELEMENTS);
    this._measurer = new Typesetter.Measurer(context);
    this._wrapper = new Typesetter.Wrapper().maxLines(this.maxLinesPerEntry());
    this._writer = new Typesetter.Writer(this._measurer, context, this._wrapper);
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
   * Gets the maximum width of the legend in pixels.
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
    row.bottomPadding = this._rowBottomPadding;
    entryNames.forEach((name, index) => {
      if (row.columns.length / 2 === this.maxEntriesPerRow()) {
        // we add two columns per entry, a symbol column and a name column
        // if the current row is full, according to the number of entries
        // we're allowed to have per row, we need to allocate new space
        row = new LegendRow();
        row.bottomPadding = this._rowBottomPadding;
        table.addRow(row);
      }

      let availableWidth = row.getWidthAvailable();
      const formattedName = this._formatter(name);
      // this is the width of the series name without any line wrapping
      // it is the most optimal presentation of the name
      const unwrappedNameWidth = this._measurer.measure(formattedName).width;
      const willBeSquished = (availableWidth - textHeight - unwrappedNameWidth) < 0;

      if (willBeSquished && row.columns.length > 1) {
        // adding the entry to this row will squish this
        // entry. The row already contains entries so create
        // a new row to add this entry to for optimal display
        row = new LegendRow();
        row.bottomPadding = this._rowBottomPadding;
        table.addRow(row);
      }

      const symbolColumn = { width: textHeight, height: textHeight, data: { name, type: "symbol" } };
      row.addColumn(symbolColumn);

      // the space consumed by the name field is the minimum of the space available in the table
      // and the actual width consumed by the name
      availableWidth = row.getWidthAvailable();
      const usedNameWidth = Math.min(availableWidth, unwrappedNameWidth);

      this._wrapper.maxLines(this.maxLinesPerEntry());
      let numberOfRows = this._wrapper.wrap(formattedName, this._measurer, usedNameWidth).noLines;

      let nameColumnHeight = numberOfRows * textHeight;
      const nameColumn = { width: usedNameWidth, height: nameColumnHeight, data: { name, type: "text" } };
      row.addColumn(nameColumn);
    });

    return table;
  }

  public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
    // if max width is set, the table is guaranteed to be at most maxWidth wide.
    // if max width is not set, the table will be as wide as the longest untruncated row
    const table = this._buildLegendTable(
      Utils.Math.min([this.maxWidth(), offeredWidth], offeredWidth),
      offeredHeight
    );

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
  public entitiesAt(p: Point): Entity<Legend>[] {
    if (!this._isSetup) {
      return [];
    }

    const table = this._buildLegendTable(this.width(), this.height());
    return table.rows.reduce((entity: Entity<Legend>[], row: LegendRow, rowIndex: number) => {
      if (entity.length !== 0) {
        // we've already found the nearest entity; just return it.
        return entity;
      }

      const rowBounds = table.getRowBounds(rowIndex);
      const withinRow = Utils.Math.within(p, rowBounds);

      if (!withinRow) {
        // the nearest entity isn't within this row, continue;
        return entity;
      }

      return row.columns.reduce((entity: Entity<Legend>[], column: LegendColumn<{ name: string, type: string }>, columnIndex: number) => {
        const columnBounds = table.getColumnBounds(rowIndex, columnIndex);
        const withinColumn = Utils.Math.within(p, columnBounds);

        if (withinColumn) {
          const rowElement = this.content().selectAll(`.${Legend.LEGEND_ROW_CLASS}`).nodes()[rowIndex];
          // HACKHACK The 2.x API chooses the symbol element as the "selection" to return, regardless of what
          // was actually selected
          const entryElement = d3.select(rowElement)
            .selectAll(`.${Legend.LEGEND_ENTRY_CLASS}`).nodes()[Math.floor(columnIndex / 2)];
          const symbolElement = d3.select(entryElement).select(`.${Legend.LEGEND_SYMBOL_CLASS}`);

          // HACKHACK The 2.x API returns the center {x, y} of the symbol as the position.
          const rowTranslate = Utils.DOM.getTranslateValues(d3.select(rowElement));
          const symbolTranslate = Utils.DOM.getTranslateValues(symbolElement);

          return [{
            datum: column.data.name,
            position: {
              x: rowTranslate[0] + symbolTranslate[0],
              y: rowTranslate[1] + symbolTranslate[1]
            },
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
    const rowsUpdate = this.content().selectAll("g." + Legend.LEGEND_ROW_CLASS).data(table.rows);
    const rows =
      rowsUpdate
        .enter()
        .append("g")
          .classed(Legend.LEGEND_ROW_CLASS, true)
        .merge(rowsUpdate);
    rowsUpdate.exit().remove();
    rows.attr("transform", (row, rowIndex) => {
      const rowBounds = table.getRowBounds(rowIndex);
      return `translate(${rowBounds.topLeft.x}, ${rowBounds.topLeft.y})`;
    });

    type SymbolEntryPair = [ LegendColumn<{name: string, type: string }>, LegendColumn<{ name: string, type: string}> ];

    const self = this;
    rows.each(function (row, rowIndex) {
      const symbolEntryPairs: SymbolEntryPair[] = [];
      for (let i = 0; i < row.columns.length; i += 2) {
        symbolEntryPairs.push([row.columns[i], row.columns[i + 1]]);
      }

      const entriesUpdate = d3.select(this).selectAll(`g.${Legend.LEGEND_ENTRY_CLASS}`).data(symbolEntryPairs);
      const entriesEnter =
        entriesUpdate
          .enter()
          .append("g")
            .classed(Legend.LEGEND_ENTRY_CLASS, true)
          .merge(entriesUpdate);

      entriesEnter.append("path")
        .attr("d", (symbolEntryPair, columnIndex) => {
          const symbol = symbolEntryPair[0];
          return self.symbol()(symbol.data.name, rowIndex)(symbol.height * 0.6);
        })
        .attr("transform", (symbolEntryPair, i) => {
          const symbol = symbolEntryPair[0];
          const columnIndex = table.rows[rowIndex].columns.indexOf(symbol);
          const columnBounds = table.getColumnBounds(rowIndex, columnIndex);
          return `translate(${columnBounds.topLeft.x + symbol.width / 2}, ${symbol.height / 2})`;
        })
        .attr("fill", (symbolEntryPair) => self._colorScale.scale(symbolEntryPair[0].data.name))
        .attr("opacity", (symbolEntryPair, _columnIndex) => {
          return self.symbolOpacity()(symbolEntryPair[0].data.name, rowIndex);
        })
        .classed(Legend.LEGEND_SYMBOL_CLASS, true);

      entriesEnter.append("g").classed("text-container", true)
        .attr("transform", (symbolEntryPair, i) => {
          const entry = symbolEntryPair[1];
          const columnIndex = table.rows[rowIndex].columns.indexOf(entry);
          const columnBounds = table.getColumnBounds(rowIndex, columnIndex);
          return "translate(" + columnBounds.topLeft.x + ", 0)"
        })
        .each(function (symbolEntryPair, i, rowIndex) {
          const textContainer = d3.select(this);
          const column = symbolEntryPair[1];

          const writeOptions = {
            selection: textContainer,
            xAlign: "left",
            yAlign: "top",
            textRotation: 0,
          } as Typesetter.IWriteOptions;

          self._writer.write(self._formatter(column.data.name), column.width, self.height(), writeOptions)
        });

        entriesUpdate.exit().remove();
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
