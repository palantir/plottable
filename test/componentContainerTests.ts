///<reference path="testReference.ts" />

var assert = chai.assert;


describe("ComponentContainer", () => {

  it("_addComponent()", () => {
    var container = new Plottable.Abstract.ComponentContainer();
    var c1 = new Plottable.Abstract.Component();
    var c2 = new Plottable.Abstract.Component();
    var c3 = new Plottable.Abstract.Component();

    assert.isTrue(container._addComponent(c1), "returns true on successful adding");
    assert.deepEqual(container.components(), [c1], "component was added");

    container._addComponent(c2);
    assert.deepEqual(container.components(), [c1, c2], "can append components");

    container._addComponent(c3, true);
    assert.deepEqual(container.components(), [c3, c1, c2], "can prepend components");

    assert.isFalse(container._addComponent(null), "returns false for null arguments");
    assert.deepEqual(container.components(), [c3, c1, c2], "component list was unchanged");

    assert.isFalse(container._addComponent(c1), "returns false if adding an already-added component");
    assert.deepEqual(container.components(), [c3, c1, c2], "component list was unchanged");
  });

  it("_removeComponent()", () => {
    var container = new Plottable.Abstract.ComponentContainer();
    var c1 = new Plottable.Abstract.Component();
    var c2 = new Plottable.Abstract.Component();
    container._addComponent(c1);
    container._addComponent(c2);

    container._removeComponent(c2);
    assert.deepEqual(container.components(), [c1], "component 2 was removed");

    container._removeComponent(c2);
    assert.deepEqual(container.components(), [c1],
      "there are no side effects from removing already-removed components");
  });

  it("empty()", () => {
    var container = new Plottable.Abstract.ComponentContainer();
    assert.isTrue(container.empty());
    var c1 = new Plottable.Abstract.Component();
    container._addComponent(c1);
    assert.isFalse(container.empty());
  });

  it("removeAll()", () => {
    var container = new Plottable.Abstract.ComponentContainer();
    var c1 = new Plottable.Abstract.Component();
    var c2 = new Plottable.Abstract.Component();
    container._addComponent(c1);
    container._addComponent(c2);
    container.removeAll();

    assert.deepEqual(container.components(), [], "all components were removed");
  });

  it("components() returns a shallow copy", () => {
    var container = new Plottable.Abstract.ComponentContainer();
    var c1 = new Plottable.Abstract.Component();
    var c2 = new Plottable.Abstract.Component();
    container._addComponent(c1);
    container._addComponent(c2);

    var componentList = container.components();
    componentList.pop();
    assert.deepEqual(container.components(), [c1, c2], "internal list of components was not changed");
  });
});
