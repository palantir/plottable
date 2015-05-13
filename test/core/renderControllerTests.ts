///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("RenderController", () => {
  it("Components whose render() is triggered by another Component's render() will be drawn", () => {
    var link1 = new Plottable.Component();
    var svg1 = TestMethods.generateSVG();
    var link2 = new Plottable.Component();
    var svg2 = TestMethods.generateSVG();
    link2.renderTo(svg2);

    (<any> link1)._render = () => link2.render();
    var link2Rendered = false;
    (<any> link2)._render = () => link2Rendered = true;

    link1.renderTo(svg1);
    assert.isTrue(link2Rendered, "dependent Component was eventually drawn");

    svg1.remove();
    svg2.remove();
  });
});
