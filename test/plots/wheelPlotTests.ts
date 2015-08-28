///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("WheelPlot", () => {
    const SVG_WIDTH = 400;
    const SVG_HEIGHT = 500;
    const TAU = Math.PI * 2;

    describe("basic usage", () => {
      let svg: d3.Selection<void>;
      let wheelPlot: Plottable.Plots.Wheel<number, number>;
      let rScale: Plottable.Scales.Linear;
      let tScale: Plottable.Scales.Linear;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        rScale = new Plottable.Scales.Linear();
        tScale = new Plottable.Scales.Linear();
        tScale.domain([0, TAU]);
        wheelPlot = new Plottable.Plots.Wheel();
        wheelPlot.r1((d) => d.r1, rScale);
        wheelPlot.r2((d) => d.r2);
        wheelPlot.t1((d) => d.t1, tScale);
        wheelPlot.t2((d) => d.t2);
      });

      it("renders correctly with no data", () => {
        assert.doesNotThrow(() => wheelPlot.renderTo(svg), Error);
        assert.strictEqual(wheelPlot.width(), SVG_WIDTH, "plot has been allocated width");
        assert.strictEqual(wheelPlot.height(), SVG_HEIGHT, "plot has been allocated height");

        svg.remove();
      });

      it("the accessors properly access data, index and Dataset", () => {
        let data = [
          {r1: 0, r2: 1, t1: 0, t2: TAU / 2 },
          {r1: 1, r2: 2, t1: TAU / 2, t2: TAU }];
        let dataset = new Plottable.Dataset(data);
        wheelPlot.addDataset(dataset);
        wheelPlot.renderTo(svg);

        let slices = wheelPlot.selections();
        let path1 = d3.select(slices[0][0]).attr("d");
        let path2 = d3.select(slices[0][1]).attr("d");

        let arc1 = d3.svg.arc().innerRadius(rScale.scale(0)).outerRadius(rScale.scale(1))
                               .startAngle(0).endAngle(TAU / 2);
        let arc1Path = arc1(null);

        let arc2 = d3.svg.arc().innerRadius(rScale.scale(1)).outerRadius(rScale.scale(2))
                               .startAngle(TAU / 2).endAngle(TAU);
        let arc2Path = arc2(null);
        TestMethods.assertAreaPathCloseTo(path1, arc1Path, 0.1, "arc is drawn as represented by data");
        TestMethods.assertAreaPathCloseTo(path2, arc2Path, 0.1, "arc is drawn as represented by data");

        svg.remove();
      });

      it("computes correct layout", () => {
        wheelPlot.renderTo(svg);

        let renderArea = (<any> wheelPlot)._renderArea;
        let transform = d3.transform(renderArea.attr("transform")).translate;
        assert.closeTo(transform[0], SVG_WIDTH / 2, 0.01, "origin is set to the middle of the svg");
        assert.closeTo(transform[1], SVG_HEIGHT / 2, 0.01, "origin is set to the middle of the svg");
        let radiusLimit = Math.min(SVG_WIDTH, SVG_HEIGHT) / 2;
        assert.deepEqual(rScale.range(), [0, radiusLimit] , "the radius scale range is set properly");

        svg.remove();
      });

      it("draws arc clockwise from t1 to t2", () => {
        let data = [
            { r1: 0, r2: 1, t1: 60, t2: -60, expectedEndAngle: 300 },
            { r1: 1, r2: 2, t1: 60, t2: 60, expectedEndAngle: 60 },
            { r1: 2, r2: 3, t1: 60, t2: -300, expectedEndAngle: 420 },
            { r1: 3, r2: 4, t1: 0, t2: 360, expectedEndAngle: 360 },
            { r1: 3, r2: 4, t1: 90, t2: 70, expectedEndAngle: 430 },
            { r1: 3, r2: 4, t1: -60, t2: -180, expectedEndAngle: 180 }
        ];

        let dataset = new Plottable.Dataset(data);
        wheelPlot.addDataset(dataset);
        wheelPlot.t1((d) => d.t1, null);
        wheelPlot.renderTo(svg);
        let slices = wheelPlot.selections();
        data.forEach((datum, i) => {
          let t1 = Plottable.Utils.Math.degreesToRadians(datum.t1);
          let expectedEndAngle = Plottable.Utils.Math.degreesToRadians(datum.expectedEndAngle);
          let path = d3.select(slices[0][i]).attr("d");
          let arc = d3.svg.arc().innerRadius(rScale.scale(datum.r1)).outerRadius(rScale.scale(datum.r2))
                                .startAngle(t1).endAngle(expectedEndAngle);
          let expectedPath = arc(null);
          TestMethods.assertAreaPathCloseTo(path, expectedPath, 0.1, `arc is drawn from ${datum.t1} to ${datum.t2}`);
        });

        svg.remove();
      });

      it("undefined, NaN and non-numeric strings are not represented in a Wheel Plot", () => {
        let data = [
          { r1: 0, r2: 1, t1: 0, t2: 180 },
          { r1: undefined, r2: 2, t1: 180, t2: 360 },
          { r1: NaN, r2: 2, t1: 180, t2: 360 },
          { r1: "Bad String", r2: 2, t1: 180, t2: 360 },
          { r1: 1, r2: undefined, t1: 180, t2: 360 },
          { r1: 1, r2: NaN, t1: 180, t2: 360 },
          { r1: 1, r2: "Bad String", t1: 180, t2: 360 },
          { r1: 1, r2: 2, t1: 180, t2: 360 },
          { r1: 1, r2: 2, t1: undefined, t2: 360 },
          { r1: 1, r2: 2, t1: NaN, t2: 360 },
          { r1: 1, r2: 2, t1: "Bad String", t2: 360 },
          { r1: 1, r2: 2, t1: 180, t2: undefined },
          { r1: 1, r2: 2, t1: 180, t2: NaN },
          { r1: 1, r2: 2, t1: 180, t2: "Bad String" },
          { r1: 2, r2: 3, t1: 90, t2: 180 }
        ];

        let dataset = new Plottable.Dataset(data);
        wheelPlot.t1((d) => d.t1, null);
        wheelPlot.addDataset(dataset);
        wheelPlot.renderTo(svg);

        let elementsDrawn = wheelPlot.content().selectAll(".arc");

        assert.strictEqual(elementsDrawn.size(), 3,
          "There should be exactly 3 sectors in the wheel chart, representing the valid values");

        assert.lengthOf(wheelPlot.entities(), 3,
          "There should be exactly 3 entities in the wheel chart, representing the valid values");

        svg.remove();
      });
    });

    describe("r1() and r2()", () => {
      let svg: d3.Selection<void>;
      let wheelPlot: Plottable.Plots.Wheel<number, number>;
      let rScale: Plottable.Scales.Linear;
      let data: [any];
      let dataset: Plottable.Dataset;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        rScale = new Plottable.Scales.Linear();
        wheelPlot = new Plottable.Plots.Wheel();
        wheelPlot.t1((d) => d.t1);
        wheelPlot.t2((d) => d.t2);
        data = [
          {r1: 0, r2: 1, t1: 0, t2: 180 },
          {r1: 1, r2: 2, t1: 180, t2: 360 }];
        dataset = new Plottable.Dataset(data);
        wheelPlot.addDataset(dataset);
      });

      it("can set and get r1", () => {
        wheelPlot.r2((d) => d.r2);
        assert.isUndefined(wheelPlot.r1(), "r1 is initiized to undefined");

        wheelPlot.r1(0);
        wheelPlot.renderTo(svg);
        assert.strictEqual(wheelPlot.r1().accessor(data[0], 0, dataset), 0, "access r1 that is set to a constant");
        assert.strictEqual(wheelPlot.r1().accessor(data[1], 1, dataset), 0, "access r1 that is set to a constant");
        assert.isUndefined(wheelPlot.r1().scale, "scale of r1 is undefined");

        wheelPlot.r1((d: any) => d.r1);
        assert.strictEqual(wheelPlot.r1().accessor(data[0], 0, dataset), 0, "access r1 correctly without a scale");
        assert.strictEqual(wheelPlot.r1().accessor(data[1], 1, dataset), 1, "access r1 correctly without a scale");
        assert.isUndefined(wheelPlot.r1().scale, "scale of r1 is undefined");

        wheelPlot.r1((d: any) => d.r1, rScale);
        assert.strictEqual(wheelPlot.r1().accessor(data[0], 0, dataset), 0, "access r1 correctly with a scale");
        assert.strictEqual(wheelPlot.r1().accessor(data[1], 1, dataset), 1, "access r1 correctly with a scale");
        assert.deepEqual(wheelPlot.r1().scale, rScale, "scale of r1 is set correctly");
        svg.remove();
      });

      it("can set and get r2", () => {
        wheelPlot.r1((d) => d.r1);
        assert.isUndefined(wheelPlot.r2(), "r2 is initiized to undefined");

        wheelPlot.r2(0);
        wheelPlot.renderTo(svg);
        assert.strictEqual(wheelPlot.r2().accessor(data[0], 0, dataset), 0, "access r2 that is set to a constant");
        assert.strictEqual(wheelPlot.r2().accessor(data[1], 1, dataset), 0, "access r2 that is set to a constant");
        assert.isUndefined(wheelPlot.r2().scale, "scale of r2 is undefined");

        wheelPlot.r2((d: any) => d.r2);
        assert.strictEqual(wheelPlot.r2().accessor(data[0], 0, dataset), 1, "access r2 correctly without a scale");
        assert.strictEqual(wheelPlot.r2().accessor(data[1], 1, dataset), 2, "access r2 correctly without a scale");
        assert.isUndefined(wheelPlot.r2().scale, "scale of r2 is undefined");

        svg.remove();
      });

      it("updates the scale of r2 when scale of r1 is set", () => {
        wheelPlot.r2((d) => d.r2);

        assert.isUndefined(wheelPlot.r2().scale, "scale of r2 is undefined initially");

        wheelPlot.r1((d) => d.r1, rScale);
        assert.deepEqual(wheelPlot.r2().scale, rScale, "scale of r2 is set to be the same scale as r1");

        wheelPlot.r1((d) => d.r1, null);
        assert.isNull(wheelPlot.r2().scale, "scale of r2 is set to null");
        svg.remove();
      });

      it("sets the scale of r2 to the scale of r1", () => {
        wheelPlot.r1((d) => d.r1, rScale);
        wheelPlot.r2((d) => d.r2);
        assert.deepEqual(wheelPlot.r2().scale, rScale, "scale of r2 is set to be the same scale as r1");

        wheelPlot.r1((d) => d.r1, null);
        wheelPlot.r2((d) => d.r2);
        assert.isNull(wheelPlot.r2().scale, "scale of r2 is set to null");
        svg.remove();
      });

      it("only takes QuantitativeScales", () => {
        let scale = new Plottable.Scales.Category();
        assert.throws(() => wheelPlot.r1((d) => d.r1, (<any>scale)), "scale needs to inherit from Scale.QuantitativeScale");
        svg.remove();
      });
    });

    describe("t1() and t2()", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 500;
      let svg: d3.Selection<void>;
      let wheelPlot: Plottable.Plots.Wheel<number, number>;
      let rScale: Plottable.Scales.Linear;
      let tScale: Plottable.Scales.Linear;
      let data: [any];
      let dataset: Plottable.Dataset;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        rScale = new Plottable.Scales.Linear();
        tScale = new Plottable.Scales.Linear();
        tScale.domain([0, TAU]);
        wheelPlot = new Plottable.Plots.Wheel();
        wheelPlot.r1((d) => d.r1, rScale);
        wheelPlot.r2((d) => d.r2);
        data = [
          {r1: 0, r2: 1, t1: 0, t2: TAU / 2 },
          {r1: 1, r2: 2, t1: TAU / 2, t2: TAU }];
        dataset = new Plottable.Dataset(data);
        wheelPlot.addDataset(dataset);
      });

      it("can set and get t1", () => {
        wheelPlot.t2((d) => d.t2);
        assert.isUndefined(wheelPlot.t1(), "t1 is initiized to undefined");

        wheelPlot.t1(0);
        wheelPlot.renderTo(svg);
        assert.strictEqual(wheelPlot.t1().accessor(data[0], 0, dataset), 0, "access t1 that is set to a constant");
        assert.strictEqual(wheelPlot.t1().accessor(data[1], 1, dataset), 0, "access t1 that is set to a constant");
        assert.isUndefined(wheelPlot.t1().scale, "scale of t1 is undefined");

        wheelPlot.t1((d) => d.t1);
        assert.strictEqual(wheelPlot.t1().accessor(data[0], 0, dataset), 0, "access t1 correctly without a scale");
        assert.strictEqual(wheelPlot.t1().accessor(data[1], 1, dataset), TAU / 2, "access t1 correctly without a scale");
        assert.isUndefined(wheelPlot.t1().scale, "scale of t1 is undefined");

        wheelPlot.t1((d) => d.t1, tScale);
        assert.deepEqual(wheelPlot.t1().scale.range(), [0, 360], "range of t1 should be 0 to 360");
        assert.strictEqual(wheelPlot.t1().accessor(data[0], 0, dataset), 0, "access t1 correctly with a scale");
        assert.strictEqual(wheelPlot.t1().accessor(data[1], 1, dataset), TAU / 2, "access t1 correctly with a scale");
        assert.deepEqual(wheelPlot.t1().scale, tScale, "scale of t1 is set correctly");

        svg.remove();
      });

      it("can set and get t2", () => {
        wheelPlot.t1((d) => d.t1);
        assert.isUndefined(wheelPlot.t2(), "t2 is initiized to undefined");

        wheelPlot.t2(0);
        wheelPlot.renderTo(svg);
        assert.strictEqual(wheelPlot.t2().accessor(data[0], 0, dataset), 0, "access t2 that is set to a constant");
        assert.strictEqual(wheelPlot.t2().accessor(data[1], 1, dataset), 0, "access t2 that is set to a constant");
        assert.isUndefined(wheelPlot.t2().scale, "scale of t2 is undefined");

        wheelPlot.t2((d) => d.t2);
        assert.strictEqual(wheelPlot.t2().accessor(data[0], 0, dataset), TAU / 2, "access t2 correctly without a scale");
        assert.strictEqual(wheelPlot.t2().accessor(data[1], 1, dataset), TAU, "access t2 correctly without a scale");
        assert.isUndefined(wheelPlot.t2().scale, "scale of t2 is undefined");
        svg.remove();
      });

      it("updates the scale of t2 when scale of t1 is set", () => {
        wheelPlot.t2((d) => d.t2);

        assert.isUndefined(wheelPlot.t2().scale, "scale of t2 is undefined initially");

        wheelPlot.t1((d) => d.t1, tScale);
        assert.deepEqual(wheelPlot.t2().scale, tScale, "scale of t2 is set to be the same scale of t1");

        wheelPlot.t1((d) => d.t1, null);
        assert.isNull(wheelPlot.t2().scale, "scale of t2 is set to null");
        svg.remove();
      });

      it("sets the scale of t2 to the scale of t1", () => {
        wheelPlot.t1((d) => d.t1, tScale);
        wheelPlot.t2((d) => d.t2);
        assert.deepEqual(wheelPlot.t2().scale, tScale, "scale of t2 is set to be the same scale of t1");

        wheelPlot.t1((d) => d.t1, null);
        wheelPlot.t2((d) => d.t2);
        assert.isNull(wheelPlot.t2().scale, "scale of t2 is set to null");
        svg.remove();
      });

      it("only takes QuantitativeScales", () => {
        let scale = new Plottable.Scales.Category();
        assert.throws(() => wheelPlot.t1((d) => d.t1, (<any>scale)), "scale needs to inherit from Scale.QuantitativeScale");
        svg.remove();
      });
    });
  });

});
