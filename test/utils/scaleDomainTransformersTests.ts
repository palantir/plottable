///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("ScaleDomainTransformers", () => {

  describe("translate", () => {

    it("translation on arbitrary value", ()=> {
      var domain = [0, 100];
      var range = [0, 200];
      var scale = new Plottable.Scale.Linear();
      scale.domain(domain).range(range);
      var translatedDomain = Plottable.ScaleDomainTransformers.translate(scale, 10);
      assert.deepEqual(translatedDomain, [5, 105], "domain translated by correct amount");
    });

  });

  describe("magnify", () => {

    describe("magnifyAmount", () => {

      it("magnify on arbitrary value",() => {
        var domain = [0, 100];
        var range = [0, 200];
        var scale = new Plottable.Scale.Linear();
        scale.domain(domain).range(range);
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 0.50, 100);
        assert.deepEqual(translatedDomain, [25, 75], "domain magnified by correct amount");
      });

      it("magnify on 1",() => {
        var domain = [0, 100];
        var range = [0, 200];
        var scale = new Plottable.Scale.Linear();
        scale.domain(domain).range(range);
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 1, 100);
        assert.deepEqual(translatedDomain, [0, 100], "domain magnified by correct amount");
      });

      it("magnify on 0",() => {
        var domain = [0, 100];
        var range = [0, 200];
        var scale = new Plottable.Scale.Linear();
        scale.domain(domain).range(range);
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 0, 100);
        assert.deepEqual(translatedDomain, [50, 50], "domain magnified by correct amount");
      });

    });

    describe("centerValue pixel space", () => {

      it("magnify on arbitrary value at halfway value",() => {
        var domain = [0, 100];
        var range = [0, 200];
        var scale = new Plottable.Scale.Linear();
        scale.domain(domain).range(range);
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 0.90, 100);
        assert.deepEqual(translatedDomain, [5, 95], "domain magnified and correctly centered");
      });

      it("magnify on arbitrary value at left edge value",() => {
        var domain = [0, 100];
        var range = [0, 200];
        var scale = new Plottable.Scale.Linear();
        scale.domain(domain).range(range);
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 0.90, 0);
        assert.deepEqual(translatedDomain, [0, 90], "domain magnified and correctly centered");
      });

      it("magnify on arbitrary value at right edge value",() => {
        var domain = [0, 100];
        var range = [0, 200];
        var scale = new Plottable.Scale.Linear();
        scale.domain(domain).range(range);
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 0.90, 200);
        assert.deepEqual(translatedDomain, [10, 100], "domain magnified and correctly centered");
      });

    });

    describe("centerValue data space", () => {

      it("magnify on arbitrary value at halfway data value", () => {
        var domain = [0, 100];
        var range = [0, 200];
        var scale = new Plottable.Scale.Linear();
        scale.domain(domain).range(range);
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 0.90, 50, true);
        assert.deepEqual(translatedDomain, [5, 95], "domain magnified and correctly centered");
      });

    });

  });
});
