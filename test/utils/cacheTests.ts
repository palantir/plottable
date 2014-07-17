///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Cache", () => {
  var callbackCalled = false;
  var f = (s: string) => {
    callbackCalled = true;
    return s + s;
  };
  var cache: Plottable.Util.Cache<string>;

  beforeEach(() => {
    callbackCalled = false;
    cache = new Plottable.Util.Cache(f);
  });

  it("Doesn't call its function if it already called", () => {
    assert.equal(cache.get("hello"), "hellohello");
    assert.isTrue(callbackCalled);
    callbackCalled = false;
    assert.equal(cache.get("hello"), "hellohello");
    assert.isFalse(callbackCalled);
  });

  it("Clears its cache when .clear() is called", () => {
    var prefix = "hello";
    cache = new Plottable.Util.Cache((s: string) => {
      callbackCalled = true;
      return prefix + s;
    });
    assert.equal(cache.get("world"), "helloworld");
    assert.isTrue(callbackCalled);
    callbackCalled = false;
    assert.equal(cache.get("world"), "helloworld");
    assert.isFalse(callbackCalled);
    prefix = "hola";
    cache.clear();
    assert.equal(cache.get("world"), "holaworld");
    assert.isTrue(callbackCalled);
  });

  it("Doesn't clear the cache when canonicalKey doesn't change", () => {
    cache = new Plottable.Util.Cache(f, "x");
    assert.equal(cache.get("hello"), "hellohello");
    assert.isTrue(callbackCalled);
    cache.clear();
    callbackCalled = false;
    assert.equal(cache.get("hello"), "hellohello");
    assert.isFalse(callbackCalled);
  });

  it("Clears the cache when canonicalKey changes", () => {
    var prefix = "hello";
    cache = new Plottable.Util.Cache((s: string) => {
      callbackCalled = true;
      return prefix + s;
    });
    cache.get("world");
    assert.isTrue(callbackCalled);
    prefix = "hola";
    cache.clear();
    callbackCalled = false;
    cache.get("world");
    assert.isTrue(callbackCalled);
  });

  it("uses valueEq to check if it should clear", () => {
    var decider = true;
    cache = new Plottable.Util.Cache(f, "x", (a, b) => decider);
    cache.get("hello");
    assert.isTrue(callbackCalled);
    cache.clear();
    callbackCalled = false;
    cache.get("hello");
    assert.isFalse(callbackCalled);
    decider = false;
    cache.clear();
    cache.get("hello");
    assert.isTrue(callbackCalled);
  });
});
