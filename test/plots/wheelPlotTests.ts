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
        wheelPlot.outerRadius((d) => d.r2, rScale);
        wheelPlot.startAngle((d) => d.t1, tScale);
        wheelPlot.endAngle((d) => d.t2, tScale);
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
        let arc1Path = (<any> arc1)();

        let arc2 = d3.svg.arc().innerRadius(rScale.scale(1)).outerRadius(rScale.scale(2))
                               .startAngle(tScale.scale(180)).endAngle(tScale.scale(360));
        let arc2Path = (<any> arc2)();
        assert.strictEqual(path1, arc1Path);
        assert.strictEqual(path2, arc2Path);

        svg.remove();
      });

      it("updates slices when data changes", () => {
        let data = [
          {r1: 0, r2: 1, t1: 0, t2: 180 },
          {r1: 1, r2: 2, t1: 180, t2: 360 }];
        let dataset = new Plottable.Dataset(data);
        wheelPlot.addDataset(dataset);
        wheelPlot.renderTo(svg);

        assert.strictEqual(wheelPlot.content().selectAll("path").size(), 2, "there are 2 sectors for 2 data entries");

        data = [{r1: 2, r2: 3, t1: 0, t2: 120 }];
        dataset.data(data);
        assert.strictEqual(wheelPlot.content().selectAll("path").size(), 1, "there are 2 sectors for 1 data entry");

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

      it("undefined, NaN and non-numeric strings not be represented in a Pie Chart", () => {
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

        let elementsDrawn = (<any> wheelPlot)._element.selectAll(".arc");

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
        wheelPlot.endAngle((d) => d.t2, tScale);
        data = [
          {r1: 0, r2: 1, t1: 0, t2: 180 },
          {r1: 1, r2: 2, t1: 180, t2: 360 }];
        dataset = new Plottable.Dataset(data);
        wheelPlot.addDataset(dataset);
      });

      it("can set and get innerRadius", () => {
        wheelPlot.outerRadius((d) => d.r2, rScale);
        assert.isUndefined(wheelPlot.innerRadius(), "innerRadius is initiized to undefined");

        wheelPlot.innerRadius(0);
        wheelPlot.renderTo(svg);
        let constInnerRadiusAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.innerRadius());
        assert.strictEqual(constInnerRadiusAccessor(data[0], 0, dataset), 0, "access innerRadius that is set to a constant");
        assert.strictEqual(constInnerRadiusAccessor(data[1], 1, dataset), 0, "access innerRadius that is set to a constant");

        wheelPlot.innerRadius((d: any) => d.r1);
        let innerRadiusAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.innerRadius());
        assert.strictEqual(innerRadiusAccessor(data[0], 0, dataset), 0, "access innerRadius correctly without a scale");
        assert.strictEqual(innerRadiusAccessor(data[1], 1, dataset), 1, "access innerRadius correctly without a scale");

        wheelPlot.innerRadius((d: any) => d.r1, rScale);
        let scaledInnerRadiusAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.innerRadius());
        assert.strictEqual(scaledInnerRadiusAccessor(data[0], 0, dataset), rScale.scale(0), "access innerRadius correctly with a scale");
        assert.strictEqual(scaledInnerRadiusAccessor(data[1], 1, dataset), rScale.scale(1), "access innerRadius correctly with a scale");

        svg.remove();
      });

      it("can set and get outerRadius", () => {
        wheelPlot.innerRadius((d) => d.r1, rScale);
        assert.isUndefined(wheelPlot.outerRadius(), "outerRadius is initiized to undefined");

        wheelPlot.outerRadius(0);
        wheelPlot.renderTo(svg);
        let constEndAngleAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.outerRadius());
        assert.strictEqual(constEndAngleAccessor(data[0], 0, dataset), 0, "access outerRadius that is set to a constant");
        assert.strictEqual(constEndAngleAccessor(data[1], 1, dataset), 0, "access outerRadius that is set to a constant");

        wheelPlot.outerRadius((d: any) => d.r2);
        let outerRadiusAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.outerRadius());
        assert.strictEqual(outerRadiusAccessor(data[0], 0, dataset), 1, "access outerRadius correctly without a scale");
        assert.strictEqual(outerRadiusAccessor(data[1], 1, dataset), 2, "access outerRadius correctly without a scale");

        wheelPlot.outerRadius((d: any) => d.r2, rScale);
        let scaledEndAngleAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.outerRadius());
        assert.strictEqual(scaledEndAngleAccessor(data[0], 0, dataset), rScale.scale(1), "access outerRadius correctly with a scale");
        assert.strictEqual(scaledEndAngleAccessor(data[1], 1, dataset), rScale.scale(2), "access outerRadius correctly with a scale");

        svg.remove();
      });

      it("can set innerRadius and outerRadius to different scale", () => {
        let rScale2 = new Plottable.Scales.ModifiedLog;
        wheelPlot.innerRadius((d) => d.r1, rScale);
        wheelPlot.outerRadius((d) => d.r2, rScale2);
        wheelPlot.renderTo(svg);

        let innerRadiusAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.innerRadius());
        let outerRadiusAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.outerRadius());
        assert.strictEqual(innerRadiusAccessor(data[0], 0, dataset), rScale.scale(0), "access innerRadius correctly");
        assert.strictEqual(innerRadiusAccessor(data[1], 1, dataset), rScale.scale(1), "access innerRadius correctly");
        assert.strictEqual(outerRadiusAccessor(data[0], 0, dataset), rScale2.scale(1), "access outerRadius correctly");
        assert.strictEqual(outerRadiusAccessor(data[1], 1, dataset), rScale2.scale(2), "access outerRadius correctly");

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
        wheelPlot.outerRadius((d) => d.r2, rScale);
        data = [
          {r1: 0, r2: 1, t1: 0, t2: 180 },
          {r1: 1, r2: 2, t1: 180, t2: 360 }];
        dataset = new Plottable.Dataset(data);
        wheelPlot.addDataset(dataset);
      });

      it("can set and get startAngle", () => {
        wheelPlot.endAngle((d) => d.t2, tScale);
        assert.isUndefined(wheelPlot.startAngle(), "startAngle is initiized to undefined");

        wheelPlot.startAngle(0);
        wheelPlot.renderTo(svg);
        let constStartAngleAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.startAngle());
        assert.strictEqual(constStartAngleAccessor(data[0], 0, dataset), 0, "access startAngle that is set to a constant");
        assert.strictEqual(constStartAngleAccessor(data[1], 1, dataset), 0, "access startAngle that is set to a constant");

        wheelPlot.startAngle((d) => d.t1);
        let startAngleAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.startAngle());
        assert.strictEqual(startAngleAccessor(data[0], 0, dataset), 0, "access startAngle correctly without a scale");
        assert.strictEqual(startAngleAccessor(data[1], 1, dataset), 180, "access startAngle correctly without a scale");

        wheelPlot.startAngle((d) => d.t1, tScale);
        let scaledStartAngleAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.startAngle());
        assert.deepEqual(wheelPlot.startAngle().scale.range(), [0, Math.PI * 2], "range of startAngle should be 0 to 2PI");
        assert.strictEqual(scaledStartAngleAccessor(data[0], 0, dataset), tScale.scale(0), "access startAngle correctly with a scale");
        assert.strictEqual(scaledStartAngleAccessor(data[1], 1, dataset), tScale.scale(180), "access startAngle correctly with a scale");

        svg.remove();
      });

      it("can set and get endAngle", () => {
        wheelPlot.startAngle((d) => d.t1, tScale);
        assert.isUndefined(wheelPlot.endAngle(), "endAngle is initiized to undefined");

        wheelPlot.endAngle(0);
        wheelPlot.renderTo(svg);
        let constOuterRadiusAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.endAngle());
        assert.strictEqual(constOuterRadiusAccessor(data[0], 0, dataset), 0, "access endAngle that is set to a constant");
        assert.strictEqual(constOuterRadiusAccessor(data[1], 1, dataset), 0, "access endAngle that is set to a constant");

        wheelPlot.endAngle((d) => d.t2);
        let endAngleAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.endAngle());
        assert.strictEqual(endAngleAccessor(data[0], 0, dataset), 180, "access endAngle correctly without a scale");
        assert.strictEqual(endAngleAccessor(data[1], 1, dataset), 360, "access endAngle correctly without a scale");

        wheelPlot.endAngle((d) => d.t2, tScale);
        let scaledOuterRadiusAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.endAngle());
        assert.deepEqual(wheelPlot.endAngle().scale.range(), [0, Math.PI * 2], "range of endAngle should be 0 to 2PI");
        assert.strictEqual(scaledOuterRadiusAccessor(data[0], 0, dataset), tScale.scale(180), "access endAngle correctly with a scale");
        assert.strictEqual(scaledOuterRadiusAccessor(data[1], 1, dataset), tScale.scale(360), "access endAngle correctly with a scale");
        svg.remove();
      });

      it("can set startAngle and endAngle to different scale", () => {
        let tScale2 = new Plottable.Scales.ModifiedLog;
        tScale2.domain([0, 360]);
        wheelPlot.startAngle((d) => d.t1, tScale);
        wheelPlot.endAngle((d) => d.t2, tScale2);
        wheelPlot.renderTo(svg);
        let startAngleAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.startAngle());
        let endAngleAccessor = (<any> Plottable.Plot)._scaledAccessor(wheelPlot.endAngle());
        assert.deepEqual(wheelPlot.endAngle().scale.range(), [0, Math.PI * 2], "range of startAngle should be 0 to 2PI");

        assert.deepEqual(wheelPlot.endAngle().scale.range(), [0, Math.PI * 2], "range of endAngle should be 0 to 2PI");
        assert.strictEqual(startAngleAccessor(data[0], 0, dataset), tScale.scale(0), "access startAngle correctly");
        assert.strictEqual(startAngleAccessor(data[1], 1, dataset), tScale.scale(180), "access startAngle correctly");
        assert.strictEqual(endAngleAccessor(data[0], 0, dataset), tScale2.scale(180), "access endAngle correctly");
        assert.strictEqual(endAngleAccessor(data[1], 1, dataset), tScale2.scale(360), "access endAngle correctly");

        svg.remove();
      });
    });
  });

});
