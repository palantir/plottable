///<reference path="testReference.ts" />

interface Window {
  PHANTOMJS: boolean;
  Pixel_CloseTo_Requirement: number;
}

before(() => {
  // Set the render policy to immediate to make sure ETE tests can check DOM change immediately
  Plottable.Core.RenderController.setRenderPolicy("immediate");
  // Taken from https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
  var isFirefox = navigator.userAgent.indexOf("Firefox") !== -1;
  if (window.PHANTOMJS) {
    window.Pixel_CloseTo_Requirement = 2;
  } else if (isFirefox) {
    window.Pixel_CloseTo_Requirement = 1;
  } else {
    window.Pixel_CloseTo_Requirement = 0.5;
  }
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
