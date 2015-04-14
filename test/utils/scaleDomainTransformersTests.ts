///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("ScaleDomainTransformers", () => {

  describe("translate", () => {

    it("translation by positive value", ()=> {
      var domain = [0, 100];
      var range = [0, 200];
      var scale = new Plottable.Scale.Linear();
      scale.domain(domain).range(range);
      var translatedDomain = Plottable.ScaleDomainTransformers.translate(scale, 10);
      assert.deepEqual(translatedDomain, [5, 105], "domain translated by positive amount");
    });

    it("translation by 0", ()=> {
      var domain = [0, 100];
      var range = [0, 200];
      var scale = new Plottable.Scale.Linear();
      scale.domain(domain).range(range);
      var translatedDomain = Plottable.ScaleDomainTransformers.translate(scale, 0);
      assert.deepEqual(translatedDomain, [0, 100], "domain remains constant");
    });

    it("translation by negative value", ()=> {
      var domain = [0, 100];
      var range = [0, 200];
      var scale = new Plottable.Scale.Linear();
      scale.domain(domain).range(range);
      var translatedDomain = Plottable.ScaleDomainTransformers.translate(scale, -10);
      assert.deepEqual(translatedDomain, [-5, 95], "domain translated by negative amount");
    });

  });

  describe("magnify", () => {

    describe("magnifyAmount", () => {

      it("magnifies by normal value",() => {
        var domain = [0, 100];
        var range = [0, 200];
        var scale = new Plottable.Scale.Linear();
        scale.domain(domain).range(range);
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 0.5, 100);
        assert.deepEqual(translatedDomain, [25, 75], "domain magnified by correct amount");
      });

      it("magnifies by 1",() => {
        var domain = [0, 100];
        var range = [0, 200];
        var scale = new Plottable.Scale.Linear();
        scale.domain(domain).range(range);
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 1, 100);
        assert.deepEqual(translatedDomain, [0, 100], "domain remains constant");
      });

      it("magnify on 0",() => {
        var domain = [0, 100];
        var range = [0, 200];
        var scale = new Plottable.Scale.Linear();
        scale.domain(domain).range(range);
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 0, 100);
        assert.deepEqual(translatedDomain, [50, 50], "domain magnified by correct amount");
      });

      it("magnify on negative value",() => {
        var domain = [0, 100];
        var range = [0, 200];
        var scale = new Plottable.Scale.Linear();
        scale.domain(domain).range(range);
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, -1, 100);
        assert.deepEqual(translatedDomain, [100, 0], "domain reverses on negative magnification");
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

      it("magnify on arbitrary value beyond range value",() => {
        var domain = [0, 100];
        var range = [0, 200];
        var scale = new Plottable.Scale.Linear();
        scale.domain(domain).range(range);
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 0.90, 300);
        assert.deepEqual(translatedDomain, [15, 105], "domain magnified and correctly centered");
      });

    });

  });
});
