///<reference path="../testReference.ts" />

describe("Utils.DOM", () => {

  it("getBBox works properly", () => {
    let svg = TestMethods.generateSVG();
    let expectedBox: { [key: string]: number } = {
      x: 0,
      y: 0,
      width: 40,
      height: 20
    };
    let rect = svg.append("rect").attr(expectedBox);
    let measuredBox = Plottable.Utils.DOM.elementBBox(rect);
    assert.deepEqual(measuredBox, expectedBox, "getBBox measures correctly");
    svg.remove();
  });

  it("getBBox does not fail on disconnected and display:none nodes", () => {
    let expectedBox: { [key: string]: number } = {
      x: 0,
      y: 0,
      width: 40,
      height: 20
    };

    let removedSVG = TestMethods.generateSVG().remove();
    let rect = removedSVG.append("rect").attr(expectedBox);
    Plottable.Utils.DOM.elementBBox(rect); // could throw NS_ERROR on FF

    let noneSVG = TestMethods.generateSVG().style("display", "none");
    rect = noneSVG.append("rect").attr(expectedBox);
    Plottable.Utils.DOM.elementBBox(rect); // could throw NS_ERROR on FF

    noneSVG.remove();
  });

  describe("elementWidth(), elementHeight()", () => {
    it("can get a plain element's size", () => {
      let parent = TestMethods.getSVGParent();
      parent.style("width", "300px");
      parent.style("height", "200px");
      let parentElem = <Element> parent[0][0];

      let width = Plottable.Utils.DOM.elementWidth(parentElem);
      assert.strictEqual(width, 300, "measured width matches set width");
      let height = Plottable.Utils.DOM.elementHeight(parentElem);
      assert.strictEqual(height, 200, "measured height matches set height");
    });

    it("can get the svg's size", () => {
      let svg = TestMethods.generateSVG(450, 120);
      let svgElem = <Element> svg[0][0];

      let width = Plottable.Utils.DOM.elementWidth(svgElem);
      assert.strictEqual(width, 450, "measured width matches set width");
      let height = Plottable.Utils.DOM.elementHeight(svgElem);
      assert.strictEqual(height, 120, "measured height matches set height");
      svg.remove();
    });

    it("can accept multiple units and convert to pixels", () => {
      let parent = TestMethods.getSVGParent();
      let parentElem = <Element> parent[0][0];
      let child = parent.append("div");
      let childElem = <Element> child[0][0];

      parent.style("width", "200px");
      parent.style("height", "50px");
      assert.strictEqual(Plottable.Utils.DOM.elementWidth(parentElem), 200, "width is correct");
      assert.strictEqual(Plottable.Utils.DOM.elementHeight(parentElem), 50, "height is correct");

      child.style("width", "20px");
      child.style("height", "10px");
      assert.strictEqual(Plottable.Utils.DOM.elementWidth(childElem), 20, "width is correct");
      assert.strictEqual(Plottable.Utils.DOM.elementHeight(childElem), 10, "height is correct");

      child.style("width", "100%");
      child.style("height", "100%");
      assert.strictEqual(Plottable.Utils.DOM.elementWidth(childElem), 200, "width is correct");
      assert.strictEqual(Plottable.Utils.DOM.elementHeight(childElem), 50, "height is correct");

      child.style("width", "50%");
      child.style("height", "50%");
      assert.strictEqual(Plottable.Utils.DOM.elementWidth(childElem), 100, "width is correct");
      assert.strictEqual(Plottable.Utils.DOM.elementHeight(childElem), 25, "height is correct");

      // reset test page DOM
      parent.style("width", "auto");
      parent.style("height", "auto");
      child.remove();
    });

    it("generateUniqueClipPathId()", () => {
      let firstClipPathId = Plottable.Utils.DOM.generateUniqueClipPathId();
      let secondClipPathId = Plottable.Utils.DOM.generateUniqueClipPathId();

      let firstClipPathIDPrefix = firstClipPathId.split(/\d/)[0];
      let secondClipPathIDPrefix = secondClipPathId.split(/\d/)[0];

      assert.strictEqual(firstClipPathIDPrefix, secondClipPathIDPrefix,
        "clip path ids should have the same prefix");

      let prefix = firstClipPathIDPrefix;

      assert.isTrue(/plottable/.test(prefix),
        "the prefix should contain the word plottable to avoid collisions");

      let firstClipPathIdNumber = +firstClipPathId.replace(prefix, "");
      let secondClipPathIdNumber = +secondClipPathId.replace(prefix, "");

      assert.isFalse(Plottable.Utils.Math.isNaN(firstClipPathIdNumber),
        "first clip path id should only have a number after the prefix");
      assert.isFalse(Plottable.Utils.Math.isNaN(secondClipPathIdNumber),
        "second clip path id should only have a number after the prefix");

      assert.strictEqual(firstClipPathIdNumber + 1, secondClipPathIdNumber,
        "Consecutive calls to generateUniqueClipPathId should give consecutive numbers after the prefix");
    });
  });
});
