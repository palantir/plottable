///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class HorizontalLegend extends Abstract.Component {
    /**
     * The css class applied to each legend row
     */
    public static LEGEND_ROW_CLASS = "legend-row";
    /**
     * The css class applied to each legend entry
     */
    public static LEGEND_ENTRY_CLASS = "legend-entry";

    private padding = 5;
    private scale: Scale.Color;

    /**
     * Creates a Horizontal Legend.
     *
     * THe legend consists of a series of legend entries, each with a color and label taken from the `colorScale`.
     * The entries will be displayed in the order of the `colorScale` domain.
     *
     * @constructor
     * @param {Scale.Color} colorScale
     */
    constructor(colorScale: Scale.Color) {
      super();
      this.classed("legend", true);

      this.scale = colorScale;
      this.scale.broadcaster.registerListener(this, () => this._invalidateLayout());

      this.xAlign("left").yAlign("center");
      this._fixedWidthFlag = true;
      this._fixedHeightFlag = true;
    }

    public remove() {
      super.remove();
      this.scale.broadcaster.deregisterListener(this);
    }

    private calculateRenderInfo(availableWidth: number, availableHeight: number) {
      var fakeLegendRow = this.content.append("g").classed(HorizontalLegend.LEGEND_ROW_CLASS, true);
      var fakeLegendEntry = fakeLegendRow.append("g").classed(HorizontalLegend.LEGEND_ENTRY_CLASS, true);
      var measure = Util.Text.getTextMeasurer(fakeLegendRow.append("text"));

      var textHeight = measure(Util.Text.HEIGHT_TEXT).height;

      var availableWidthForEntries = Math.max(0, (availableWidth - this.padding));
      var measureEntry = (entryText: string) => {
        var originalEntryLength = (textHeight + measure(entryText).width + this.padding);
        return Math.min(originalEntryLength, availableWidthForEntries);
      };

      var entries = this.scale.domain();
      var entryLengths = Util.Methods.populateDictionary(entries, measureEntry);
      fakeLegendRow.remove();

      var rows = this.packRows(availableWidthForEntries, entries, entryLengths);

      var rowsAvailable = Math.floor((availableHeight - 2 * this.padding) / textHeight);
      if (rowsAvailable !== rowsAvailable) { // rowsAvailable can be NaN if this.textHeight = 0
        rowsAvailable = 0;
      }

      return {
        textHeight: textHeight,
        entryLengths: entryLengths,
        rows: rows,
        numRowsToDraw: Math.min(rowsAvailable, rows.length)
      };
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      var estimatedSizings = this.calculateRenderInfo(offeredWidth, offeredHeight);

      var rowLengths = estimatedSizings.rows.map((row: string[]) => {
        return d3.sum(row, (entry: string) => estimatedSizings.entryLengths[entry]);
      });
      var longestRowLength = d3.max(rowLengths);
      longestRowLength = longestRowLength === undefined ? 0 : longestRowLength; // HACKHACK: #843
      var desiredWidth = this.padding + longestRowLength;

      var acceptableHeight = estimatedSizings.numRowsToDraw * estimatedSizings.textHeight + 2 * this.padding;
      var desiredHeight = estimatedSizings.rows.length * estimatedSizings.textHeight + 2 * this.padding;

      return {
        width : desiredWidth,
        height: acceptableHeight,
        wantsWidth: offeredWidth < desiredWidth,
        wantsHeight: offeredHeight < desiredHeight
      };
    }

    private packRows(availableWidth: number, entries: string[], entryLengths: {[entryName: string]: number}) {
      var rows: string[][] = [[]];
      var currentRow = rows[0];
      var spaceLeft = availableWidth;
      entries.forEach((e: string) => {
        var entryLength = entryLengths[e];
        if (entryLength > spaceLeft) {
          // allocate new row
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

      var sizings = this.calculateRenderInfo(this.availableWidth, this.availableHeight);

      var rowsToDraw = sizings.rows.slice(0, sizings.numRowsToDraw);
      var rows = this.content.selectAll("g." + HorizontalLegend.LEGEND_ROW_CLASS).data(rowsToDraw);
      rows.enter().append("g").classed(HorizontalLegend.LEGEND_ROW_CLASS, true);
      rows.exit().remove();

      rows.attr("transform", (d: any, i: number) => "translate(0, " + (i * sizings.textHeight + this.padding) + ")");

      var entries = rows.selectAll("g." + HorizontalLegend.LEGEND_ENTRY_CLASS).data((d) => d);
      var entriesEnter = entries.enter().append("g").classed(HorizontalLegend.LEGEND_ENTRY_CLASS, true);
      entriesEnter.append("circle");
      entriesEnter.append("g").classed("text-container", true);
      entries.exit().remove();

      var legendPadding = this.padding;
      rows.each(function (values: string[]) {
        var xShift = legendPadding;
        d3.select(this).selectAll("g." + HorizontalLegend.LEGEND_ENTRY_CLASS)
            .attr("transform", (value: string, i: number) => {
              var translateString = "translate(" + xShift + ", 0)";
              xShift += sizings.entryLengths[value];
              return translateString;
            });
      });

      entries.select("circle")
          .attr("cx", sizings.textHeight / 2)
          .attr("cy", sizings.textHeight / 2)
          .attr("r",  sizings.textHeight * 0.3)
          .attr("fill", (value: string) => this.scale.scale(value) );

      var padding = this.padding;
      var textContainers = entries.select("g.text-container");
      textContainers.text(""); // clear out previous results
      textContainers.append("title").text((value: string) => value);
      // HACKHACK (translate vertical shift): #864
      textContainers.attr("transform", "translate(" + sizings.textHeight + ", " + (sizings.textHeight * 0.1) + ")")
             .each(function(value: string) {
               var container = d3.select(this);
               var measure = Util.Text.getTextMeasurer(container.append("text"));
               var maxTextLength = sizings.entryLengths[value] - sizings.textHeight - padding;
               var textToWrite = Util.Text.getTruncatedText(value, maxTextLength, measure);
               var textSize = measure(textToWrite);
               Util.Text.writeLineHorizontally(textToWrite, container, textSize.width, textSize.height);
             });
    }
  }
}
}
