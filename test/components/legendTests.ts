///<reference path="../testReference.ts" />

var assert = chai.assert;


describe("Legends", () => {
  var svg: D3.Selection;
  var color: Plottable.Scale.Color;
  var legend: Plottable.Component.Legend;

  beforeEach(() => {
    svg = generateSVG(400, 400);
    color = new Plottable.Scale.Color("Category10");
    legend = new Plottable.Component.Legend(color);
  });

  it("a basic legend renders", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);
    var rows = legend.content.selectAll(".legend-row");
    assert.lengthOf(rows[0], 3, "there are 3 legend entries");

    rows.each(function(d, i) {
      assert.equal(d, color.domain()[i], "the data is set properly");
      var d3this = d3.select(this);
      var text = d3this.select("text").text();
      assert.equal(text, d, "the text node has correct text");
      var circle = d3this.select("circle");
      assert.equal(circle.attr("fill"), color.scale(d), "the circle's fill is set properly");
    });
    svg.remove();
  });

  it("legend domain can be updated after initialization, and height updates as well", () => {
    legend.renderTo(svg);
    legend.scale(color);
    assert.equal(legend._requestedSpace(200, 200).height, 0, "there is no requested height when domain is empty");
    color.domain(["foo", "bar"]);
    var height1 = legend._requestedSpace(400, 400).height;
    var actualHeight1 = legend.availableHeight;
    assert.operator(height1, ">", 0, "changing the domain gives a positive height");
    color.domain(["foo", "bar", "baz"]);
    assert.operator(legend._requestedSpace(400, 400).height, ">", height1, "adding to the domain increases the height requested");
    var actualHeight2 = legend.availableHeight;
    assert.operator(actualHeight1, "<", actualHeight2, "Changing the domain caused the legend to re-layout with more height");
    var numRows = legend.content.selectAll(".legend-row")[0].length;
    assert.equal(numRows, 3, "there are 3 rows");
    svg.remove();
  });

  it("a legend with many labels does not overflow vertically", () => {
    color.domain(["alpha", "beta", "gamma", "delta", "omega", "omicron", "persei", "eight"]);
    legend.renderTo(svg);

    var contentBBox = Plottable.Util.DOM.getBBox(legend.content);
    var contentBottomEdge = contentBBox.y + contentBBox.height;
    var bboxBBox = Plottable.Util.DOM.getBBox(legend.element.select(".bounding-box"));
    var bboxBottomEdge = bboxBBox.y + bboxBBox.height;

    assert.operator(contentBottomEdge, "<=", bboxBottomEdge, "content does not extend past bounding box");
    svg.remove();
  });

  it("a legend with a long label does not overflow horizontally", () => {
    color.domain(["foooboooloonoogoorooboopoo"]);
    svg.attr("width", 100);
    legend.renderTo(svg);
    var text = legend.content.select("text").text();
    assert.notEqual(text, "foooboooloonoogoorooboopoo", "the text was truncated");
    var rightEdge = legend.content.select("text").node().getBoundingClientRect().right;
    var bbox = legend.element.select(".bounding-box");
    var rightEdgeBBox = bbox.node().getBoundingClientRect().right;
    assert.operator(rightEdge, "<=", rightEdgeBBox, "the long text did not overflow the legend");
    svg.remove();
  });

  it("calling legend.render multiple times does not add more elements", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);
    var numRows = legend.content.selectAll(".legend-row")[0].length;
    assert.equal(numRows, 3, "there are 3 legend rows initially");
    legend._render();
    numRows = legend.content.selectAll(".legend-row")[0].length;
    assert.equal(numRows, 3, "there are 3 legend rows after second render");
    svg.remove();
  });

  it("re-rendering the legend with a new domain will do the right thing", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);
    var newDomain = ["mushu", "foo", "persei", "baz", "eight"];
    color.domain(newDomain);
    // due to how joins work, this is how the elements should be arranged by d3
    var newDomainActualOrder = ["foo", "baz", "mushu", "persei", "eight"];
    legend.content.selectAll(".legend-row").each(function(d, i) {
      assert.equal(d, newDomainActualOrder[i], "the data is set correctly");
      var text = d3.select(this).select("text").text();
      assert.equal(text, d, "the text was set properly");
      var fill = d3.select(this).select("circle").attr("fill");
      assert.equal(fill, color.scale(d), "the fill was set properly");
    });
    assert.lengthOf(legend.content.selectAll(".legend-row")[0], 5, "there are the right number of legend elements");
    svg.remove();
  });

  it("legend.scale() replaces domain", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);

    var newDomain = ["a", "b", "c"];
    var newColorScale = new Plottable.Scale.Color("20");
    newColorScale.domain(newDomain);
    legend.scale(newColorScale);

    legend.content.selectAll(".legend-row").each(function(d, i) {
      assert.equal(d, newDomain[i], "the data is set correctly");
      var text = d3.select(this).select("text").text();
      assert.equal(text, d, "the text was set properly");
      var fill = d3.select(this).select("circle").attr("fill");
      assert.equal(fill, newColorScale.scale(d), "the fill was set properly");
    });

    svg.remove();
  });

  it("legend.scale() correctly reregisters listeners", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);

    var tempDomain = ["a", "b", "c"];
    var newColorScale = new Plottable.Scale.Color("20");
    newColorScale.domain(tempDomain);
    legend.scale(newColorScale);

    var newDomain = ["a", "foo", "d"];
    newColorScale.domain(newDomain);
    legend.content.selectAll(".legend-row").each(function(d, i) {
      assert.equal(d, newDomain[i], "the data is set correctly");
      var text = d3.select(this).select("text").text();
      assert.equal(text, d, "the text was set properly");
      var fill = d3.select(this).select("circle").attr("fill");
      assert.equal(fill, newColorScale.scale(d), "the fill was set properly");
    });
    svg.remove();
  });

  describe("Legend toggle tests", () => {
    var toggleLegend: Plottable.Component.Legend;

    beforeEach(() => {
      toggleLegend = new Plottable.Component.Legend(color);
      toggleLegend.toggleCallback(function(d, b) {/* no-op */});
    });

    function verifyState(selection: D3.Selection, b: boolean, msg?: string) {
      assert.equal(selection.classed("toggled-on"), b, msg);
      assert.equal(selection.classed("toggled-off"), !b, msg);
    }

    function getSelection(datum: any) {
      var selection = toggleLegend.content.selectAll(".legend-row")
        .filter((d, i) => d === datum);
      return selection;
    }

    function verifyEntry(datum: any, b: boolean, msg?: string) {
      verifyState(getSelection(datum), b, msg);
    }

    function toggleEntry(datum: any, index: number) {
      getSelection(datum).on("click")(datum, index);
    }

    it("basic initialization test", () => {
      color.domain(["a", "b", "c", "d", "e"]);
      toggleLegend.renderTo(svg);
      toggleLegend.content.selectAll(".legend-row").each(function(d, i) {
        var selection = d3.select(this);
        verifyState(selection, true);
      });
      svg.remove();
    });

    it("basic toggling test", () => {
      color.domain(["a"]);
      toggleLegend.renderTo(svg);
      toggleLegend.content.selectAll(".legend-row").each(function(d, i) {
        var selection = d3.select(this);
        selection.on("click")(d, i);
        verifyState(selection, false);
        selection.on("click")(d, i);
        verifyState(selection, true);
      });
      svg.remove();
    });

    it("scale() works as intended with toggling", () => {
      var domain = ["a", "b", "c", "d", "e"];
      color.domain(domain);
      toggleLegend.renderTo(svg);
      toggleEntry("a", 0);
      toggleEntry("d", 3);
      toggleEntry("c", 2);

      var newDomain = ["r", "a", "d", "g"];
      var newColorScale = new Plottable.Scale.Color("Category10");
      newColorScale.domain(newDomain);
      toggleLegend.scale(newColorScale);

      verifyEntry("r", true);
      verifyEntry("a", false);
      verifyEntry("g", true);
      verifyEntry("d", false);

      svg.remove();
    });

    it("listeners on scale will correctly update states", () =>  {
      color.domain(["a", "b", "c", "d", "e"]);
      toggleLegend.renderTo(svg);
      toggleEntry("a", 0);
      toggleEntry("d", 3);
      toggleEntry("c", 2);

      color.domain(["e", "d", "b", "a", "c"]);
      verifyEntry("a", false);
      verifyEntry("b", true);
      verifyEntry("c", false);
      verifyEntry("d", false);
      verifyEntry("e", true);
      svg.remove();
    });

    it("Testing callback works correctly", () =>  {
      var domain = ["a", "b", "c", "d", "e"];
      color.domain(domain);
      var state = [true, true, true, true, true];

      toggleLegend.toggleCallback((d, b) => {
        state[domain.indexOf(d)] = b;
      });
      toggleLegend.renderTo(svg);

      toggleEntry("a", 0);
      verifyEntry("a", false);
      assert.equal(state[0], false, "callback was successful");

      toggleEntry("d", 3);
      verifyEntry("d", false);
      assert.equal(state[3], false, "callback was successful");

      toggleEntry("a", 0);
      verifyEntry("a", true);
      assert.equal(state[0], true, "callback was successful");

      toggleEntry("c", 2);
      verifyEntry("c", false);
      assert.equal(state[2], false, "callback was successful");
      svg.remove();
    });

    it("Overwriting callback is successfull", () => {
      var domain = ["a"];
      color.domain(domain);
      var state = true;
      toggleLegend.renderTo(svg);

      toggleLegend.toggleCallback((d, b) => {
        state = b;
      });

      toggleEntry("a", 0);
      assert.equal(state, false, "callback was successful");

      var count = 0;
      toggleLegend.toggleCallback((d, b) => {
        count++;
      });

      toggleEntry("a", 0);
      assert.equal(state, false, "callback was overwritten");
      assert.equal(count, 1, "new callback was successfully called");
      svg.remove();
    });

    it("Removing callback is successful", () =>  {
      var domain = ["a"];
      color.domain(domain);
      var state = true;
      toggleLegend.renderTo(svg);

      toggleLegend.toggleCallback((d, b) => {
        state = b;
      });

      toggleEntry("a", 0);
      assert.equal(state, false, "callback was successful");

      toggleLegend.toggleCallback(); // this should not remove the callback
      toggleEntry("a", 0);
      assert.equal(state, true, "callback was successful");

      toggleLegend.toggleCallback(null); // this should remove the callback
      assert.throws(function() {toggleEntry("a", 0);});
      var selection = getSelection("a");
      // should have no classes
      assert.equal(selection.classed("toggled-on"), false, "is not toggled-on");
      assert.equal(selection.classed("toggled-off"), false, "is not toggled-off");

      svg.remove();
    });
  });

  describe("Legend hover tests", () => {
    var hoverLegend: Plottable.Component.Legend;

    beforeEach(() => {
      hoverLegend = new Plottable.Component.Legend(color);
      hoverLegend.hoverCallback(function(d) {/* no-op */});
    });

    function _verifyFocus(selection: D3.Selection, b: boolean, msg?: string) {
      assert.equal(selection.classed("hover"), true, msg);
      assert.equal(selection.classed("focus"), b, msg);
    }

    function _verifyEmpty(selection: D3.Selection, msg?: string) {
      assert.equal(selection.classed("hover"), false, msg);
      assert.equal(selection.classed("focus"), false, msg);
    }

    function getSelection(datum: any) {
      var selection = hoverLegend.content.selectAll(".legend-row")
        .filter((d, i) => d === datum);
      return selection;
    }

    function verifyFocus(datum: any, b: boolean, msg?: string) {
      _verifyFocus(getSelection(datum), b, msg);
    }

    function verifyEmpty(datum: string, msg?: string) {
      _verifyEmpty(getSelection(datum), msg);
    }

    function hoverEntry(datum: any, index: number) {
      getSelection(datum).on("mouseover")(datum, index);
    }

    function leaveEntry(datum: any, index: number) {
      getSelection(datum).on("mouseout")(datum, index);
    }

    it("basic initialization test", () => {
      color.domain(["a", "b", "c", "d", "e"]);
      hoverLegend.renderTo(svg);
      hoverLegend.content.selectAll(".legend-row").each(function(d, i) {
        verifyEmpty(d);
      });
      svg.remove();
    });

    it("basic hover test", () => {
      color.domain(["a"]);
      hoverLegend.renderTo(svg);
      hoverEntry("a", 0);
      verifyFocus("a", true);
      leaveEntry("a", 0);
      verifyEmpty("a");
      svg.remove();
    });

    it("scale() works as intended with hovering", () => {
      var domain = ["a", "b", "c", "d", "e"];
      color.domain(domain);
      hoverLegend.renderTo(svg);

      hoverEntry("a", 0);

      var newDomain = ["r", "a", "d", "g"];
      var newColorScale = new Plottable.Scale.Color("Category10");
      newColorScale.domain(newDomain);
      hoverLegend.scale(newColorScale);

      verifyFocus("r", false, "r");
      verifyFocus("a", true, "a");
      verifyFocus("g", false, "g");
      verifyFocus("d", false, "d");

      leaveEntry("a", 0);
      verifyEmpty("r");
      verifyEmpty("a");
      verifyEmpty("g");
      verifyEmpty("d");

      svg.remove();
    });

    it("listeners on scale will correctly update states", () =>  {
      color.domain(["a", "b", "c", "d", "e"]);
      hoverLegend.renderTo(svg);
      hoverEntry("c", 2);

      color.domain(["e", "d", "b", "a", "c"]);
      verifyFocus("a", false);
      verifyFocus("b", false);
      verifyFocus("c", true);
      verifyFocus("d", false);
      verifyFocus("e", false);
      svg.remove();
    });

    it("Testing callback works correctly", () =>  {
      var domain = ["a", "b", "c", "d", "e"];
      color.domain(domain);
      var focused: string = undefined;

      hoverLegend.hoverCallback((d) => {
        focused = d;
      });
      hoverLegend.renderTo(svg);

      hoverEntry("a", 0);
      verifyFocus("a", true);
      assert.equal(focused, "a", "callback was successful");

      leaveEntry("a", 0);
      assert.equal(focused, undefined, "callback was successful");

      hoverEntry("d", 3);
      verifyFocus("d", true);
      assert.equal(focused, "d", "callback was successful");
      svg.remove();
    });

    it("Overwriting callback is successfull", () => {
      var domain = ["a"];
      color.domain(domain);
      var focused: string = undefined;
      hoverLegend.renderTo(svg);

      hoverLegend.hoverCallback((d) => {
        focused = d;
      });

      hoverEntry("a", 0);
      assert.equal(focused, "a", "callback was successful");
      leaveEntry("a", 0);

      var count = 0;
      hoverLegend.hoverCallback((d) => {
        count++;
      });

      hoverEntry("a", 0);
      assert.equal(focused, undefined, "old callback was not called");
      assert.equal(count, 1, "new callbcak was called");
      leaveEntry("a", 0);
      assert.equal(count, 2, "new callback was called");
      svg.remove();
    });

    it("Removing callback is successful", () =>  {
      var domain = ["a"];
      color.domain(domain);
      var focused: string = undefined;
      hoverLegend.renderTo(svg);

      hoverLegend.hoverCallback((d) => {
        focused = d;
      });

      hoverEntry("a", 0);
      assert.equal(focused, "a", "callback was successful");

      hoverLegend.hoverCallback(); // this should not remove the callback
      leaveEntry("a", 0);
      assert.equal(focused, undefined, "callback was successful");

      hoverLegend.hoverCallback(null); // this should remove the callback
      assert.throws(function() {hoverEntry("a", 0);});
      verifyEmpty("a");

      svg.remove();
    });
  });
});
