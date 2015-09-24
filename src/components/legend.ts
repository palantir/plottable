///<reference path="../reference.ts" />

module Plottable {
export module Components {
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
    private _colorScale: Scales.Color;
    private _formatter: Formatter;
    private _maxEntriesPerRow: number;
    private _comparator: (a: string, b: string) => number;
    private _measurer: SVGTypewriter.Measurers.Measurer;
    private _wrapper: SVGTypewriter.Wrappers.Wrapper;
    private _writer: SVGTypewriter.Writers.Writer;
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
      this.xAlignment("right").yAlignment("top");
      this.comparator((a: string, b: string) => this._colorScale.domain().indexOf(a) - this._colorScale.domain().indexOf(b));
      this._symbolFactoryAccessor = () => SymbolFactories.circle();
      this._symbolOpacityAccessor = () => 1;
    }

    protected _setup() {
      super._setup();
      let fakeLegendRow = this.content().append("g").classed(Legend.LEGEND_ROW_CLASS, true);
      let fakeLegendEntry = fakeLegendRow.append("g").classed(Legend.LEGEND_ENTRY_CLASS, true);
      fakeLegendEntry.append("text");
      this._measurer = new SVGTypewriter.Measurers.Measurer(fakeLegendRow);
      this._wrapper = new SVGTypewriter.Wrappers.Wrapper().maxLines(1);
      this._writer = new SVGTypewriter.Writers.Writer(this._measurer, this._wrapper).addTitleElement(Configs.ADD_TITLE_ELEMENTS);
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
    public formatter(formatter: Formatter): Legend;
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
     * Sets the maximum number of entries perrow.
     *
     * @param {number} maxEntriesPerRow
     * @returns {Legend} The calling Legend.
     */
    public maxEntriesPerRow(maxEntriesPerRow: number): Legend;
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
    public comparator(comparator: (a: string, b: string) => number): Legend;
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
    public colorScale(colorScale: Scales.Color): Legend;
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

    private _calculateLayoutInfo(availableWidth: number, availableHeight: number) {
      let textHeight = this._measurer.measure().height;

      let availableWidthForEntries = Math.max(0, (availableWidth - this._padding));

      let entryLabels: d3.Map<string> = d3.map<string>();
      this._colorScale.domain().slice().forEach((d) => {
        entryLabels.set(this._formatter(d), d);
      });
      let entryNames = entryLabels.keys();
      entryNames = entryNames.sort(this.comparator()).map((d) => entryLabels.get(d));

      let entryLengths: d3.Map<number> = d3.map<number>();
      let untruncatedEntryLengths: d3.Map<number> = d3.map<number>();
      entryNames.forEach((entryName) => {
        let untruncatedEntryLength = textHeight + this._measurer.measure(this._formatter(entryName)).width + this._padding;
        let entryLength = Math.min(untruncatedEntryLength, availableWidthForEntries);
        entryLengths.set(entryName, entryLength);
        untruncatedEntryLengths.set(entryName, untruncatedEntryLength);
      });

      let rows = this._packRows(availableWidthForEntries, entryNames, entryLengths);

      let rowsAvailable = Math.floor((availableHeight - 2 * this._padding) / textHeight);
      if (rowsAvailable !== rowsAvailable) { // rowsAvailable can be NaN if this.textHeight = 0
        rowsAvailable = 0;
      }

      return {
        textHeight: textHeight,
        entryLengths: entryLengths,
        untruncatedEntryLengths: untruncatedEntryLengths,
        rows: rows,
        numRowsToDraw: Math.max(Math.min(rowsAvailable, rows.length), 0)
      };
    }

    public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
      let estimatedLayout = this._calculateLayoutInfo(offeredWidth, offeredHeight);

      let untruncatedRowLengths = estimatedLayout.rows.map((row) => {
        return d3.sum(row, (entry) => estimatedLayout.untruncatedEntryLengths.get(entry));
      });
      let longestUntruncatedRowLength = Utils.Math.max(untruncatedRowLengths, 0);

      return {
        minWidth: this._padding + longestUntruncatedRowLength,
        minHeight: estimatedLayout.rows.length * estimatedLayout.textHeight + 2 * this._padding
      };
    }

    private _packRows(availableWidth: number, entries: string[], entryLengths: d3.Map<number>) {
      let rows: string[][] = [];
      let currentRow: string[] = [];
      let spaceLeft = availableWidth;
      entries.forEach((e: string) => {
        let entryLength = entryLengths.get(e);
        if (entryLength > spaceLeft || currentRow.length === this._maxEntriesPerRow) {
          rows.push(currentRow);
          currentRow = [];
          spaceLeft = availableWidth;
        }
        currentRow.push(e);
        spaceLeft -= entryLength;
      });

      if (currentRow.length !== 0) {
        rows.push(currentRow);
      }
      return rows;
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

      let entities: Entity<Legend>[] = [];
      let layout = this._calculateLayoutInfo(this.width(), this.height());
      let legendPadding = this._padding;
      let legend = this;
      this.content().selectAll("g." + Legend.LEGEND_ROW_CLASS).each(function(d: any, i: number) {
        let lowY = i * layout.textHeight + legendPadding;
        let highY = (i + 1) * layout.textHeight + legendPadding;
        let symbolY = (lowY + highY) / 2;
        let lowX = legendPadding;
        let highX = legendPadding;
        d3.select(this).selectAll("g." + Legend.LEGEND_ENTRY_CLASS).each(function(value: string) {
          highX += layout.entryLengths.get(value);
          let symbolX = lowX + layout.textHeight / 2;
          if (highX >= p.x && lowX <= p.x &&
              highY >= p.y && lowY <= p.y) {
            let entrySelection = d3.select(this);
            let datum = entrySelection.datum();
            entities.push({
              datum: datum,
              position: { x: symbolX, y: symbolY },
              selection: entrySelection,
              component: legend
            });
          }
          lowX += layout.entryLengths.get(value);
        });
      });

      return entities;
    }

    public renderImmediately() {
      super.renderImmediately();

      let layout = this._calculateLayoutInfo(this.width(), this.height());

      let rowsToDraw = layout.rows.slice(0, layout.numRowsToDraw);
      let rows = this.content().selectAll("g." + Legend.LEGEND_ROW_CLASS).data(rowsToDraw);
      rows.enter().append("g").classed(Legend.LEGEND_ROW_CLASS, true);
      rows.exit().remove();

      rows.attr("transform", (d: any, i: number) => "translate(0, " + (i * layout.textHeight + this._padding) + ")");

      let entries = rows.selectAll("g." + Legend.LEGEND_ENTRY_CLASS).data((d) => d);
      let entriesEnter = entries.enter().append("g").classed(Legend.LEGEND_ENTRY_CLASS, true);
      entriesEnter.append("path");
      entriesEnter.append("g").classed("text-container", true);
      entries.exit().remove();

      let legendPadding = this._padding;
      rows.each(function (values: string[]) {
        let xShift = legendPadding;
        let entriesInRow = d3.select(this).selectAll("g." + Legend.LEGEND_ENTRY_CLASS);
        entriesInRow.attr("transform", (value: string, i: number) => {
          let translateString = "translate(" + xShift + ", 0)";
          xShift += layout.entryLengths.get(value);
          return translateString;
        });
      });

      entries.select("path").attr("d", (d: any, i: number, j: number) => this.symbol()(d, j)(layout.textHeight * 0.6))
                            .attr("transform", "translate(" + (layout.textHeight / 2) + "," + layout.textHeight / 2 + ")")
                            .attr("fill", (value: string) => this._colorScale.scale(value))
                            .attr("opacity", (d: any, i: number, j: number) => this.symbolOpacity()(d, j))
                            .classed(Legend.LEGEND_SYMBOL_CLASS, true);

      let padding = this._padding;
      let textContainers = entries.select("g.text-container");
      textContainers.text(""); // clear out previous results
      let self = this;
      textContainers.attr("transform", "translate(" + layout.textHeight + ", 0)")
                    .each(function(value: string) {
                      let container = d3.select(this);
                      let maxTextLength = layout.entryLengths.get(value) - layout.textHeight - padding;
                      let writeOptions = {
                        selection: container,
                        xAlign: "left",
                        yAlign: "top",
                        textRotation: 0
                      };
                      self._writer.write(self._formatter(value), maxTextLength, self.height(), writeOptions);
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
    public symbol(symbol: (datum: any, index: number) => SymbolFactory): Legend;
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
    public symbolOpacity(symbolOpacity: number | ((datum: any, index: number) => number)): Legend;
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
}
