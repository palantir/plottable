///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Broadcasters", () => {
  var b: Plottable.Abstract.Broadcaster;
  var called: boolean;
  var cb: any;

  beforeEach(() => {
    b = new Plottable.Abstract.Broadcaster();
    called = false;
    cb = () => {called = true;};
  });
  it("listeners are called by the broadcast method", () => {
    b.registerListener(null, cb);
    b._broadcast();
    assert.isTrue(called, "callback was called");
  });

  it("same listener can only be associated with one callback", () => {
    var called2 = false;
    var cb2 = () => {called2 = true;};
    var listener = {};
    b.registerListener(listener, cb);
    b.registerListener(listener, cb2);
    b._broadcast();
    assert.isFalse(called, "first (overwritten) callback not called");
    assert.isTrue(called2, "second callback was called");
  });

  it("listeners can be deregistered", () => {
    var listener = {};
    b.registerListener(listener, cb);
    b.deregisterListener(listener);
    b._broadcast();
    assert.isFalse(called, "callback was never called");
  });

  it("arguments are passed through to callback", () => {
    var g2 = {};
    var g3 = "foo";
    var cb = (a1: Plottable.Abstract.Broadcaster, rest: any[]) => {
      assert.equal(b, a1, "broadcaster passed through");
      assert.equal(g2, rest[0], "arg1 passed through");
      assert.equal(g3, rest[1], "arg2 passed through");
      called = true;
    };
    b.registerListener(null, cb);
    b._broadcast(g2, g3);
    assert.isTrue(called, "the cb was called");
  });

  it("deregistering an unregistered listener throws an error", () => {
    assert.throws(() => b.deregisterListener({}) );
  });
});
