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
    private numRowsToBeDrawn = 0;

    /**
     * Creates a Horizontal Legend.
     *
     * THe legend consists of a series of legend entries, each with a color and label taken from the `colorScale`.
     * The entries will be displayed in the order of the `colorScale` domain.
     *
     * @constructor
     * @param {Scale.Color} colorScale
     */
    constructor(colorScale?: Scale.Color) {
      super();
      this.classed("legend", true);

      this.scale = colorScale;
      this.scale.broadcaster.registerListener(this, () => this.updateDomain());

      this.xAlign("LEFT").yAlign("CENTER");
      this._fixedWidthFlag = true;
      this._fixedHeightFlag = true;
    }

    public remove() {
      super.remove();
      if (this.scale != null) {
        this.scale.broadcaster.deregisterListener(this);
      }
    }

    private updateDomain() {
      this._invalidateLayout();
    }

    public _invalidateLayout() {
      // force recomputation of entry size, must be done first so _requestedSpace works correctly
      this.previousOfferedWidth = null;
      super._invalidateLayout();
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      if (offeredWidth !== this.previousOfferedWidth) {
        var availableWidth = Math.max(0, (offeredWidth - this.padding));
        this.sizeEntries(availableWidth);
        this.previousOfferedWidth = offeredWidth;
      }

      var rowLengths = this.rows.map((row: string[]) => {
        var rowLength = 0;
        row.forEach((entry: string) => {
          rowLength += this.entryLengths[entry];
        });
        return rowLength;
      });
      var longestRowLength = d3.max(rowLengths);
      longestRowLength = longestRowLength === undefined ? 0 : longestRowLength; // HACKHACK: #843
      var desiredWidth = this.padding + longestRowLength;

      var rowsAvailable = Math.floor((offeredHeight - 2 * this.padding) / this.textHeight);
      this.numRowsToBeDrawn = Math.min(rowsAvailable, this.rows.length);

      var acceptableHeight = this.numRowsToBeDrawn * this.textHeight + 2 * this.padding;
      var desiredHeight = this.rows.length * this.textHeight + 2 * this.padding;

      return {
        width : desiredWidth,
        height: acceptableHeight,
        wantsWidth: offeredWidth < desiredWidth,
        wantsHeight: offeredHeight < desiredHeight
      };
    }

    private sizeEntries(availableWidth: number) {
      var fakeLegendEl = this.content.append("g").classed(HorizontalLegend.LEGEND_ENTRY_CLASS, true);
      var measure = Util.Text.getTextMeasurer(fakeLegendEl.append("text"));
      this.textHeight = measure(Util.Text.HEIGHT_TEXT).height; // could be 0
      if (this.textHeight === 0) {
        this.textHeight = 1; // HACKHACK
      }

      var entries = this.scale.domain();
      this.entryLengths = {};

      entries.forEach((e: string) => {
        var textLength = measure(e).width;
        this.entryLengths[e] = Math.min( (this.textHeight + textLength + this.padding), availableWidth );
      });

      fakeLegendEl.remove();
      this.packRows(availableWidth);
    }

    private packRows(availableWidth: number) {
      this.rows = [[]];
      var r = 0;
      var spaceLeft = availableWidth;
      this.scale.domain().forEach((e: string) => {
        var entryLength = this.entryLengths[e];
        if (entryLength > spaceLeft) {
          // allocate new row
          this.rows[++r] = [];
          spaceLeft = availableWidth;
        }
        this.rows[r].push(e);
        spaceLeft -= entryLength;
      });
    }

    public _doRender() {
      super._doRender();
      var rowsToBeDrawn = this.rows.slice(0, this.numRowsToBeDrawn);
      var rows = this.content.selectAll("g." + HorizontalLegend.LEGEND_ROW_CLASS).data(rowsToBeDrawn);
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
      entries.select("g.text-container")
             .text("") // clear out previous results
             .attr("transform", "translate(" + this.textHeight + ", " + (this.textHeight * 0.1) + ")") // HACKHACK vertical shift
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
