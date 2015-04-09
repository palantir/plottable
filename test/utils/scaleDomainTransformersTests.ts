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
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 0.50);
        assert.deepEqual(translatedDomain, [25, 75], "domain magnified by correct amount");
      });

      it("magnify on 1",() => {
        var domain = [0, 100];
        var range = [0, 200];
        var scale = new Plottable.Scale.Linear();
        scale.domain(domain).range(range);
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 1);
        assert.deepEqual(translatedDomain, [0, 100], "domain magnified by correct amount");
      });

      it("magnify on 0",() => {
        var domain = [0, 100];
        var range = [0, 200];
        var scale = new Plottable.Scale.Linear();
        scale.domain(domain).range(range);
        var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 0);
        assert.deepEqual(translatedDomain, [50, 50], "domain magnified by correct amount");
      });

    });

  });
});
