///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("Waterfall Plot", () => {
    let svg: d3.Selection<void>;
    let dataset: Plottable.Dataset;
    let xScale: Plottable.Scales.Category;
    let yScale: Plottable.Scales.Linear;
    let plot: Plottable.Plots.Waterfall<string, number>;
    let renderArea: d3.Selection<void>;
    let SVG_WIDTH = 600;
    let SVG_HEIGHT = 400;
    let data = [
      { x: "A", y: 20, t: "total" },
      { x: "B", y: -5, t: "delta" },
      { x: "C", y: 10, t: "delta" },
      { x: "D", y: 25, t: "total" },
      { x: "E", y: 5, t: "delta" },
      { x: "F", y: -15, t: "delta" },
      { x: "G", y: 15, t: "total" }
    ];

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      dataset = new Plottable.Dataset(data);
      xScale = new Plottable.Scales.Category();
      yScale = new Plottable.Scales.Linear();
      plot = new Plottable.Plots.Waterfall<string, number>();
      plot.x(function(d) { return d.x; }, xScale);
      plot.y(function(d) { return d.y; }, yScale);
      plot.total(function(d) { return d.t === "total" ? true : false; });
      plot.addDataset(dataset);
      plot.renderTo(svg);
      renderArea = (<any> plot)._renderArea;
    });

    it("adjacent bars share correct edge", () => {
      let bars = renderArea.selectAll("rect")[0];
      let data = dataset.data();
      let yAccessor = plot.y().accessor;
      let totalAccessor = plot.total().accessor;
      for (let currentIndex = 1; currentIndex < bars.length; currentIndex++) {
        let currentBar = d3.select(bars[currentIndex]);
        let currentTotal = totalAccessor(data[currentIndex], currentIndex, dataset);
        let currentValue = yAccessor(data[currentIndex], currentIndex, dataset);
        let previousIndex = currentIndex - 1;
        let previousBar = d3.select(bars[previousIndex]);
        let previousTotal = totalAccessor(data[previousIndex], previousIndex, dataset);
        let previousValue = yAccessor(data[previousIndex], previousIndex, dataset);
        if (previousTotal) {
          if (currentTotal || currentValue < 0) {
            assert.isTrue(+previousBar.attr("y") === +currentBar.attr("y"), "bars are top/top aligned");
          } else {
            assert.closeTo(+previousBar.attr("y") - (+currentBar.attr("y") + +currentBar.attr("height")), 0, 1,
              "bars are top/bottom aligned");
          }
        } else {
          if (previousValue > 0) {
            if (currentTotal || currentValue < 0) {
              assert.isTrue(+previousBar.attr("y") === +currentBar.attr("y"), "bars are top/top aligned");
            } else {
              assert.closeTo(+previousBar.attr("y") - (+currentBar.attr("y") + +currentBar.attr("height")), 0, 1,
                "bars are top/bottom aligned");
            }
          } else {
            if (currentTotal || currentValue < 0) {
              assert.closeTo(+previousBar.attr("y") + +previousBar.attr("height") - +currentBar.attr("y"), 0, 1,
                "bars are bottom/top aligned");
            } else {
              assert.closeTo((+previousBar.attr("y") + +previousBar.attr("height")) -
                (+currentBar.attr("y") + +currentBar.attr("height")), 0, 1, "bars are bottom/bottom aligned");
            }
          }
        }
      }
      svg.remove();
    });

    it("bars are classed correctly", () => {
      let bars = renderArea.selectAll("rect")[0];
      let data = dataset.data();
      let totalAccessor = plot.total().accessor;
      bars.forEach((bar, index) => {
        let selection = d3.select(bar);
        let isTotal = totalAccessor(data[index], index, dataset);
        if (isTotal) {
          assert.isTrue(selection.classed("waterfall-total"));
        } else {
          let yAccessor = plot.y().accessor;
          if (yAccessor(data[index], index, dataset) > 0) {
            assert.isTrue(selection.classed("waterfall-growth"));
          } else {
            assert.isTrue(selection.classed("waterfall-decline"));
          }
        }
      });
      svg.remove();
    });

    it("renders connector lines correctly", () => {
      plot.connectorsEnabled(true);
      plot.renderTo(svg);
      let bars = renderArea.selectAll("rect")[0];
      let connectors = renderArea.selectAll("line.connector")[0];
      assert.isTrue(bars.length - 1 === connectors.length, "there is one more bar than number of connectors");
      connectors.forEach((connector, index) => {
        let selection = d3.select(connector);
        let firstBar = d3.select(bars[index]);
        let secondBar = d3.select(bars[index + 1]);
        let firstY = +firstBar.attr("y");
        let firstHeight = +firstBar.attr("height");
        let secondY = +secondBar.attr("y");
        let secondHeight = +secondBar.attr("height");
        if (firstY === secondY || Math.abs(secondY + secondHeight - firstY) < 1) {
          assert.isTrue(firstY === +selection.attr("y1"), "connector is aligned to bars");
        } else {
          assert.closeTo(firstY + firstHeight - +selection.attr("y1"), 0, 1, "connector is aligned to bars");
        }
      });
      svg.remove();
    });
  });
});
