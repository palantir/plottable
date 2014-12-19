///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class Legend extends AbstractComponent {
    /**
     * The css class applied to each legend row
     */
    public static LEGEND_ROW_CLASS = "legend-row";
    /**
     * The css class applied to each legend entry
     */
    public static LEGEND_ENTRY_CLASS = "legend-entry";

    private _padding = 5;
    private _scale: Scale.Color;
    private _maxEntriesPerRow: number;
    private _sortFn: (a: string, b: string) => number;
    private _measurer: SVGTypewriter.Measurers.Measurer;
    private _wrapper: SVGTypewriter.Wrappers.Wrapper;
    private _writer: SVGTypewriter.Writers.Writer;

    /**
     * Creates a Legend.
     *
     * The legend consists of a series of legend entries, each with a color and label taken from the `colorScale`.
     * The entries will be displayed in the order of the `colorScale` domain.
     *
     * @constructor
     * @param {Scale.Color} colorScale
     */
    constructor(colorScale: Scale.Color) {
      super();
      this.classed("legend", true);
      this.maxEntriesPerRow(1);

      if (colorScale == null ) {
        throw new Error("Legend requires a colorScale");
      }

      this._scale = colorScale;
      this._scale.broadcaster.registerListener(this, () => this._invalidateLayout());

      this.xAlign("right").yAlign("top");
      this._fixedWidthFlag = true;
      this._fixedHeightFlag = true;
      this._sortFn = (a: string, b: string) => this._scale.domain().indexOf(a) - this._scale.domain().indexOf(b);
    }

    protected _setup() {
      super._setup();
      var fakeLegendRow = this._content.append("g").classed(Legend.LEGEND_ROW_CLASS, true);
      var fakeLegendEntry = fakeLegendRow.append("g").classed(Legend.LEGEND_ENTRY_CLASS, true);
      fakeLegendEntry.append("text");
      this._measurer = new SVGTypewriter.Measurers.Measurer(fakeLegendRow);
      this._wrapper = new SVGTypewriter.Wrappers.Wrapper().maxLines(1);
      this._writer = new SVGTypewriter.Writers.Writer(this._measurer, this._wrapper).addTitleElement(true);
    }

    /**
     * Gets the current max number of entries in Legend row.
     * @returns {number} The current max number of entries in row.
     */
    public maxEntriesPerRow(): number;
    /**
     * Sets a new max number of entries in Legend row.
     *
     * @param {number} numEntries If provided, the new max number of entries in row.
     * @returns {Legend} The calling Legend.
     */
    public maxEntriesPerRow(numEntries: number): Legend;
    public maxEntriesPerRow(numEntries?: number): any {
      if (numEntries == null) {
        return this._maxEntriesPerRow;
      } else {
        this._maxEntriesPerRow = numEntries;
        this._invalidateLayout();
        return this;
      }
    }

    /**
     * Gets the current sort function for Legend's entries.
     * @returns {(a: string, b: string) => number} The current sort function.
     */
    public sortFunction(): (a: string, b: string) => number;
    /**
     * Sets a new sort function for Legend's entires.
     *
     * @param {(a: string, b: string) => number} newFn If provided, the new compare function.
     * @returns {Legend} The calling Legend.
     */
    public sortFunction(newFn: (a: string, b: string) => number): Legend;
    public sortFunction(newFn?: (a: string, b: string) => number): any {
      if (newFn == null) {
        return this._sortFn;
      } else {
        this._sortFn = newFn;
        this._invalidateLayout();
        return this;
      }
    }

    /**
     * Gets the current color scale from the Legend.
     *
     * @returns {ColorScale} The current color scale.
     */
    public scale(): Scale.Color;
    /**
     * Assigns a new color scale to the Legend.
     *
     * @param {Scale.Color} scale If provided, the new scale.
     * @returns {Legend} The calling Legend.
     */
    public scale(scale: Scale.Color): Legend;
    public scale(scale?: Scale.Color): any {
      if (scale != null) {
        this._scale.broadcaster.deregisterListener(this);
        this._scale = scale;
        this._scale.broadcaster.registerListener(this, () => this._invalidateLayout());
        this._invalidateLayout();
        return this;
      } else {
        return this._scale;
      }
    }

    public remove() {
      super.remove();
      this._scale.broadcaster.deregisterListener(this);
    }

    private _calculateLayoutInfo(availableWidth: number, availableHeight: number) {
      var textHeight = this._measurer.measure().height;

      var availableWidthForEntries = Math.max(0, (availableWidth - this._padding));
      var measureEntry = (entryText: string) => {
        var originalEntryLength = (textHeight + this._measurer.measure(entryText).width + this._padding);
        return Math.min(originalEntryLength, availableWidthForEntries);
      };

      var entries = this._scale.domain().slice();
      entries.sort(this.sortFunction());
      var entryLengths = _Util.Methods.populateMap(entries, measureEntry);

      var rows = this._packRows(availableWidthForEntries, entries, entryLengths);

      var rowsAvailable = Math.floor((availableHeight - 2 * this._padding) / textHeight);
      if (rowsAvailable !== rowsAvailable) { // rowsAvailable can be NaN if this.textHeight = 0
        rowsAvailable = 0;
      }

      return {
        textHeight: textHeight,
        entryLengths: entryLengths,
        rows: rows,
        numRowsToDraw: Math.max(Math.min(rowsAvailable, rows.length), 0)
      };
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest {
      var estimatedLayout = this._calculateLayoutInfo(offeredWidth, offeredHeight);
      var rowLengths = estimatedLayout.rows.map((row: string[]) => {
        return d3.sum(row, (entry: string) => estimatedLayout.entryLengths.get(entry));
      });

      var longestRowLength = _Util.Methods.max(rowLengths, 0);

      var longestUntruncatedEntryLength = _Util.Methods.max<string, number>(this._scale.domain(), (d: string) =>
                                            this._measurer.measure(d).width, 0);
      longestUntruncatedEntryLength += estimatedLayout.textHeight + this._padding;
      var desiredWidth = this._padding + Math.max(longestRowLength, longestUntruncatedEntryLength);

      var acceptableHeight = estimatedLayout.numRowsToDraw * estimatedLayout.textHeight + 2 * this._padding;
      var desiredHeight = estimatedLayout.rows.length * estimatedLayout.textHeight + 2 * this._padding;
      var desiredNumRows = Math.max(Math.ceil(this._scale.domain().length / this._maxEntriesPerRow), 1);
      var wantsFitMoreEntriesInRow = estimatedLayout.rows.length > desiredNumRows;
      return {
        width : this._padding + longestRowLength,
        height: acceptableHeight,
        wantsWidth: offeredWidth < desiredWidth || wantsFitMoreEntriesInRow,
        wantsHeight: offeredHeight < desiredHeight
      };
    }

    private _packRows(availableWidth: number, entries: string[], entryLengths: D3.Map<number>) {
      var rows: string[][] = [];
      var currentRow: string[] = [];
      var spaceLeft = availableWidth;
      entries.forEach((e: string) => {
        var entryLength = entryLengths.get(e);
        if (entryLength > spaceLeft || currentRow.length === this._maxEntriesPerRow) {
          rows.push(currentRow);
          currentRow = [];
          spaceLeft = availableWidth;
        }
        currentRow.push(e);
        spaceLeft -= entryLength;
      });

      if(currentRow.length !== 0) {
        rows.push(currentRow);
      }
      return rows;
    }

    /**
     * Gets the legend entry under the given pixel position.
     *
     * @param {Point} position The pixel position.
     * @returns {D3.Selection} The selected entry, or null selection if no entry was selected.
     */
    public getEntry(position: Point): D3.Selection {
      if (!this._isSetup) {
        return d3.select();
      }

      var entry = d3.select();
      var layout = this._calculateLayoutInfo(this.width(), this.height());
      var legendPadding = this._padding;
      this._content.selectAll("g." + Legend.LEGEND_ROW_CLASS).each(function(d: any, i: number) {
        var lowY = i * layout.textHeight + legendPadding;
        var highY = (i + 1) * layout.textHeight + legendPadding;
        var lowX = legendPadding;
        var highX = legendPadding;
        d3.select(this).selectAll("g." + Legend.LEGEND_ENTRY_CLASS).each(function(value: string) {
          highX += layout.entryLengths.get(value);
          if (highX >= position.x && lowX <= position.x &&
              highY >= position.y && lowY <= position.y) {
            entry = d3.select(this);
          }
          lowX += layout.entryLengths.get(value);
        });
      });

      return entry;
    }

    public _doRender() {
      super._doRender();

      var layout = this._calculateLayoutInfo(this.width(), this.height());

      var rowsToDraw = layout.rows.slice(0, layout.numRowsToDraw);
      var rows = this._content.selectAll("g." + Legend.LEGEND_ROW_CLASS).data(rowsToDraw);
      rows.enter().append("g").classed(Legend.LEGEND_ROW_CLASS, true);
      rows.exit().remove();

      rows.attr("transform", (d: any, i: number) => "translate(0, " + (i * layout.textHeight + this._padding) + ")");

      var entries = rows.selectAll("g." + Legend.LEGEND_ENTRY_CLASS).data((d) => d);
      var entriesEnter = entries.enter().append("g").classed(Legend.LEGEND_ENTRY_CLASS, true);
      entries.each(function(d: string) {
        d3.select(this).classed(d.replace(" ", "-"), true);
      });
      entriesEnter.append("circle");
      entriesEnter.append("g").classed("text-container", true);
      entries.exit().remove();

      var legendPadding = this._padding;
      rows.each(function (values: string[]) {
        var xShift = legendPadding;
        var entriesInRow = d3.select(this).selectAll("g." + Legend.LEGEND_ENTRY_CLASS);
        entriesInRow.attr("transform", (value: string, i: number) => {
          var translateString = "translate(" + xShift + ", 0)";
          xShift += layout.entryLengths.get(value);
          return translateString;
        });
      });

      entries.select("circle")
          .attr("cx", layout.textHeight / 2)
          .attr("cy", layout.textHeight / 2)
          .attr("r",  layout.textHeight * 0.3)
          .attr("fill", (value: string) => this._scale.scale(value) );

      var padding = this._padding;
      var textContainers = entries.select("g.text-container");
      textContainers.text(""); // clear out previous results
      textContainers.append("title").text((value: string) => value);
      var self = this;
      textContainers.attr("transform", "translate(" + layout.textHeight + ", 0)")
                    .each(function(value: string) {
                      var container = d3.select(this);
                      var maxTextLength = layout.entryLengths.get(value) - layout.textHeight - padding;
                      var writeOptions = {
                        selection: container,
                        xAlign: "left",
                        yAlign: "top",
                        textRotation: 0
                      };

                      self._writer.write(value, maxTextLength, self.height(), writeOptions);
                    });
    }
  }
}
}
