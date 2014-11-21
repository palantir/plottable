///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class HorizontalLegend extends AbstractComponent {
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

    /**
     * Creates a Horizontal Legend.
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

      this._scale = colorScale;
      this._scale.broadcaster.registerListener(this, () => this._invalidateLayout());

      this.xAlign("left").yAlign("center");
      this._fixedWidthFlag = true;
      this._fixedHeightFlag = true;
    }

    public remove() {
      super.remove();
      this._scale.broadcaster.deregisterListener(this);
    }

    private calculateLayoutInfo(availableWidth: number, availableHeight: number) {
      var fakeLegendRow = this._content.append("g").classed(HorizontalLegend.LEGEND_ROW_CLASS, true);
      var fakeLegendEntry = fakeLegendRow.append("g").classed(HorizontalLegend.LEGEND_ENTRY_CLASS, true);
      var measure = _Util.Text.getTextMeasurer(fakeLegendRow.append("text"));

      var textHeight = measure(_Util.Text.HEIGHT_TEXT).height;

      var availableWidthForEntries = Math.max(0, (availableWidth - this._padding));
      var measureEntry = (entryText: string) => {
        var originalEntryLength = (textHeight + measure(entryText).width + this._padding);
        return Math.min(originalEntryLength, availableWidthForEntries);
      };

      var entries = this._scale.domain();
      var entryLengths = _Util.Methods.populateMap(entries, measureEntry);
      fakeLegendRow.remove();

      var rows = this.packRows(availableWidthForEntries, entries, entryLengths);

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
      var estimatedLayout = this.calculateLayoutInfo(offeredWidth, offeredHeight);

      var rowLengths = estimatedLayout.rows.map((row: string[]) => {
        return d3.sum(row, (entry: string) => estimatedLayout.entryLengths.get(entry));
      });
      var longestRowLength = _Util.Methods.max(rowLengths, 0);
      longestRowLength = longestRowLength === undefined ? 0 : longestRowLength; // HACKHACK: #843
      var desiredWidth = this._padding + longestRowLength;

      var acceptableHeight = estimatedLayout.numRowsToDraw * estimatedLayout.textHeight + 2 * this._padding;
      var desiredHeight = estimatedLayout.rows.length * estimatedLayout.textHeight + 2 * this._padding;

      return {
        width : desiredWidth,
        height: acceptableHeight,
        wantsWidth: offeredWidth < desiredWidth,
        wantsHeight: offeredHeight < desiredHeight
      };
    }

    private packRows(availableWidth: number, entries: string[], entryLengths: D3.Map<number>) {
      var rows: string[][] = [[]];
      var currentRow = rows[0];
      var spaceLeft = availableWidth;
      entries.forEach((e: string) => {
        var entryLength = entryLengths.get(e);
        if (entryLength > spaceLeft) {
          currentRow = [];
          rows.push(currentRow);
          spaceLeft = availableWidth;
        }
        currentRow.push(e);
        spaceLeft -= entryLength;
      });
      return rows;
    }

    public _doRender() {
      super._doRender();

      var layout = this.calculateLayoutInfo(this.width(), this.height());

      var rowsToDraw = layout.rows.slice(0, layout.numRowsToDraw);
      var rows = this._content.selectAll("g." + HorizontalLegend.LEGEND_ROW_CLASS).data(rowsToDraw);
      rows.enter().append("g").classed(HorizontalLegend.LEGEND_ROW_CLASS, true);
      rows.exit().remove();

      rows.attr("transform", (d: any, i: number) => "translate(0, " + (i * layout.textHeight + this._padding) + ")");

      var entries = rows.selectAll("g." + HorizontalLegend.LEGEND_ENTRY_CLASS).data((d) => d);
      var entriesEnter = entries.enter().append("g").classed(HorizontalLegend.LEGEND_ENTRY_CLASS, true);
      entries.each(function(d: string) {
        d3.select(this).classed(d.replace(" ", "-"), true);
      });
      entriesEnter.append("circle");
      entriesEnter.append("g").classed("text-container", true);
      entries.exit().remove();

      var legendPadding = this._padding;
      rows.each(function (values: string[]) {
        var xShift = legendPadding;
        var entriesInRow = d3.select(this).selectAll("g." + HorizontalLegend.LEGEND_ENTRY_CLASS);
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
      // HACKHACK (translate vertical shift): #864
      textContainers.attr("transform", "translate(" + layout.textHeight + ", " + (layout.textHeight * 0.1) + ")")
             .each(function(value: string) {
               var container = d3.select(this);
               var measure = _Util.Text.getTextMeasurer(container.append("text"));
               var maxTextLength = layout.entryLengths.get(value) - layout.textHeight - padding;
               var textToWrite = _Util.Text.getTruncatedText(value, maxTextLength, measure);
               var textSize = measure(textToWrite);
               _Util.Text.writeLineHorizontally(textToWrite, container, textSize.width, textSize.height);
             });
    }
  }
}
}
