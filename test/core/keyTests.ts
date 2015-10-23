///<reference path="../testReference.ts" />

describe("DatasetKeyFunction", () => {
  it("is passed to Dataset", () => {
    let ds = new Plottable.Dataset();
    let key = (d: any, i: number) => { return i; };
    ds.keyFunction(key);
    assert.strictEqual(ds.keyFunction(), key, "key is passed to dataset");
  });

  it("may accept noConstancy predefined key function", () => {
    let ds = new Plottable.Dataset();
    ds.keyFunction(Plottable.KeyFunctions.noConstancy);
    let datum = { foo: "bar" };
    let keyValue1 = ds.keyFunction()(datum, 1);
    let keyValue2 = ds.keyFunction()(datum, 1);
    assert.strictEqual(keyValue2, keyValue1 + 1, "invocations give numerically increasing results");
  });

  it("defaults to useIndex predefined key function", () => {
    let ds = new Plottable.Dataset();
    assert.strictEqual(ds.keyFunction(), Plottable.KeyFunctions.useIndex, "useIndex is default");
  });

  it("may accept useIndex predefined key function", () => {
    let ds = new Plottable.Dataset();
    ds.keyFunction(Plottable.KeyFunctions.useIndex);
    let datum = { foo: "bar" };
    let keyValue1 = ds.keyFunction()(datum, 1);
    let keyValue2 = ds.keyFunction()(datum, 2);
    assert.strictEqual(keyValue1, 1, "invocations return index");
    assert.strictEqual(keyValue2, 2, "invocations return index");
  });

  describe("DatasetKey noConstancy", () => {
    it("generates a different value each time invoked", () => {
      let keyFunction = Plottable.KeyFunctions.noConstancy;
      let keyValue1 = keyFunction();
      let keyValue2 = keyFunction();
      assert.strictEqual(keyValue2, keyValue1 + 1, "invocations give numerically increasing results");

    });
  });
});
