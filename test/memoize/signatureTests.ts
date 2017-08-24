import { assert } from "chai";

import * as Plottable from "../../src";

import { ReferenceSignature, sign } from "../../src/memoize/signature";

describe("Signature API", () => {
    describe("sign", () => {
        it("passes signatures along", () => {
            const input = new ReferenceSignature({});
            assert.strictEqual(sign(input), input);
        });

        it("signs primitives and unsupported classes as refs", () => {
            assert.instanceOf(sign(0), ReferenceSignature);
            assert.instanceOf(sign("string"), ReferenceSignature);
            assert.instanceOf(sign(function() {}), ReferenceSignature);

            class Foo {}
            assert.instanceOf(sign(new Foo()), ReferenceSignature);
        });
    });

    describe("isDifferent", () => {
        it("returns true for different signature types", () => {
            class Foo {}
            class Bar {}
            assert.isTrue(sign(new Foo()).isDifferent(sign(new Bar())));
        });

        it("returns false for same primitive reference", () => {
            assert.isFalse(sign(1).isDifferent(sign(1)));
            const fn = () => {};
            assert.isFalse(sign(fn).isDifferent(sign(fn)));
        });

        it("different date instances referring to same date shouldn't be different", () => {
            const sig1 = sign(new Date(12345));
            const sig2 = sign(new Date(12345));
            assert.isFalse(sig1.isDifferent(sig2));
        });

        it("returns true only when scale has updated", () => {
            const scale = new Plottable.Scales.Linear();
            const sig1 = sign(scale);
            assert.isFalse(sig1.isDifferent(sign(scale)));

            // update domain
            scale.domain([1, 2]);
            const sig2 = sign(scale);
            assert.isTrue(sig1.isDifferent(sig2));

            scale.range([1, 2]);
            const sig3 = sign(scale);
            assert.isTrue(sig2.isDifferent(sig3));
        });

        it("returns true only when dataset has updated", () => {
            const ds = new Plottable.Dataset();
            const sig1 = sign(ds);
            assert.isFalse(sig1.isDifferent(sign(ds)));

            // update data
            ds.data([1, 2, 3]);
            const sig2 = sign(ds);
            assert.isTrue(sig1.isDifferent(sig2));

            // update metadata
            ds.metadata(9000);
            const sig3 = sign(ds);
            assert.isTrue(sig2.isDifferent(sig3));
        });

        it("compares signed elements in an array", () => {
            const sig123 = sign([1, 2, 3]);
            const sig12 = sign([1, 2]);
            const sig456 = sign([4, 5, 6]);
            assert.isFalse(sig123.isDifferent(sign([1, 2, 3])));
            assert.isTrue(sig123.isDifferent(sig12));
            assert.isTrue(sig123.isDifferent(sig456));

            const scale1 = new Plottable.Scales.Linear();
            const scale2 = new Plottable.Scales.Linear();
            const sigScale12 = sign([scale1, scale2]);
            assert.isFalse(sigScale12.isDifferent(sign([scale1, scale2])));
            scale1.range([1, 2]);
            assert.isTrue(sigScale12.isDifferent(sign([scale1, scale2])));
        });

        it("returns true when object key is reassigned", () => {
            const obj = {
                domain: [0, 1],
            };
            const sig1 = sign(obj);

            obj.domain[0] = 4;
            assert.isTrue(sig1.isDifferent(sign(obj)));
        });

        it("compares signed elements in an object", () => {
            const ds = new Plottable.Dataset();

            const obj = {
                domain: [0, 1],
                updateId: 7,
                fn: () => {},
                ds: ds,
                nested: {
                    a: 1,
                },
            };

            const sigObj = sign(obj);
            assert.isFalse(sigObj.isDifferent(sign(obj)));
            assert.isFalse(sigObj.isDifferent(sign({ ...obj })));
            assert.isFalse(sigObj.isDifferent(sign({
                ...obj,
                // even though array reference is different, signing compares the primitives, so it's not different
                domain: [0, 1],
            })));

            assert.isTrue(sigObj.isDifferent(sign({
                ...obj,
                domain: [1, 2],
            })));

            assert.isTrue(sigObj.isDifferent(sign({
                ...obj,
                fn: () => {},
            })));

            ds.metadata("new metadata");
            assert.isTrue(sigObj.isDifferent(sign(obj)));
        });
    });
});
