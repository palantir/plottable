import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Utils.Methods", () => {
  it("inRange()", () => {
    assert.isTrue(Plottable.Utils.Math.inRange(0, -1, 1), "basic functionality works");
    assert.isTrue(Plottable.Utils.Math.inRange(0, 0, 1), "it is a closed interval");
    assert.isTrue(!Plottable.Utils.Math.inRange(0, 1, 2), "returns false when false");
  });

  describe("max() and min()", () => {
    const max = Plottable.Utils.Math.max;
    const min = Plottable.Utils.Math.min;
    const today = new Date();

    it("return the default value if max() or min() can't be computed", () => {
      const minValue = 1;
      const maxValue = 5;
      const defaultValue = 3;
      const goodArray: number[][] = [
        [minValue],
        [maxValue],
      ];
      // bad array is technically of type number[][], but subarrays are empty!
      const badArray: number[][] = [
        [],
        [],
      ];
      const accessor = (arr: number[]) => arr[0];
      assert.strictEqual(min<number[], number>(goodArray, accessor, defaultValue),
        minValue, "min(): minimum value is returned in good case");
      assert.strictEqual(min<number[], number>(badArray, accessor, defaultValue),
        defaultValue, "min(): default value is returned in bad case");
      assert.strictEqual(max<number[], number>(goodArray, accessor, defaultValue),
        maxValue, "max(): maximum value is returned in good case");
      assert.strictEqual(max<number[], number>(badArray, accessor, defaultValue),
        defaultValue, "max(): default value is returned in bad case");
    });

    it("max() and min() work on numbers", () => {
      const alist = [1, 2, 3, 4, 5];
      const dbl = (x: number) => x * 2;
      const dblIndexOffset = (x: number, i: number) => x * 2 - i;
      const numToDate = (x: number) => {
        const t = new Date(today.getTime());
        t.setDate(today.getDate() + x);
        return t;
      };

      assert.deepEqual(max(alist, 99), 5, "max ignores default on non-empty array");
      assert.deepEqual(max(alist, dbl, 0), 10, "max applies function appropriately");
      assert.deepEqual(max(alist, dblIndexOffset, 5), 6, "max applies function with index");
      assert.deepEqual(max(alist, numToDate, today), numToDate(5), "max applies non-numeric function appropriately");
      assert.deepEqual(max([], 10), 10, "works as intended with default value");
      assert.deepEqual(max([], dbl, 5), 5, "default value works with function");
      assert.deepEqual(max([], numToDate, today), today, "default non-numeric value works with non-numeric function");

      assert.deepEqual(min(alist, 0), 1, "min works for basic list");
      assert.deepEqual(min(alist, dbl, 0), 2, "min works with function arg");
      assert.deepEqual(min(alist, dblIndexOffset, 0), 2, "min works with function index arg");
      assert.deepEqual(min(alist, numToDate, today), numToDate(1), "min works with non-numeric function arg");
      assert.deepEqual(min([], dbl, 5), 5, "min accepts custom default and function");
      assert.deepEqual(min([], numToDate, today), today, "min accepts non-numeric default and function");
    });

    it("max() and min() work on strings", () => {
      const strings = ["a", "bb", "ccc", "ddd"];
      assert.deepEqual(max(strings, (s: string) => s.length, 0), 3, "works on arrays of non-numbers with a function");
      assert.deepEqual(max([], (s: string) => s.length, 5), 5, "defaults work even with non-number function type");
    });

    it("max() and min() work on dates", () => {
      const tomorrow = new Date(today.getTime());
      tomorrow.setDate(today.getDate() + 1);
      const dayAfterTomorrow = new Date(today.getTime());
      dayAfterTomorrow.setDate(today.getDate() + 2);
      const dates: Date[] = [today, tomorrow, dayAfterTomorrow, null];
      assert.deepEqual(min<Date>(dates, dayAfterTomorrow), today, "works on arrays of non-numeric values but comparable");
      assert.deepEqual(max<Date>(dates, today), dayAfterTomorrow, "works on arrays of non-number values but comparable");
      assert.deepEqual(max<Date>([null], today), today, "returns default value if passed array of null values");
      assert.deepEqual(max<Date>([], today), today, "returns default value if passed empty");
    });
  });

  describe("coerceToRange()", () => {
    it("identity if value within range", () => {
      assert.equal(Plottable.Utils.Math.coerceToRange(2, [-5, 15]), 2);
      assert.equal(Plottable.Utils.Math.coerceToRange(15, [-5, 15]), 15);
    });

    it("returns range max if larger than range", () => {
      assert.equal(Plottable.Utils.Math.coerceToRange(16, [-5, 15]), 15);
    });

    it("returns range min if smaller than range", () => {
      assert.equal(Plottable.Utils.Math.coerceToRange(-10, [-5, 15]), -5);
    });
  });

  it("isNaN()", () => {
    const isNaN = Plottable.Utils.Math.isNaN;

    assert.isTrue(isNaN(NaN), "Only NaN should pass the isNaN check");

    assert.isFalse(isNaN(undefined), "undefined should fail the isNaN check");
    assert.isFalse(isNaN(null), "null should fail the isNaN check");
    assert.isFalse(isNaN(Infinity), "Infinity should fail the isNaN check");
    assert.isFalse(isNaN(1), "numbers should fail the isNaN check");
    assert.isFalse(isNaN(0), "0 should fail the isNaN check");
    assert.isFalse(isNaN("foo"), "strings should fail the isNaN check");
    assert.isFalse(isNaN(""), "empty strings should fail the isNaN check");
    assert.isFalse(isNaN({}), "empty Objects should fail the isNaN check");
  });

  it("isValidNumber()", () => {
    const isValidNumber = Plottable.Utils.Math.isValidNumber;

    assert.isTrue(isValidNumber(0), "(0 is a valid number");
    assert.isTrue(isValidNumber(1), "(1 is a valid number");
    assert.isTrue(isValidNumber(-1), "(-1 is a valid number");
    assert.isTrue(isValidNumber(0.1), "(0.1 is a valid number");

    assert.isFalse(isValidNumber(null), "(null is not a valid number");
    assert.isFalse(isValidNumber(NaN), "(NaN is not a valid number");
    assert.isFalse(isValidNumber(undefined), "(undefined is not a valid number");
    assert.isFalse(isValidNumber(Infinity), "(Infinity is not a valid number");
    assert.isFalse(isValidNumber(-Infinity), "(-Infinity is not a valid number");

    assert.isFalse(isValidNumber("number"), "('number' is not a valid number");
    assert.isFalse(isValidNumber("string"), "('string' is not a valid number");
    assert.isFalse(isValidNumber("0"), "('0' is not a valid number");
    assert.isFalse(isValidNumber("1"), "('1' is not a valid number");

    assert.isFalse(isValidNumber([]), "([] is not a valid number");
    assert.isFalse(isValidNumber([1]), "([1] is not a valid number");
    assert.isFalse(isValidNumber({}), "({} is not a valid number");
    assert.isFalse(isValidNumber({1: 1}), "({1: 1} is not a valid number");

  });

  it("range()", () => {
    const start = 0;
    const end = 6;
    let range = Plottable.Utils.Math.range(start, end);
    assert.deepEqual(range, [0, 1, 2, 3, 4, 5], "all entries has been generated");

    range = Plottable.Utils.Math.range(start, end, 2);
    assert.deepEqual(range, [0, 2, 4], "all entries has been generated");

    range = Plottable.Utils.Math.range(start, end, 11);
    assert.deepEqual(range, [0], "all entries has been generated");

    assert.throws(() => Plottable.Utils.Math.range(start, end, 0), "step cannot be 0");

    range = Plottable.Utils.Math.range(start, end, -1);
    assert.lengthOf(range, 0, "no entries because of invalid step");

    range = Plottable.Utils.Math.range(end, start, -1);
    assert.deepEqual(range, [6, 5, 4, 3, 2, 1], "all entries has been generated");

    range = Plottable.Utils.Math.range(-2, 2);
    assert.deepEqual(range, [-2, -1, 0, 1], "all entries has been generated range crossing 0");

    range = Plottable.Utils.Math.range(0.2, 4);
    assert.deepEqual(range, [0.2, 1.2, 2.2, 3.2], "all entries has been generated with float start");

    range = Plottable.Utils.Math.range(0.6, 2.2, 0.5);
    assert.deepEqual(range, [0.6, 1.1, 1.6, 2.1], "all entries has been generated with float step");
  });

});

describe("Utils Matrix", () => {

  type Matrix = Plottable.Utils.Math.ICssTransformMatrix;
  const identity: Matrix = [1, 0, 0, 1, 0, 0];

  const { multiplyMatrix, invertMatrix, applyTransform } = Plottable.Utils.Math;

  const rotationMatrix = (theta: number): Matrix => {
    return [Math.cos(theta), Math.sin(theta), -Math.sin(theta), Math.cos(theta), 0, 0];
  };

  const scaleMatrix = (sx: number, sy: number): Matrix => {
    return [sx, 0, 0, sy, 0, 0];
  };

  const translationMatrix = (tx: number, ty: number): Matrix => {
    return [1, 0, 0, 1, tx, ty];
  };

  const assertMatricesEqual = (a: Matrix, b: Matrix, msg: string, epsilon = 1e-12) => {
    for (let i = 0; i < 6; i++) {
      assert.closeTo(a[i], b[i], epsilon, `${msg} (${i})`);
    }
  };

  it("multiplication by identity results in same matrix", () => {
    const m0 = rotationMatrix(Plottable.Utils.Math.degreesToRadians(45));
    assertMatricesEqual(m0, multiplyMatrix(m0, identity), "multiply identity");
    assertMatricesEqual(m0, multiplyMatrix(identity, m0), "pre-multiply identity");
  });

  it("multiplication by rotations returns to identity", () => {
    // rotate by 60 degrees 6 times => 360 degree rotation
    const rotate = rotationMatrix(Plottable.Utils.Math.degreesToRadians(60));
    let m = identity;
    for (let i = 0; i < 6; i++) {
      m = multiplyMatrix(m, rotate);
    }
    assertMatricesEqual(m, identity, "rotation");
  });

  it("multiplication by scales returns to identity", () => {
    const bigger = scaleMatrix(16, 4);
    const smaller = scaleMatrix(1/16, 1/4);
    let m = identity;
    m = multiplyMatrix(m, bigger);
    m = multiplyMatrix(m, smaller);
    assertMatricesEqual(m, identity, "scale");
  });

  it("multiplication by translation returns to identity", () => {
    const moveFoo = translationMatrix(127, -8);
    const moveBar = translationMatrix(-127, 8);
    let m = identity;
    m = multiplyMatrix(m, moveFoo);
    m = multiplyMatrix(m, moveBar);
    assertMatricesEqual(m, identity, "translate");
  });

  it("inverse of identity is identity", () => {
    assertMatricesEqual(invertMatrix(identity), identity, "I = I^-1");
  });

  it("multiplication by inverse returns to identity", () => {
    let m = identity;
    m = multiplyMatrix(m, rotationMatrix(Plottable.Utils.Math.degreesToRadians(60)));
    m = multiplyMatrix(m, translationMatrix(127, -8));
    m = multiplyMatrix(m, scaleMatrix(16, 4));
    m = multiplyMatrix(m, invertMatrix(m));
    assertMatricesEqual(m, identity, "A * A^-1 = I");
  });

  it("pre-post multiplication order", () => {
    const rotate = rotationMatrix(Plottable.Utils.Math.degreesToRadians(60));
    const translate = translationMatrix(127, -8);
    const scale = scaleMatrix(16, 4);

    let m0 = identity;
    m0 = multiplyMatrix(m0, rotate);
    m0 = multiplyMatrix(m0, translate);
    m0 = multiplyMatrix(m0, scale);

    let m1 = identity;
    m1 = multiplyMatrix(scale, m1);
    m1 = multiplyMatrix(translate, m1);
    m1 = multiplyMatrix(rotate, m1);

    assertMatricesEqual(m0, m1, "multiplication order");
  });

  it("apply transform to point", () => {
    // use 3-4-5 triangle identity
    const point = {x: 0, y: 5};
    const rotate = rotationMatrix(Plottable.Utils.Math.degreesToRadians(36.87));
    const rotated = applyTransform(rotate, point);
    TestMethods.assertPointsClose(rotated, {x: -3, y: 4}, 1e-3, "rotates to 3-4-5 triangle point");
  });

  it("throws error when trying to invert singular matrix", () => {
    const m: Matrix = [0, 0, 0, 0, 0, 0];
    assert.throws(() => invertMatrix(m));
  });
});
