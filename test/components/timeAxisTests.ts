///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("TimeAxis", () => {
    it("can not initialize vertical time axis", () => {
        var scale = new Plottable.Scale.Time();
        assert.throws(() => new Plottable.Axis.Time(scale, "left"), "unsupported");
    });

    it("can not initialize with non-time-scale axis", () => {
        var scale = new Plottable.Scale.Numeric();
        assert.throws(() => new Plottable.Axis.Time(scale, "bottom"), "unsupported");
    });

    it("major and minor intervals are the same length", () => {
        assert.equals(Time.majorIntervals.length, Time.minorIntervals.length,
                "major and minor interval arrays must be same size");
    });
});
