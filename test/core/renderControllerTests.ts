///<reference path="../testReference.ts" />

describe("RenderController", () => {
  // HACKHACK: #2083
  it.skip("Components whose render() is triggered by another Component's render() will be drawn", () => {
    const link1 = new Plottable.Component();
    const svg1 = TestMethods.generateSVG();
    link1.anchor(svg1).computeLayout();
    const link2 = new Plottable.Component();
    const svg2 = TestMethods.generateSVG();
    link2.anchor(svg2).computeLayout();

    (<any> link1).renderImmediately = () => link2.render();
    let link2Rendered = false;
    (<any> link2).renderImmediately = () => link2Rendered = true;

    link1.render();
    assert.isTrue(link2Rendered, "dependent Component was render()-ed");

    svg1.remove();
    svg2.remove();
  });
});
