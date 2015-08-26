///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("WheelPlot", () => {
    describe("basic usage", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 500;
      let svg: d3.Selection<void>;
      let wheelPlot: Plottable.Plots.Wheel<number, number>;
      let rScale: Plottable.Scales.Linear;
      let tScale: Plottable.Scales.Linear;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        rScale = new Plottable.Scales.Linear();
        tScale = new Plottable.Scales.Linear();
        tScale.domain([0, 360]);
        wheelPlot = new Plottable.Plots.Wheel();
        wheelPlot.innerRadius((d) => d.r1, rScale);
        wheelPlot.outerRadius((d) => d.r2);
        wheelPlot.startAngle((d) => d.t1, tScale);
        wheelPlot.endAngle((d) => d.t2);
      });

      it("renders correctly with no data", () => {
        assert.doesNotThrow(() => wheelPlot.renderTo(svg), Error);
        assert.strictEqual(wheelPlot.width(), SVG_WIDTH, "plot has been allocated width");
        assert.strictEqual(wheelPlot.height(), SVG_HEIGHT, "plot has been allocated height");

        svg.remove();
      });

      it("the accessors properly access data, index and Dataset", () => {
        let data = [
          {r1: 0, r2: 1, t1: 0, t2: 180 },
          {r1: 1, r2: 2, t1: 180, t2: 360 }];
        let dataset = new Plottable.Dataset(data);
        wheelPlot.addDataset(dataset);
        wheelPlot.renderTo(svg);

        let slices = wheelPlot.selections();
        let path1 = d3.select(slices[0][0]).attr("d");
        let path2 = d3.select(slices[0][1]).attr("d");

        let arc1 = d3.svg.arc().innerRadius(rScale.scale(0)).outerRadius(rScale.scale(1))
                               .startAngle(tScale.scale(0)).endAngle(tScale.scale(180));
        let arc1Path = arc1(null);

        let arc2 = d3.svg.arc().innerRadius(rScale.scale(1)).outerRadius(rScale.scale(2))
                               .startAngle(tScale.scale(180)).endAngle(tScale.scale(360));
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

      it("draws arc clockwise from startAngle toendAngle", () => {
        let data = [{r1: 0, r2: 1, t1: 60, t2: -60 }];
        let dataset = new Plottable.Dataset(data);
        wheelPlot.addDataset(dataset);
        wheelPlot.renderTo(svg);

        let slices = wheelPlot.selections();
        let path = d3.select(slices[0][0]).attr("d");
        let arc = d3.svg.arc().innerRadius(rScale.scale(0)).outerRadius(rScale.scale(1))
                               .startAngle(tScale.scale(60)).endAngle(tScale.scale(300));
        let expectedPath = arc(null);
        TestMethods.assertAreaPathCloseTo(path, expectedPath, 0.1, "arc is drawn from 60 to -60");

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

    describe("innerRadius and outerRadius", () => {
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
        tScale.domain([0, 360]);
        wheelPlot = new Plottable.Plots.Wheel();
        wheelPlot.startAngle((d) => d.t1, tScale);
        wheelPlot.endAngle((d) => d.t2);
        data = [
          {r1: 0, r2: 1, t1: 0, t2: 180 },
          {r1: 1, r2: 2, t1: 180, t2: 360 }];
        dataset = new Plottable.Dataset(data);
        wheelPlot.addDataset(dataset);
      });

      it("can set and get innerRadius", () => {
        wheelPlot.outerRadius((d) => d.r2);
        assert.isUndefined(wheelPlot.innerRadius(), "innerRadius is initiized to undefined");

        wheelPlot.innerRadius(0);
        wheelPlot.renderTo(svg);
        assert.strictEqual(wheelPlot.innerRadius().accessor(data[0], 0, dataset), 0, "access innerRadius that is set to a constant");
        assert.strictEqual(wheelPlot.innerRadius().accessor(data[1], 1, dataset), 0, "access innerRadius that is set to a constant");
        assert.isUndefined(wheelPlot.innerRadius().scale, "scale of innerRadius is undefined");

        wheelPlot.innerRadius((d: any) => d.r1);
        assert.strictEqual(wheelPlot.innerRadius().accessor(data[0], 0, dataset), 0, "access innerRadius correctly without a scale");
        assert.strictEqual(wheelPlot.innerRadius().accessor(data[1], 1, dataset), 1, "access innerRadius correctly without a scale");
        assert.isUndefined(wheelPlot.innerRadius().scale, "scale of innerRadius is undefined");

        wheelPlot.innerRadius((d: any) => d.r1, rScale);
        assert.strictEqual(wheelPlot.innerRadius().accessor(data[0], 0, dataset), 0, "access innerRadius correctly with a scale");
        assert.strictEqual(wheelPlot.innerRadius().accessor(data[1], 1, dataset), 1, "access innerRadius correctly with a scale");
        assert.deepEqual(wheelPlot.innerRadius().scale, rScale, "scale of innerRadius is set correctly");
        svg.remove();
      });

      it("can set and get outerRadius", () => {
        wheelPlot.innerRadius((d) => d.r1);
        assert.isUndefined(wheelPlot.outerRadius(), "outerRadius is initiized to undefined");

        wheelPlot.outerRadius(0);
        wheelPlot.renderTo(svg);
        assert.strictEqual(wheelPlot.outerRadius().accessor(data[0], 0, dataset), 0, "access outerRadius that is set to a constant");
        assert.strictEqual(wheelPlot.outerRadius().accessor(data[1], 1, dataset), 0, "access outerRadius that is set to a constant");
        assert.isUndefined(wheelPlot.outerRadius().scale, "scale of outerRadius is undefined");

        wheelPlot.outerRadius((d: any) => d.r2);
        assert.strictEqual(wheelPlot.outerRadius().accessor(data[0], 0, dataset), 1, "access outerRadius correctly without a scale");
        assert.strictEqual(wheelPlot.outerRadius().accessor(data[1], 1, dataset), 2, "access outerRadius correctly without a scale");
        assert.isUndefined(wheelPlot.outerRadius().scale, "scale of outerRadius is undefined");

        svg.remove();
      });

      it("sets scale of outerRadius when scale of innerRadius is set", () => {
        wheelPlot.outerRadius((d) => d.r2);
        wheelPlot.renderTo(svg);

        assert.isUndefined(wheelPlot.outerRadius().scale, "scale of outerRadius is undefined initially");

        wheelPlot.innerRadius((d) => d.r1, rScale);
        assert.deepEqual(wheelPlot.outerRadius().scale, rScale, "scale of outerRadius is set to be the same scale as innerRadius");

        wheelPlot.innerRadius((d) => d.r1, null);
        assert.isNull(wheelPlot.outerRadius().scale, "scale of outerRadius is set to null");
        svg.remove();
      });
    });

    describe("startAngle and endAngle", () => {
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
        tScale.domain([0, 360]);
        wheelPlot = new Plottable.Plots.Wheel();
        wheelPlot.innerRadius((d) => d.r1, rScale);
        wheelPlot.outerRadius((d) => d.r2);
        data = [
          {r1: 0, r2: 1, t1: 0, t2: 180 },
          {r1: 1, r2: 2, t1: 180, t2: 360 }];
        dataset = new Plottable.Dataset(data);
        wheelPlot.addDataset(dataset);
      });

      it("can set and get startAngle", () => {
        wheelPlot.endAngle((d) => d.t2);
        assert.isUndefined(wheelPlot.startAngle(), "startAngle is initiized to undefined");

        wheelPlot.startAngle(0);
        wheelPlot.renderTo(svg);
        assert.strictEqual(wheelPlot.startAngle().accessor(data[0], 0, dataset), 0, "access startAngle that is set to a constant");
        assert.strictEqual(wheelPlot.startAngle().accessor(data[1], 1, dataset), 0, "access startAngle that is set to a constant");
        assert.isUndefined(wheelPlot.startAngle().scale, "scale of startAngle is undefined");

        wheelPlot.startAngle((d) => d.t1);
        assert.strictEqual(wheelPlot.startAngle().accessor(data[0], 0, dataset), 0, "access startAngle correctly without a scale");
        assert.strictEqual(wheelPlot.startAngle().accessor(data[1], 1, dataset), 180, "access startAngle correctly without a scale");
        assert.isUndefined(wheelPlot.startAngle().scale, "scale of startAngle is undefined");

        wheelPlot.startAngle((d) => d.t1, tScale);
        assert.deepEqual(wheelPlot.startAngle().scale.range(), [0, Math.PI * 2], "range of startAngle should be 0 to 2PI");
        assert.strictEqual(wheelPlot.startAngle().accessor(data[0], 0, dataset), 0, "access startAngle correctly with a scale");
        assert.strictEqual(wheelPlot.startAngle().accessor(data[1], 1, dataset), 180, "access startAngle correctly with a scale");
        assert.deepEqual(wheelPlot.startAngle().scale, tScale, "scale of startAngle is set correctly");

        svg.remove();
      });

      it("can set and get endAngle", () => {
        wheelPlot.startAngle((d) => d.t1);
        assert.isUndefined(wheelPlot.endAngle(), "endAngle is initiized to undefined");

        wheelPlot.endAngle(0);
        wheelPlot.renderTo(svg);
        assert.strictEqual(wheelPlot.endAngle().accessor(data[0], 0, dataset), 0, "access endAngle that is set to a constant");
        assert.strictEqual(wheelPlot.endAngle().accessor(data[1], 1, dataset), 0, "access endAngle that is set to a constant");
        assert.isUndefined(wheelPlot.endAngle().scale, "scale of endAngle is undefined");

        wheelPlot.endAngle((d) => d.t2);
        assert.strictEqual(wheelPlot.endAngle().accessor(data[0], 0, dataset), 180, "access endAngle correctly without a scale");
        assert.strictEqual(wheelPlot.endAngle().accessor(data[1], 1, dataset), 360, "access endAngle correctly without a scale");
        assert.isUndefined(wheelPlot.endAngle().scale, "scale of endAngle is undefined");
        svg.remove();
      });

      it("sets scale of endAngle when scale of startAngle is set", () => {
        wheelPlot.endAngle((d) => d.t2);
        wheelPlot.renderTo(svg);

        assert.isUndefined(wheelPlot.endAngle().scale, "scale of endAngle is undefined initially");

        wheelPlot.startAngle((d) => d.t1, tScale);
        assert.deepEqual(wheelPlot.endAngle().scale, tScale, "scale of endAngle is set to be the same scale of startAngle");

        wheelPlot.startAngle((d) => d.t1, null);
        assert.isNull(wheelPlot.endAngle().scale, "scale of endAngle is set to null");

        svg.remove();
      });
    });
  });

});
