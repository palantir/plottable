///<reference path="testReference.ts" />

interface Window {
  PHANTOMJS: boolean;
  Pixel_CloseTo_Requirement: number;
}

/* tslint:disable:no-unused-variable */
const assert = chai.assert;
/* tslint:enable:no-unused-variable */

before(() => {
  // Set the render policy to immediate to make sure ETE tests can check DOM change immediately
  Plottable.RenderController.renderPolicy("immediate");
  // Taken from https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
  let isFirefox = navigator.userAgent.indexOf("Firefox") !== -1;
  if (window.PHANTOMJS) {
    window.Pixel_CloseTo_Requirement = 2;
    // HACKHACK https://github.com/ariya/phantomjs/issues/13280
    (<any>Plottable.Utils.Set.prototype)._updateSize = function() {
      this.size = (<any>this)._values.length;
    };
  } else if (isFirefox) {
    // HACKHACK #2122
    window.Pixel_CloseTo_Requirement = 2;
  } else {
    window.Pixel_CloseTo_Requirement = 0.5;
  }
});

after(() => {
  let mocha = d3.select("#mocha-report");
  if (mocha.node() != null) {
    let suites = mocha.selectAll(".suite");
    for (let i = 0; i < suites[0].length; i++) {
      let curSuite = d3.select(suites[0][i]);
      assert(curSuite.selectAll("ul").selectAll("svg").node() === null, "all svgs have been removed");
    }
  } else {
    assert(d3.select("body").selectAll("svg").node() === null, "all svgs have been removed");
  }
});
