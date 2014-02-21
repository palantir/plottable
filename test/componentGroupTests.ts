///<reference path="testReference.ts" />

var assert = chai.assert;

describe("ComponentGroups", () => {
  it("components in componentGroups overlap", () => {
    var c1 = new Component().rowMinimum(10).colMinimum(10);
    var c2 = new Component().rowWeight(1).colWeight(1);
    var c3 = new Component().rowWeight(3).colWeight(3);

    var cg = new ComponentGroup([c1, c2, c3]);
    var svg = generateSVG(400, 400);
    cg.anchor(svg);
    (<any> c1).addBox("test-box1");
    (<any> c2).addBox("test-box2");
    (<any> c3).addBox("test-box3");
    cg.computeLayout().render();
    var t1 = svg.select(".test-box1");
    var t2 = svg.select(".test-box2");
    var t3 = svg.select(".test-box3");
    assertWidthHeight(t1, 10, 10, "rect1 sized correctly");
    assertWidthHeight(t2, 400, 400, "rect2 sized correctly");
    assertWidthHeight(t3, 400, 400, "rect3 sized correctly");
    svg.remove();
  });
});
