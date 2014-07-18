///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("TimeAxis", () => {
    it("can not initialize vertical time axis", () => {
        var scale = new Plottable.Scale.Time();
        assert.throws(() => new Plottable.Axis.Time(scale, "left"), "unsupported");
        assert.throws(() => new Plottable.Axis.Time(scale, "right"), "unsupported");
    });

    it("major and minor intervals are the same length", () => {
        assert.equal(Plottable.Axis.Time.majorIntervals.length, Plottable.Axis.Time.minorIntervals.length,
                "major and minor interval arrays must be same size");
    });
});
