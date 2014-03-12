///<reference path="testReference.ts" />

var assert = chai.assert;

describe("ComponentGroups", () => {
  it("components in componentGroups overlap", () => {
    var c1 = new Plottable.Component().rowMinimum(10).colMinimum(10);
    var c2 = new Plottable.Component();
    var c3 = new Plottable.Component();

    var cg = new Plottable.ComponentGroup([c1, c2, c3]);
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
    var c1 = new Plottable.Component().rowMinimum(10).colMinimum(10);
    var c2 = new Plottable.Component().rowMinimum(20).colMinimum(20);
    var c3 = new Plottable.Component();

    var cg = new Plottable.ComponentGroup([c1]);
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

  it("component fixity is computed appropriately", () => {
    var cg = new Plottable.ComponentGroup();
    var c1 = new Plottable.Component();
    c1.fixedHeightVal = false;
    c1.fixedWidthVal  = false;
    var c2 = new Plottable.Component();
    c2.fixedHeightVal = false;
    c2.fixedWidthVal  = false;

    cg.addComponent(c1).addComponent(c2);
    assert.isFalse(cg.isFixedHeight(), "height not fixed when both components unfixed");
    assert.isFalse(cg.isFixedWidth(), "width not fixed when both components unfixed");

    c1.fixedHeightVal = true;
    c1.fixedWidthVal = true;

    assert.isFalse(cg.isFixedHeight(), "height not fixed when one component unfixed");
    assert.isFalse(cg.isFixedWidth(), "width not fixed when one component unfixed");

    c2.fixedHeightVal = true;
    assert.isTrue(cg.isFixedHeight(), "height fixed when both components fixed");
    assert.isFalse(cg.isFixedWidth(), "width unfixed when one component unfixed");
  });

  it("componentGroup subcomponents have xOffset, yOffset of 0", () => {
    var cg = new Plottable.ComponentGroup();
    var c1 = new Plottable.Component();
    c1.fixedHeightVal = false;
    c1.fixedWidthVal  = false;
    var c2 = new Plottable.Component();
    c2.fixedHeightVal = false;
    c2.fixedWidthVal  = false;
    cg.addComponent(c1).addComponent(c2);

    var svg = generateSVG();
    cg.anchor(svg);
    cg.computeLayout(50, 50, 350, 350);

    var cgTranslate = d3.transform(cg.element.attr("transform")).translate;
    var c1Translate = d3.transform(c1.element.attr("transform")).translate;
    var c2Translate = d3.transform(c2.element.attr("transform")).translate;
    assert.equal(cgTranslate[0], 50, "componentGroup has 50 xOffset");
    assert.equal(cgTranslate[1], 50, "componentGroup has 50 yOffset");
    assert.equal(c1Translate[0], 0, "componentGroup has 0 xOffset");
    assert.equal(c1Translate[1], 0, "componentGroup has 0 yOffset");
    assert.equal(c2Translate[0], 0, "componentGroup has 0 xOffset");
    assert.equal(c2Translate[1], 0, "componentGroup has 0 yOffset");
    svg.remove();
    });
});
