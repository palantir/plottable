///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("TimeScale tests", () => {
	it("parses reasonable formats for dates", () => {
		var scale = new Plottable.Scale.Time();
		var firstDate = new Date(2014, 9, 1, 0, 0, 0, 0).valueOf();
		var secondDate = new Date(2014, 10, 1, 0, 0, 0).valueOf();

		function checkDomain(domain: any[]) {
			scale.domain(domain);
			assert.equal(scale.domain()[0].valueOf(), firstDate, "first value of domain set correctly");
			assert.equal(scale.domain()[1].valueOf(), secondDate, "first value of domain set correctly");
		}
		checkDomain(["10/1/2014", "11/1/2014"]);
		checkDomain(["October 1, 2014", "November 1, 2014"]);
		checkDomain(["2014-10-01", "2014-11-01"]);
		checkDomain(["Oct 1, 2014", "Nov 1, 2014"]);

	});

	it("tickInterval produces correct number of ticks", () => {
		var scale = new Plottable.Scale.Time();
		// 100 year span
		scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2100, 0, 1, 0, 0, 0, 0)]);
		var ticks = scale.tickInterval(d3.time.year);
		assert.equal(ticks.length, 100, "generated correct number of ticks");
		// 1 year span
		scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 11, 31, 0, 0, 0, 0)]);
		ticks = scale.tickInterval(d3.time.month);
		assert.equal(ticks.length, 12, "generated correct number of ticks");
		ticks = scale.tickInterval(d3.time.month, 3);
		assert.equal(ticks.length, 4, "generated correct number of ticks");
		// 1 month span
		scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 1, 1, 0, 0, 0, 0)]);
		ticks = scale.tickInterval(d3.time.day);
		assert.equal(ticks.length, 31, "generated correct number of ticks");
		// 1 day span
		scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 23, 0, 0, 0)]);
		ticks = scale.tickInterval(d3.time.hour);
		assert.equal(ticks.length, 12, "generated correct number of ticks");
		// 1 hour span
		scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 1, 0, 0, 0)]);
		ticks = scale.tickInterval(d3.time.minute);
		assert.equal(ticks.length, 60, "generated correct number of ticks");
		ticks = scale.tickInterval(d3.time.minute, 10);
		assert.equal(ticks.length, 6, "generated correct number of ticks");
		// 1 minute span
		scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 1, 0, 0)]);
		ticks = scale.tickInterval(d3.time.second);
		assert.equal(ticks.length, 60, "generated correct number of ticks");
	});
});