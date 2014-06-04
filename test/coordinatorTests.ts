///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Coordinators", () => {
  describe("ScaleDomainCoordinator", () => {
    it("domains are coordinated", () => {
      var s1 = new Plottable.Scales.Linear();
      var s2 = new Plottable.Scales.Linear();
      var s3 = new Plottable.Scales.Linear();
      var dc = new Plottable.Utils.ScaleDomainCoordinator([s1, s2, s3]);
      s1.domain([0, 100]);
      assert.deepEqual(s1.domain(), [0, 100]);
      assert.deepEqual(s1.domain(), s2.domain());
      assert.deepEqual(s1.domain(), s3.domain());

      s1.domain([-100, 5000]);
      assert.deepEqual(s1.domain(), [-100, 5000]);
      assert.deepEqual(s1.domain(), s2.domain());
      assert.deepEqual(s1.domain(), s3.domain());
    });
  });
});
