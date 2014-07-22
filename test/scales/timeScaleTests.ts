///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("TimeScale tests", () => {
	it("parses reasonable formats for dates", () => {
		var scale = new Plottable.Scale.Time();
		var firstDate = new Date(2014, 9, 1, 0, 0, 0, 0).valueOf();
		var secondDate = new Date(2014, 10, 1, 0, 0, 0).valueOf();

		function checkDomain(domain: any[]) {
			scale.domain(domain);
			var time1 = scale.domain()[0].valueOf();
			assert.equal(time1, firstDate, "first value of domain set correctly");
			var time2 = scale.domain()[1].valueOf();
			assert.equal(time2, secondDate, "first value of domain set correctly");
		}
		checkDomain(["10/1/2014", "11/1/2014"]);
		checkDomain(["October 1, 2014", "November 1, 2014"]);
		checkDomain(["Oct 1, 2014", "Nov 1, 2014"]);

	});

	it("tickInterval produces correct number of ticks", () => {
		var scale = new Plottable.Scale.Time();
		// 100 year span
		scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2100, 0, 1, 0, 0, 0, 0)]);
		var ticks = scale.tickInterval(d3.time.year);
		assert.equal(ticks.length, 101, "generated correct number of ticks");
		// 1 year span
		scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 11, 31, 0, 0, 0, 0)]);
		ticks = scale.tickInterval(d3.time.month);
		assert.equal(ticks.length, 12, "generated correct number of ticks");
		ticks = scale.tickInterval(d3.time.month, 3);
		assert.equal(ticks.length, 4, "generated correct number of ticks");
		// 1 month span
		scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 1, 1, 0, 0, 0, 0)]);
		ticks = scale.tickInterval(d3.time.day);
		assert.equal(ticks.length, 32, "generated correct number of ticks");
		// 1 day span
		scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 23, 0, 0, 0)]);
		ticks = scale.tickInterval(d3.time.hour);
		assert.equal(ticks.length, 24, "generated correct number of ticks");
		// 1 hour span
		scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 1, 0, 0, 0)]);
		ticks = scale.tickInterval(d3.time.minute);
		assert.equal(ticks.length, 61, "generated correct number of ticks");
		ticks = scale.tickInterval(d3.time.minute, 10);
		assert.equal(ticks.length, 7, "generated correct number of ticks");
		// 1 minute span
		scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 1, 0, 0)]);
		ticks = scale.tickInterval(d3.time.second);
		assert.equal(ticks.length, 61, "generated correct number of ticks");
	});
});