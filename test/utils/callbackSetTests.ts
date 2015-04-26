///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("CallbackSet", () => {
  it("add()", () => {
    var callbackSet = new Plottable.Utils.CallbackSet();

    var cb1 = () => "one";
    callbackSet.add(cb1);
    var assignedCallbacks = callbackSet.values();
    assert.lengthOf(assignedCallbacks, 1, "set contains one callback");
    assert.strictEqual(assignedCallbacks[0], cb1, "the callback was added to the list");

    callbackSet.add(cb1);
    assignedCallbacks = callbackSet.values();
    assert.lengthOf(assignedCallbacks, 1, "same callback is not added twice");
    assert.strictEqual(assignedCallbacks[0], cb1, "list still contains the callback");

    var cb2 = () => "two";
    callbackSet.add(cb2);
    assignedCallbacks = callbackSet.values();
    assert.lengthOf(assignedCallbacks, 2, "set now contains two callbacks");
    assert.strictEqual(assignedCallbacks[0], cb1, "set contains callback 1");
    assert.strictEqual(assignedCallbacks[1], cb2, "set contains callback 2");
  });

  it("remove()", () => {
    var callbackSet = new Plottable.Utils.CallbackSet();

    var cb1 = () => "one";
    callbackSet.add(cb1);
    assert.lengthOf(callbackSet.values(), 1, "set contains one callback after adding");
    callbackSet.remove(cb1);
    assert.lengthOf(callbackSet.values(), 0, "callback was removed");

    callbackSet.add(cb1);
    var cb2 = () => "two";
    callbackSet.remove(cb2);
    assert.lengthOf(callbackSet.values(), 1, "removing a non-existent value does nothing");
  });

  it("callCallbacks()", () => {
    var expectedS = "Plottable";
    var expectedI = 1;

    var cb1called = false;
    var cb1 = (s: string, i: number) => {
      assert.strictEqual(s, expectedS, "was passed the correct first argument");
      assert.strictEqual(i, expectedI, "was passed the correct second argument");
      cb1called = true;
    };
    var cb2called = false;
    var cb2 = (s: string, i: number) => {
      assert.strictEqual(s, expectedS, "was passed the correct first argument");
      assert.strictEqual(i, expectedI, "was passed the correct second argument");
      cb2called = true;
    };

    var callbackSet = new Plottable.Utils.CallbackSet<(s: string, i: number) => any>();
    callbackSet.add(cb1);
    callbackSet.add(cb2);

    callbackSet.callCallbacks(expectedS, expectedI);
    assert.isTrue(cb1called, "callback 1 was called");
    assert.isTrue(cb2called, "callback 2 was called");
  });
});
