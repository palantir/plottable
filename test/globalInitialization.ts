///<reference path="testReference.ts" />

interface Window {
  PHANTOMJS: boolean;
  Pixel_CloseTo_Requirement: number;
}

before(() => {
  // Set the render policy to immediate to make sure ETE tests can check DOM change immediately
  Plottable.Core.RenderController.setRenderPolicy("immediate");
  window.Pixel_CloseTo_Requirement = window.PHANTOMJS ? 2 : 0.5;
});

after(() => {
	var parent: D3.Selection = getSVGParent();
	var mocha = d3.select("#mocha-report");
	if (mocha.node() != null) {
		var suites = mocha.selectAll(".suite");
		for (var i = 0; i < suites[0].length; i++) {
			var curSuite = d3.select(suites[0][i]);
			assert(curSuite.selectAll("ul").selectAll("svg").node() === null, "all svgs have been removed");
		}
	} else {
		assert(d3.select("body").selectAll("svg").node() === null, "all svgs have been removed");
	}
});
