///<reference path="../lib/chai/chai.d.ts" />
///<reference path="../lib/chai/chai-assert.d.ts" />
///<reference path="../lib/mocha/mocha.d.ts" />
///<reference path="../lib/d3.d.ts" />

///<reference path="../src/axis.ts" />
///<reference path="../src/table.ts" />
///<reference path="../src/renderer.ts" />
///<reference path="../src/utils.ts" />
///<reference path="testUtils.ts" />

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
    })
})
