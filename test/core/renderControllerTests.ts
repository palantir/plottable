///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("RenderController", () => {
  it("Components whose render() is triggered by another Component's render() will be drawn", () => {
    var link1 = new Plottable.Component();
    var svg1 = TestMethods.generateSVG();
    link1.anchor(svg1).computeLayout();
    var link2 = new Plottable.Component();
    var svg2 = TestMethods.generateSVG();
    link2.anchor(svg2).computeLayout();

    (<any> link1)._render = () => link2.render();
    var link2Rendered = false;
    (<any> link2)._render = () => link2Rendered = true;

    link1.render();
    assert.isTrue(link2Rendered, "dependent Component was render()-ed");

    svg1.remove();
    svg2.remove();
  });
});
