///<reference path="testReference.ts" />

var assert = chai.assert;


describe("ComponentGroups", () => {
  it("components in componentGroups overlap", () => {
    var c1 = new Plottable.Component().minimumHeight(10).minimumWidth(10);
    var c2 = new Plottable.Component();
    var c3 = new Plottable.Component();

    var cg = new Plottable.ComponentGroup([c1, c2, c3]);
    var svg = generateSVG(400, 400);
    cg._anchor(svg);
    (<any> c1).addBox("test-box1");
    (<any> c2).addBox("test-box2");
    (<any> c3).addBox("test-box3");
    cg._computeLayout()._render();
    var t1 = svg.select(".test-box1");
    var t2 = svg.select(".test-box2");
    var t3 = svg.select(".test-box3");
    assertWidthHeight(t1, 10, 10, "rect1 sized correctly");
    assertWidthHeight(t2, 400, 400, "rect2 sized correctly");
    assertWidthHeight(t3, 400, 400, "rect3 sized correctly");
    svg.remove();
  });

  it("components can be added before and after anchoring", () => {
    var c1 = new Plottable.Component().minimumHeight(10).minimumWidth(10);
    var c2 = new Plottable.Component().minimumHeight(20).minimumWidth(20);
    var c3 = new Plottable.Component();

    var cg = new Plottable.ComponentGroup([c1]);
    var svg = generateSVG(400, 400);
    cg.merge(c2)._anchor(svg);
    (<any> c1).addBox("test-box1");
    (<any> c2).addBox("test-box2");
    cg._computeLayout()._render();
    var t1 = svg.select(".test-box1");
    var t2 = svg.select(".test-box2");
    assertWidthHeight(t1, 10, 10, "rect1 sized correctly");
    assertWidthHeight(t2, 20, 20, "rect2 sized correctly");
    cg.merge(c3);
    (<any> c3).addBox("test-box3");
    cg._computeLayout()._render();
    var t3 = svg.select(".test-box3");
    assertWidthHeight(t3, 400, 400, "rect3 sized correctly");
    svg.remove();
  });

  it("component fixity is computed appropriately", () => {
    var cg = new Plottable.ComponentGroup();
    var c1 = new Plottable.Component();
    c1._fixedHeight = false;
    c1._fixedWidth  = false;
    var c2 = new Plottable.Component();
    c2._fixedHeight = false;
    c2._fixedWidth  = false;

    cg.merge(c1).merge(c2);
    assert.isFalse(cg.isFixedHeight(), "height not fixed when both components unfixed");
    assert.isFalse(cg.isFixedWidth(), "width not fixed when both components unfixed");

    c1._fixedHeight = true;
    c1._fixedWidth = true;

    assert.isFalse(cg.isFixedHeight(), "height not fixed when one component unfixed");
    assert.isFalse(cg.isFixedWidth(), "width not fixed when one component unfixed");

    c2._fixedHeight = true;
    assert.isTrue(cg.isFixedHeight(), "height fixed when both components fixed");
    assert.isFalse(cg.isFixedWidth(), "width unfixed when one component unfixed");
  });

  it("componentGroup subcomponents have xOffset, yOffset of 0", () => {
    var cg = new Plottable.ComponentGroup();
    var c1 = new Plottable.Component();
    c1._fixedHeight = false;
    c1._fixedWidth  = false;
    var c2 = new Plottable.Component();
    c2._fixedHeight = false;
    c2._fixedWidth  = false;
    cg.merge(c1).merge(c2);

    var svg = generateSVG();
    cg._anchor(svg);
    cg._computeLayout(50, 50, 350, 350);

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

    describe("Component.merge works as expected", () => {
      var c1 = new Plottable.Component();
      var c2 = new Plottable.Component();
      var c3 = new Plottable.Component();
      var c4 = new Plottable.Component();

    it("Component.merge works as expected (Component.merge Component)", () => {
        var cg: Plottable.ComponentGroup = c1.merge(c2);
        var innerComponents: Plottable.Component[] = (<any> cg).components;
        assert.lengthOf(innerComponents, 2, "There are two components");
        assert.equal(innerComponents[0], c1, "first component correct");
        assert.equal(innerComponents[1], c2, "second component correct");
      });

      it("Component.merge works as expected (Component.merge ComponentGroup)", () => {
        var cg = new Plottable.ComponentGroup([c2,c3,c4]);
        var cg2 = c1.merge(cg);
        assert.equal(cg, cg2, "c.merge(cg) returns cg");
        var components: Plottable.Component[] = (<any> cg).components;
        assert.lengthOf(components, 4, "four components");
        assert.equal(components[0], c1, "first component in front");
        assert.equal(components[1], c2, "second component is second");
      });

      it("Component.merge works as expected (ComponentGroup.merge Component)", () => {
        var cg = new Plottable.ComponentGroup([c1,c2,c3]);
        var cg2 = cg.merge(c4);
        assert.equal(cg, cg2, "cg.merge(c) returns cg");
        var components: Plottable.Component[] = (<any> cg).components;
        assert.lengthOf(components, 4, "there are four components");
        assert.equal(components[0], c1, "first is first");
        assert.equal(components[3], c4, "fourth is fourth");
        });

      it("Component.merge works as expected (ComponentGroup.merge ComponentGroup)", () => {
        var cg1 = new Plottable.ComponentGroup([c1,c2]);
        var cg2 = new Plottable.ComponentGroup([c3,c4]);
        var cg = cg1.merge(cg2);
        assert.equal(cg, cg1, "merged == cg1");
        assert.notEqual(cg, cg2, "merged != cg2");
        var components: Plottable.Component[] = (<any> cg).components;
        assert.lengthOf(components, 3, "there are three inner components");
        assert.equal(components[0], c1, "components are inside");
        assert.equal(components[1], c2, "components are inside");
        assert.equal(components[2], cg2, "componentGroup2 inside componentGroup1");
      });
    });
});
