﻿///<reference path="../testReference.ts" />

describe("DatasetKey", () => {
  it(" is passed to Dataset", () => {
    let ds: Plottable.Dataset = new Plottable.Dataset();
    let key: (d: any, i: number) => number = (d: any, i: number) => { return i };
    ds.key(key);
    assert.deepEqual(ds.key(),key,"key is passed to dataset");
  });
  it(" may accept NoConstancy predefined key function", () => {
    let ds: Plottable.Dataset = new Plottable.Dataset();
    ds.key(Plottable.KeyFunctions.NoConstancy);
    let d: any = { foo: "bar" };
    let a: number = ds.key()(d, 1);
    let b: number = ds.key()(d, 1);
    assert.isTrue(b - a == 1, "invocations give numerically increasing results");
  });
  it(" defaults to NoConstancy predefined key function", () => {
    let ds: Plottable.Dataset = new Plottable.Dataset();
    assert.isTrue(ds.key() === Plottable.KeyFunctions.NoConstancy, "NoConstancy is default");
  });
  it(" may accept ByIndex predefined key function", () => {
    let ds: Plottable.Dataset = new Plottable.Dataset();
    ds.key(Plottable.KeyFunctions.ByIndex);
    let d: any = { foo: "bar" };
    let a: number = ds.key()(d, 1);
    let b: number = ds.key()(d, 2);
    assert.isTrue(a == 1, "invocations return index");
    assert.isTrue(b == 2, "invocations return index");
  });
  describe("DatasetKey NoConstancy", () => {
    it("generates a different value each time invoked", () => {
      let key = Plottable.KeyFunctions.NoConstancy;
      let d: any = { foo: "bar" };
      let a: number = key(d, 1);
      let b: number = key(d, 1);

      assert.isTrue(b - a == 1, "invocations give numerically increasing results");
    });
  });
});