///<reference path="testReference.ts" />

var assert = chai.assert;

function assertComponentXY(component: Component, x: number, y: number, message: string) {
    // use <any> to examine the private variables
    var xOffset = (<any> component).xOffset;
    var yOffset = (<any> component).yOffset;
    assert.equal(xOffset, x, message);
    assert.equal(yOffset, y, message);
}

describe("Component behavior", () => {
  it("fixed-width component will align to the right spot", () => {
    var svg = generateSVG("300", "300");
    var component = new Component();
    component.rowMinimum(100).colMinimum(100);
    component.anchor(svg);
    component.computeLayout();
    assertComponentXY(component, 0, 0, "top-left component aligns correctly");

    component.xAlignment = "CENTER";
    component.yAlignment = "CENTER";
    component.computeLayout();
    assertComponentXY(component, 100, 100, "center component aligns correctly");

    component.xAlignment = "RIGHT";
    component.yAlignment = "BOTTOM";
    component.computeLayout();
    assertComponentXY(component, 200, 200, "bottom-right component aligns correctly");
    svg.remove();
  });

  it("component defaults are as expected", () => {
    var c = new Component();
    assert.equal(c.rowMinimum(), 0, "rowMinimum defaults to 0");
    assert.equal(c.rowWeight() , 0, "rowWeight defaults to 0");
    assert.equal(c.colMinimum(), 0, "colMinimum defaults to 0");
    assert.equal(c.colWeight() , 0, "colWeight defaults to 0");
    assert.equal(c.xAlignment, "LEFT", "xAlignment defaults to LEFT");
    assert.equal(c.yAlignment, "TOP" , "yAlignment defaults to TOP");
  });

});
