import { SimpleSelection } from "../../src/core/interfaces";
import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Plots", () => {
  [Plottable.Plots.Bar.ORIENTATION_VERTICAL, Plottable.Plots.Bar.ORIENTATION_HORIZONTAL].forEach((orientation: string) => {
    describe(`Clustered Bar Plot in ${orientation} orientation`, () => {
      const SVG_WIDTH = 400;
      const SVG_HEIGHT = 400;
      const isVertical = orientation === Plottable.Plots.Bar.ORIENTATION_VERTICAL;

      let svg: SimpleSelection<void>;
      let categoryScale: Plottable.Scales.Category;
      let linearScale: Plottable.Scales.Linear;
      let clusterBarPlot: Plottable.Plots.ClusteredBar<number | string, number | string>;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        categoryScale = new Plottable.Scales.Category();
        linearScale = new Plottable.Scales.Linear();
        clusterBarPlot = new Plottable.Plots.ClusteredBar<number | string, number | string>(orientation);
        clusterBarPlot.x((d) => isVertical ? d.category : d.num, isVertical ? categoryScale : linearScale);
        clusterBarPlot.y((d) => isVertical ? d.num : d.category, isVertical ? linearScale : categoryScale);
        clusterBarPlot.baselineValue(0);
        clusterBarPlot.renderTo(svg);
      });

      it(`renders with correct width, height and position`, () => {
        linearScale.domain([0, 2]);

        const dataset1 = new Plottable.Dataset([
          {category: "A", num: 1},
          {category: "B", num: 2},
        ]);
        const dataset2 = new Plottable.Dataset([
          {category: "A", num: 2},
          {category: "B", num: 1},
        ]);
        const originalData1 = dataset1.data().slice();
        const originalData2 = dataset2.data().slice();

        clusterBarPlot.addDataset(dataset1);
        clusterBarPlot.addDataset(dataset2);

        const barAreas = clusterBarPlot.content().selectAll<Element, any>(".bar-area");
        assert.strictEqual(barAreas.selectAll("rect").size(), 4, "Number of bars should be equivalent to number of datum");

        const maxValue = Math.max.apply(null, originalData1.map((d) => d.num).concat(originalData2.map((d) => d.num)));
        const innerScale = (<any> clusterBarPlot)._makeInnerScale();
        const rangeBand = innerScale.rangeBand();
        const off = innerScale.scale("0");
        const width = categoryScale.rangeBand() / 2;

        barAreas.each(function(_, outerIndex) {
          d3.select(this).selectAll<Element, any>("rect").each(function(datum, index) {
            const bar = d3.select(this);
            const mainAttr = isVertical ? "height" : "width";
            const secondaryAttr = isVertical ? "width" : "height";
            const position = isVertical ? "x" : "y";

            assert.closeTo(TestMethods.numAttr(bar, secondaryAttr), rangeBand, 2, `${secondaryAttr} is correct for bar ${index}`);
            assert.closeTo(TestMethods.numAttr(bar, mainAttr), (isVertical ? SVG_HEIGHT : SVG_WIDTH) / maxValue * datum.num,
              window.Pixel_CloseTo_Requirement, `${mainAttr} is correct for bar ${index}`);

            // check that clustering is correct
            const offset = outerIndex === 0 ? off - width : width - off;
            assert.closeTo(TestMethods.numAttr(bar, position) + TestMethods.numAttr(bar, secondaryAttr) / 2,
              categoryScale.scale(datum.category) + offset, window.Pixel_CloseTo_Requirement, `${position} pos correct for bar ${index}`);
          });
        });

        assert.deepEqual(dataset1.data(), originalData1, "underlying data is not modified for dataset1");
        assert.deepEqual(dataset2.data(), originalData2, "underlying data is not modified for dataset2");

        svg.remove();
      });

      it("renders correctly with missing values", () => {
        clusterBarPlot.addDataset(new Plottable.Dataset([
          {category: "A", num: 1},
          {category: "B", num: 2},
          {category: "C", num: 1},
        ]));

        clusterBarPlot.addDataset(new Plottable.Dataset([
          {category: "A", num: 2},
          {category: "B", num: 4},
        ]));

        clusterBarPlot.addDataset(new Plottable.Dataset([
          {category: "B", num: 15},
          {category: "C", num: 15},
        ]));


        const barAreas = clusterBarPlot.content().selectAll<Element, any>(".bar-area");
        assert.strictEqual(barAreas.selectAll("rect").size(), 7, "Number of bars should be equivalent to number of datum");

        const bars = barAreas.nodes().map((node) => {
          return d3.select(node).selectAll<Element, any>("rect").nodes();
        });
        const aBar0 = d3.select(bars[0][0]);
        const aBar1 = d3.select(bars[1][0]);

        const bBar0 = d3.select(bars[0][1]);
        const bBar1 = d3.select(bars[1][1]);
        const bBar2 = d3.select(bars[2][0]);

        const cBar0 = d3.select(bars[0][2]);
        const cBar1 = d3.select(bars[2][1]);

        const attr = isVertical ? "x" : "y";

        // check bars are in domain order
        assert.operator(TestMethods.numAttr(aBar0, attr), "<", TestMethods.numAttr(bBar0, attr), "first dataset bars ordered correctly");
        assert.operator(TestMethods.numAttr(bBar0, attr), "<", TestMethods.numAttr(cBar0, attr), "first dataset bars ordered correctly");

        assert.operator(TestMethods.numAttr(aBar1, attr), "<", TestMethods.numAttr(bBar1, attr), "second dataset bars ordered correctly");

        assert.operator(TestMethods.numAttr(bBar2, attr), "<", TestMethods.numAttr(cBar1, attr), "third dataset bars ordered correctly");

        // check that clustering is correct
        assert.operator(TestMethods.numAttr(aBar0, attr), "<", TestMethods.numAttr(aBar1, attr), "A bars clustered in dataset order");

        assert.operator(TestMethods.numAttr(bBar0, attr), "<", TestMethods.numAttr(bBar1, attr), "B bars clustered in dataset order");
        assert.operator(TestMethods.numAttr(bBar1, attr), "<", TestMethods.numAttr(bBar2, attr), "B bars clustered in dataset order");

        assert.operator(TestMethods.numAttr(cBar0, attr), "<", TestMethods.numAttr(cBar1, attr), "C bars clustered in dataset order");

        svg.remove();
      });
    });
  });
});
