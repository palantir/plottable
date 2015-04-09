///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Formatters", () => {

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
    it("magnify on arbitrary value", ()=> {
      var domain = [0, 100];
      var range = [0, 200];
      var scale = new Plottable.Scale.Linear();
      scale.domain(domain).range(range);
      var translatedDomain = Plottable.ScaleDomainTransformers.magnify(scale, 0.90, 100);
      assert.deepEqual(translatedDomain, [5, 95], "domain magnified by correct amount");
    });
  });
});
