///<reference path="testReference.ts" />

var assert = chai.assert;

describe("ComponentGroups", () => {
  it("components in componentGroups overlap", () => {
    var c1 = new Component().rowMinimum(10).colMinimum(10);
    var c2 = new Component();
    var c3 = new Component();

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
  it("components can be added before and after anchoring", () => {
    var c1 = new Component().rowMinimum(10).colMinimum(10);
    var c2 = new Component().rowMinimum(20).colMinimum(20);
    var c3 = new Component();

    var cg = new ComponentGroup([c1]);
    var svg = generateSVG(400, 400);
    cg.addComponent(c2).anchor(svg);
    (<any> c1).addBox("test-box1");
    (<any> c2).addBox("test-box2");
    cg.computeLayout().render();
    var t1 = svg.select(".test-box1");
    var t2 = svg.select(".test-box2");
    assertWidthHeight(t1, 10, 10, "rect1 sized correctly");
    assertWidthHeight(t2, 20, 20, "rect2 sized correctly");
    cg.addComponent(c3);
    (<any> c3).addBox("test-box3");
    cg.computeLayout().render();
    var t3 = svg.select(".test-box3");
    assertWidthHeight(t3, 400, 400, "rect3 sized correctly");
    svg.remove();
  });
});
