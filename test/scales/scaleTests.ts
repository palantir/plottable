///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Scales", () => {
  it("Scale's copy() works correctly", () => {
    var testCallback: Plottable.Core.IBroadcasterCallback = (broadcaster: Plottable.Core.IListenable) => {
      return true; // doesn't do anything
    };
    var scale = new Plottable.Scale.Linear();
    scale.broadcaster.registerListener(null, testCallback);
    var scaleCopy = scale.copy();
    assert.deepEqual(scale.domain(), scaleCopy.domain(), "Copied scale has the same domain as the original.");
    assert.deepEqual(scale.range(), scaleCopy.range(), "Copied scale has the same range as the original.");
    assert.notDeepEqual(scale.broadcaster, scaleCopy.broadcaster,
                              "Broadcasters are not copied over");
  });

  it("Scale alerts listeners when its domain is updated", () => {
    var scale = new Plottable.Scale.Linear();
    var callbackWasCalled = false;
    var testCallback: Plottable.Core.IBroadcasterCallback = (listenable: Plottable.Core.IListenable) => {
      assert.equal(listenable, scale, "Callback received the calling scale as the first argument");
      callbackWasCalled = true;
    };
    scale.broadcaster.registerListener(null, testCallback);
    scale.domain([0, 10]);
    assert.isTrue(callbackWasCalled, "The registered callback was called");

    (<any> scale).autoDomainAutomatically = true;
    scale.updateExtent(1, "x", [0.08, 9.92]);
    callbackWasCalled = false;
    scale.domainer(new Plottable.Domainer().nice());
    assert.isTrue(callbackWasCalled, "The registered callback was called when nice() is used to set the domain");

    callbackWasCalled = false;
    scale.domainer(new Plottable.Domainer().pad());
    assert.isTrue(callbackWasCalled, "The registered callback was called when padDomain() is used to set the domain");
  });
  describe("autoranging behavior", () => {
    var data: any[];
    var dataSource: Plottable.DataSource;
    var scale: Plottable.Scale.Linear;
    beforeEach(() => {
      data = [{foo: 2, bar: 1}, {foo: 5, bar: -20}, {foo: 0, bar: 0}];
      dataSource = new Plottable.DataSource(data);
      scale = new Plottable.Scale.Linear();
    });

    it("scale autoDomain flag is not overwritten without explicitly setting the domain", () => {
      scale.updateExtent(1, "x", d3.extent(data, (e) => e.foo));
      scale.domainer(new Plottable.Domainer().pad().nice());
      assert.isTrue((<any> scale).autoDomainAutomatically,
                          "the autoDomain flag is still set after autoranginging and padding and nice-ing");
      scale.domain([0, 5]);
      assert.isFalse((<any> scale).autoDomainAutomatically, "the autoDomain flag is false after domain explicitly set");
    });

    it("scale autorange works as expected with single dataSource", () => {
      var svg = generateSVG(100, 100);
      var renderer = new Plottable.Abstract.Plot()
                        .dataSource(dataSource)
                        .project("x", "foo", scale)
                        .renderTo(svg);
      assert.deepEqual(scale.domain(), [0, 5], "scale domain was autoranged properly");
      data.push({foo: 100, bar: 200});
      dataSource.data(data);
      assert.deepEqual(scale.domain(), [0, 100], "scale domain was autoranged properly");
      svg.remove();
    });

    it("scale reference counting works as expected", () => {
      var svg1 = generateSVG(100, 100);
      var svg2 = generateSVG(100, 100);
      var renderer1 = new Plottable.Abstract.Plot()
                          .dataSource(dataSource)
                          .project("x", "foo", scale);
      renderer1.renderTo(svg1);
      var renderer2 = new Plottable.Abstract.Plot()
                          .dataSource(dataSource)
                          .project("x", "foo", scale);
      renderer2.renderTo(svg2);
      var otherScale = new Plottable.Scale.Linear();
      renderer1.project("x", "foo", otherScale);
      dataSource.data([{foo: 10}, {foo: 11}]);
      assert.deepEqual(scale.domain(), [10, 11], "scale was still listening to dataSource after one perspective deregistered");
      renderer2.project("x", "foo", otherScale);
      // "scale not listening to the dataSource after all perspectives removed"
      dataSource.data([{foo: 99}, {foo: 100}]);
      assert.deepEqual(scale.domain(), [0, 1], "scale shows default values when all perspectives removed");
      svg1.remove();
      svg2.remove();
    });

    it("scale perspectives can be removed appropriately", () => {
      assert.isTrue((<any> scale).autoDomainAutomatically, "autoDomain enabled1");
      scale.updateExtent(1, "x", d3.extent(data, (e) => e.foo));
      scale.updateExtent(2, "x", d3.extent(data, (e) => e.bar));
      assert.isTrue((<any> scale).autoDomainAutomatically, "autoDomain enabled2");
      assert.deepEqual(scale.domain(), [-20, 5], "scale domain includes both perspectives");
      assert.isTrue((<any> scale).autoDomainAutomatically, "autoDomain enabled3");
      scale.removeExtent(1, "x");
      assert.isTrue((<any> scale).autoDomainAutomatically, "autoDomain enabled4");
      assert.deepEqual(scale.domain(), [-20, 1], "only the bar accessor is active");
      scale.updateExtent(2, "x", d3.extent(data, (e) => e.foo));
      assert.isTrue((<any> scale).autoDomainAutomatically, "autoDomain enabled5");
      assert.deepEqual(scale.domain(), [0, 5], "the bar accessor was overwritten");
    });

    it("scales don't allow Infinity", () => {
      assert.throws(() => scale._setDomain([5, Infinity]), Error);
      assert.throws(() => scale._setDomain([-Infinity, 6]), Error);
    });

    it("should resize when a plot is removed", () => {
      var svg = generateSVG(400, 400);
      var ds1 = [{x: 0, y: 0}, {x: 1, y: 1}];
      var ds2 = [{x: 1, y: 1}, {x: 2, y: 2}];
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      xScale.domainer(new Plottable.Domainer());
      var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
      var yAxis = new Plottable.Axis.Numeric(yScale, "left");
      var renderAreaD1 = new Plottable.Plot.Line(ds1, xScale, yScale);
      var renderAreaD2 = new Plottable.Plot.Line(ds2, xScale, yScale);
      var renderAreas = renderAreaD1.merge(renderAreaD2);
      renderAreas.renderTo(svg);
      assert.deepEqual(xScale.domain(), [0, 2]);
      renderAreaD1.detach();
      assert.deepEqual(xScale.domain(), [1, 2], "resize on plot.detach()");
      renderAreas.merge(renderAreaD1);
      assert.deepEqual(xScale.domain(), [0, 2], "resize on plot.merge()");
      svg.remove();
    });
  });

  describe("Quantitive Scales", () => {
    it("autorange defaults to [0, 1] if no perspectives set", () => {
      var scale = new Plottable.Scale.Linear();
      scale.autoDomain();
      var d = scale.domain();
      assert.equal(d[0], 0);
      assert.equal(d[1], 1);
    });
  });

  describe("Ordinal Scales", () => {
    it("defaults to \"bands\" range type", () => {
      var scale = new Plottable.Scale.Ordinal();
      assert.deepEqual(scale.rangeType(), "bands");
    });

    it("rangeBand returns 0 when in \"points\" mode", () => {
      var scale = new Plottable.Scale.Ordinal().rangeType("points");
      assert.deepEqual(scale.rangeType(), "points");
      assert.deepEqual(scale.rangeBand(), 0);
    });

    it("rangeBand is updated when domain changes in \"bands\" mode", () => {
      var scale = new Plottable.Scale.Ordinal();
      scale.rangeType("bands");
      assert.deepEqual(scale.rangeType(), "bands");
      scale.range([0, 2679]);

      scale.domain([1,2,3,4]);
      assert.deepEqual(scale.rangeBand(), 399);

      scale.domain([1,2,3,4,5]);
      assert.deepEqual(scale.rangeBand(), 329);
    });

    it("rangeType triggers broadcast", () => {
      var scale = new Plottable.Scale.Ordinal();
      var callbackWasCalled = false;
      var testCallback: Plottable.Core.IBroadcasterCallback = (listenable: Plottable.Core.IListenable) => {
        assert.equal(listenable, scale, "Callback received the calling scale as the first argument");
        callbackWasCalled = true;
      };
      scale.broadcaster.registerListener(null, testCallback);
      scale.rangeType("points");
      assert.isTrue(callbackWasCalled, "The registered callback was called");
    });

    it("ordinalScale converts non-string domains into strings", () => {
      var scale = new Plottable.Scale.Ordinal();
      scale.domain([1,2,3,4,5]);
      assert.deepEqual(scale.domain(), ["1", "2", "3", "4", "5"]);
    });
  });

  it("OrdinalScale + BarPlot combo works as expected when the data is swapped", () => {
    // This unit test taken from SLATE, see SLATE-163 a fix for SLATE-102
    var xScale = new Plottable.Scale.Ordinal();
    var yScale = new Plottable.Scale.Linear();
    var dA = {x: "A", y: 2};
    var dB = {x: "B", y: 2};
    var dC = {x: "C", y: 2};
    var barPlot = new Plottable.Plot.VerticalBar([dA, dB], xScale, yScale);
    var svg = generateSVG();
    assert.deepEqual(xScale.domain(), [], "before anchoring, the bar plot doesn't proxy data to the scale");
    barPlot.renderTo(svg);
    assert.deepEqual(xScale.domain(), ["A", "B"], "after anchoring, the bar plot's data is on the scale");

    function iterateDataChanges(...dataChanges: any[]) {
      dataChanges.forEach((dataChange) => {
        barPlot.dataSource().data(dataChange);
      });
    }

    iterateDataChanges([], [dA, dB, dC], []);
    assert.lengthOf(xScale.domain(), 0);

    iterateDataChanges([dA], [dB]);
    assert.lengthOf(xScale.domain(), 1);
    iterateDataChanges([], [dA, dB, dC]);
    assert.lengthOf(xScale.domain(), 3);
  });

  describe("Color Scales", () => {
    it("accepts categorical string types and ordinal domain", () => {
      var scale = new Plottable.Scale.Color("10");
      scale.domain(["yes", "no", "maybe"]);
      assert.equal("#1f77b4", scale.scale("yes"));
      assert.equal("#ff7f0e", scale.scale("no"));
      assert.equal("#2ca02c", scale.scale("maybe"));
    });
  });

  describe("Interpolated Color Scales", () => {
    it("default scale uses reds and a linear scale type", () => {
      var scale = new Plottable.Scale.InterpolatedColor();
      scale.domain([0, 16]);
      assert.equal("#ffffff", scale.scale(0));
      assert.equal("#feb24c", scale.scale(8));
      assert.equal("#b10026", scale.scale(16));
    });

    it("linearly interpolates colors in L*a*b color space", () => {
      var scale = new Plottable.Scale.InterpolatedColor("reds");
      scale.domain([0, 1]);
      assert.equal("#b10026", scale.scale(1));
      assert.equal("#d9151f", scale.scale(0.9));
    });

    it("accepts array types with color hex values", () => {
      var scale = new Plottable.Scale.InterpolatedColor(["#000", "#FFF"]);
      scale.domain([0, 16]);
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      assert.equal("#777777", scale.scale(8));
    });

    it("accepts array types with color names", () => {
      var scale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
      scale.domain([0, 16]);
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      assert.equal("#777777", scale.scale(8));
    });

    it("overflow scale values clamp to range", () => {
      var scale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
      scale.domain([0, 16]);
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      assert.equal("#000000", scale.scale(-100));
      assert.equal("#ffffff", scale.scale(100));
    });

    it("can be converted to a different range", () => {
      var scale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
      scale.domain([0, 16]);
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      scale.colorRange("reds");
      assert.equal("#b10026", scale.scale(16));
    });

    it("can be converted to a different scale type", () => {
      var scale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
      scale.domain([0, 16]);
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      assert.equal("#777777", scale.scale(8));

      scale.scaleType("log");
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      assert.equal("#e3e3e3", scale.scale(8));
    });
  });
});
