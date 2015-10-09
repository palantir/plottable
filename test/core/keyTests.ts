///<reference path="../testReference.ts" />

describe("DatasetKey", () => {
  it(" is passed to Dataset", () => {
    let ds: Plottable.Dataset = new Plottable.Dataset();
    let key: (d: any, i: number) => number = (d: any, i: number) => { return i; };
    ds.keyFunction(key);
    assert.deepEqual(ds.keyFunction(), key, "key is passed to dataset");
  });
  it(" may accept noConstancy predefined key function", () => {
    let ds: Plottable.Dataset = new Plottable.Dataset();
    ds.keyFunction(Plottable.KeyFunctions.noConstancy);
    let d: any = { foo: "bar" };
    let a: number = ds.keyFunction()(d, 1);
    let b: number = ds.keyFunction()(d, 1);
    assert.isTrue(b - a === 1, "invocations give numerically increasing results");
  });
  it(" defaults to useIndex predefined key function", () => {
    let ds: Plottable.Dataset = new Plottable.Dataset();
    assert.isTrue(ds.keyFunction() === Plottable.KeyFunctions.useIndex, "useIndex is default");
  });
  it(" may accept useIndex predefined key function", () => {
    let ds: Plottable.Dataset = new Plottable.Dataset();
    ds.keyFunction(Plottable.KeyFunctions.useIndex);
    let d: any = { foo: "bar" };
    let a: number = ds.keyFunction()(d, 1);
    let b: number = ds.keyFunction()(d, 2);
    assert.isTrue(a === 1, "invocations return index");
    assert.isTrue(b === 2, "invocations return index");
  });
  describe("DatasetKey noConstancy", () => {
    it("generates a different value each time invoked", () => {
      let keyFunction = Plottable.KeyFunctions.noConstancy;
      let d: any = { foo: "bar" };
      let a: number = keyFunction(d, 1);
      let b: number = keyFunction(d, 1);

      assert.isTrue(b - a === 1, "invocations give numerically increasing results");
    });
  });
});
