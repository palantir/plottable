///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Broadcasters", () => {
  var b: Plottable.Core.Broadcaster;
  var called: boolean;
  var cb: any;
  var listenable: Plottable.Core.Listenable = {broadcaster: null};

  beforeEach(() => {
    b = new Plottable.Core.Broadcaster(listenable);
    listenable.broadcaster = b;
    called = false;
    cb = () => {called = true;};
  });
  it("listeners are called by the broadcast method", () => {
    b.registerListener(null, cb);
    b.broadcast();
    assert.isTrue(called, "callback was called");
  });

  it("same listener can only be associated with one callback", () => {
    var called2 = false;
    var cb2 = () => {called2 = true;};
    var listener = {};
    b.registerListener(listener, cb);
    b.registerListener(listener, cb2);
    b.broadcast();
    assert.isFalse(called, "first (overwritten) callback not called");
    assert.isTrue(called2, "second callback was called");
  });

  it("listeners can be deregistered", () => {
    var listener = {};
    b.registerListener(listener, cb);
    b.deregisterListener(listener);
    b.broadcast();
    assert.isFalse(called, "callback was not called after deregistering only listener");

    b.registerListener(5, cb);
    b.registerListener(6, cb);
    b.deregisterAllListeners();
    b.broadcast();
    assert.isFalse(called, "callback was not called after deregistering all listeners");

    b.registerListener(5, cb);
    b.registerListener(6, cb);
    b.deregisterListener(5);
    b.broadcast();
    assert.isTrue(called, "callback was called even after 1/2 listeners were deregistered");
  });

  it("arguments are passed through to callback", () => {
    var g2 = {};
    var g3 = "foo";
    var cb = (a1: Plottable.Core.Listenable, rest: any[]) => {
      assert.equal(listenable, a1, "broadcaster passed through");
      assert.equal(g2, rest[0], "arg1 passed through");
      assert.equal(g3, rest[1], "arg2 passed through");
      called = true;
    };
    b.registerListener(null, cb);
    b.broadcast(g2, g3);
    assert.isTrue(called, "the cb was called");
  });

  it("deregistering an unregistered listener doesn't throw an error", () => {
    assert.doesNotThrow(() => b.deregisterListener({}) );
  });
});
