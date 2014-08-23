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
    private textHeight = 0;
    private entryLengths: {[entry: string]: number} = {};
    private rows: string[][]; // list of lists of entries in each row
    private previousOfferedWidth: number;
    private numRowsToDraw = 0;

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

    public _invalidateLayout() {
      // force recomputation of entry size, must be done first so _requestedSpace works correctly
      this.previousOfferedWidth = null;
      super._invalidateLayout();
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      if (offeredWidth !== this.previousOfferedWidth) {
        var fakeLegendRow = this.content.append("g").classed(HorizontalLegend.LEGEND_ROW_CLASS, true);
        var fakeLegendEntry = fakeLegendRow.append("g").classed(HorizontalLegend.LEGEND_ENTRY_CLASS, true);
        var measure = Util.Text.getTextMeasurer(fakeLegendRow.append("text"));

        this.textHeight = measure(Util.Text.HEIGHT_TEXT).height;

        var availableWidthForEntries = Math.max(0, (offeredWidth - this.padding));
        var measureEntry = (entryText: string) => {
          var originalEntryLength = (this.textHeight + measure(entryText).width + this.padding);
          return Math.min(originalEntryLength, availableWidthForEntries);
        }

        this.entryLengths = Util.Methods.populateDictionary(this.scale.domain(), measureEntry);

        this.rows = this.packRows(availableWidthForEntries);
        this.previousOfferedWidth = offeredWidth;

        fakeLegendRow.remove();
      }

      var rowLengths = this.rows.map((row: string[]) => {
        return d3.sum(row, (entry: string) => this.entryLengths[entry]);
      });

      var longestRowLength = d3.max(rowLengths);
      longestRowLength = longestRowLength === undefined ? 0 : longestRowLength; // HACKHACK: #843
      var desiredWidth = this.padding + longestRowLength;

      var rowsAvailable = Math.floor((offeredHeight - 2 * this.padding) / this.textHeight);
      if (rowsAvailable !== rowsAvailable) { // rowsAvailable can be NaN if this.textHeight = 0
        rowsAvailable = 0;
      }
      this.numRowsToDraw = Math.min(rowsAvailable, this.rows.length);

      var acceptableHeight = this.numRowsToDraw * this.textHeight + 2 * this.padding;
      var desiredHeight = this.rows.length * this.textHeight + 2 * this.padding;

      return {
        width : desiredWidth,
        height: acceptableHeight,
        wantsWidth: offeredWidth < desiredWidth,
        wantsHeight: offeredHeight < desiredHeight
      };
    }

    private packRows(availableWidth: number) {
      var rows: string[][] = [[]];
      var currentRow = rows[0];
      var spaceLeft = availableWidth;
      this.scale.domain().forEach((e: string) => {
        var entryLength = this.entryLengths[e];
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
      var rowsToDraw = this.rows.slice(0, this.numRowsToDraw);
      var rows = this.content.selectAll("g." + HorizontalLegend.LEGEND_ROW_CLASS).data(rowsToDraw);
      rows.enter().append("g").classed(HorizontalLegend.LEGEND_ROW_CLASS, true);
      rows.exit().remove();

      rows.attr("transform", (d: any, i: number) => "translate(0, " + (i * this.textHeight + this.padding) + ")");

      var entries = rows.selectAll("g." + HorizontalLegend.LEGEND_ENTRY_CLASS).data((d) => d);
      var entriesEnter = entries.enter().append("g").classed(HorizontalLegend.LEGEND_ENTRY_CLASS, true);
      entriesEnter.append("circle");
      entriesEnter.append("g").classed("text-container", true);
      entries.exit().remove();

      var legendPadding = this.padding;
      var entryLengths = this.entryLengths;
      rows.each(function (values: string[]) {
        var xShift = legendPadding;
        d3.select(this).selectAll("g." + HorizontalLegend.LEGEND_ENTRY_CLASS)
            .attr("transform", (value: string, i: number) => {
              var translateString = "translate(" + xShift + ", 0)";
              xShift += entryLengths[value];
              return translateString;
            });
      });

      entries.select("circle")
          .attr("cx", this.textHeight / 2)
          .attr("cy", this.textHeight / 2)
          .attr("r",  this.textHeight * 0.3)
          .attr("fill", (value: string) => this.scale.scale(value) );

      var padding = this.padding;
      var textHeight = this.textHeight;
      var textContainers = entries.select("g.text-container");
      textContainers.text(""); // clear out previous results
      textContainers.append("title").text((value: string) => value);
      textContainers.attr("transform", "translate(" + this.textHeight + ", " + (this.textHeight * 0.1) + ")") // HACKHACK (vertical shift): #864
             .each(function(value: string) {
               var container = d3.select(this);
               var measure = Util.Text.getTextMeasurer(container.append("text"));
               var maxTextLength = entryLengths[value] - textHeight - padding;
               var textToWrite = Util.Text.getTruncatedText(value, maxTextLength, measure);
               var textSize = measure(textToWrite);
               Util.Text.writeLineHorizontally(textToWrite, container, textSize.width, textSize.height);
             });
    }
  }
}
}
