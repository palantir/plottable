import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Scales", () => {
  describe("Scale", () => {
    class MockScale<D, R> extends Plottable.Scale<D, R> {
      private _domain: D[] = [];
      private _range: R[] = [];
      private _autodomainCallback: () => D[];

      constructor(autodomainCallback = (): D[] => []) {
        super();
        this._autodomainCallback = autodomainCallback;
      }

      protected _getExtent() {
        return this._autodomainCallback();
      }

      protected _getDomain() {
        return this._backingScaleDomain();
      }

      protected _backingScaleDomain(): D[]
      protected _backingScaleDomain(values: D[]): this
      protected _backingScaleDomain(values?: D[]): any {
        if (values == null) {
          return this._domain;
        } else {
          this._domain = values;
          return this;
        }
      }

      protected _getRange() {
        return this._range;
      }

      protected _setRange(values: R[]) {
        this._range = values;
      }

      public includedValues() {
        return this._getAllIncludedValues();
      }
    }

    describe("domain and range", () => {
      it("can set and get the domain", () => {
        const scale = new MockScale();
        const expectedDomain = [0, 10];
        assert.strictEqual(scale.domain(expectedDomain), scale, "setter mode returns the calling Scale");
        assert.deepEqual(scale.domain(), expectedDomain, "returns the set domain");
      });

      it("can set and get the range", () => {
        const scale = new MockScale();
        const expectedRange = [0, 10];
        assert.strictEqual(scale.range(expectedRange), scale, "setter mode returns the calling Scale");
        assert.deepEqual(scale.range(), expectedRange, "returns the set range");
      });

      it("is comparable by default", () => {
        const scale = new MockScale();
        assert.isTrue(scale.isComparable(scale));
      });
    });

    describe("onUpdate", () => {
      it("alerts listeners when its domain is updated", () => {
        const scale = new MockScale();

        const expectedDomain = [0, 10];

        let callbackWasCalled = false;
        const testCallback = (listenable: Plottable.Scale<any, any>) => {
          assert.strictEqual(listenable, scale, "Callback received the calling scale as the first argument");
          assert.deepEqual(listenable.domain(), expectedDomain, "domain was updated bofore the callback was called");
          callbackWasCalled = true;
        };
        scale.onUpdate(testCallback);
        scale.domain(expectedDomain);
        assert.isTrue(callbackWasCalled, "The registered callback was called");
      });

      it("can disconnect listeners", () => {
        const scale = new MockScale();

        let callbackWasCalled = false;
        const testCallback = (listenable: Plottable.Scale<any, any>) => {
          assert.strictEqual(listenable, scale, "Callback received the calling scale as the first argument");
          callbackWasCalled = true;
        };
        scale.onUpdate(testCallback);
        scale.domain([0, 10]);
        assert.isTrue(callbackWasCalled, "The registered callback was called");

        callbackWasCalled = false;
        scale.offUpdate(testCallback);
        scale.domain([11, 19]);
        assert.isFalse(callbackWasCalled, "The registered callback was not called because the callback was removed");
      });
    });

    describe("included values", () => {
      it("adding or removing an IncludedValuesProvider returns the Scale", () => {
        const scale = new MockScale<number, number>();
        const valueProvider = (): any[] => [];
        assert.strictEqual(scale.addIncludedValuesProvider(valueProvider), scale, "adding the provider returns the Scale");
        assert.strictEqual(scale.removeIncludedValuesProvider(valueProvider), scale, "removing the provider returns the Scale");
      });

      it("combines all values from its IncludedValuesProviders", () => {
        const scale = new MockScale();
        const provider1Value = { value: 1 };
        const provider1 = (passedScale: Plottable.Scale<any, any>) => {
          assert.strictEqual(passedScale, scale, "was passed the scale it was attached to");
          return [provider1Value];
        };
        const provider2Value = { value: 2 };
        const provider2 = () => [provider2Value];
        scale.addIncludedValuesProvider(provider1);
        scale.addIncludedValuesProvider(provider2);

        const expectedIncludedValues = [provider1Value, provider2Value];
        assert.deepEqual(scale.includedValues(), expectedIncludedValues, "combines all included values into a single array");
      });

      it("does not include values from removed IncludedValuesProviders", () => {
        const scale = new MockScale();
        const provider1Value = { value: 1 };
        const provider1 = () => [provider1Value];
        const provider2Value = { value: 2 };
        const provider2 = () => [provider2Value];

        scale.addIncludedValuesProvider(provider1);
        scale.addIncludedValuesProvider(provider2);
        scale.removeIncludedValuesProvider(provider2);

        const expectedIncludedValues = [provider1Value];
        assert.deepEqual(scale.includedValues(), expectedIncludedValues, "includes only values from remaining providers");
      });

      it("won't add the same IncludedValuesProvider twice", () => {
        const scale = new MockScale();
        const providerValue = { value: 1 };
        const provider = () => [providerValue];

        scale.addIncludedValuesProvider(provider);
        scale.addIncludedValuesProvider(provider);

        const expectedIncludedValues = [providerValue];
        assert.deepEqual(scale.includedValues(), expectedIncludedValues, "only includes the value once");
      });
    });

    describe("autodomaining", () => {
      it("overrides a set domain if explicitly autodomained", () => {
        const expectedDomain = [0, 99];
        const autodomainCallback = () => expectedDomain;
        const scale = new MockScale(autodomainCallback);
        const explicitlySetDomain = [0, 1];
        scale.domain(explicitlySetDomain);
        scale.autoDomain();
        assert.deepEqual(scale.domain(), expectedDomain, "returns the autodomain value by default");
      });

      it("autodomains when adding or removing an IncludedValuesProvider if in auto mode", () => {
        let autodomainCalls = 0;
        const autodomainCallback = (): any[] => {
          autodomainCalls++;
          return [];
        };
        const scale = new MockScale(autodomainCallback);
        const provider = (): any[] => [];
        scale.addIncludedValuesProvider(provider);
        assert.strictEqual(autodomainCalls, 1, "scale autodomained when a provider was added");
        scale.removeIncludedValuesProvider(provider);
        assert.strictEqual(autodomainCalls, 2, "scale autodomained when a provider was removed");
      });

      it("does not autodomain when adding or removing an IncludedValuesProvider if NOT in auto mode", () => {
        let autodomainCalls = 0;
        const autodomainCallback = (): any[] => {
          autodomainCalls++;
          return [];
        };
        const scale = new MockScale(autodomainCallback);
        scale.domain([0, 1]);
        const provider = (): any[] => [];
        scale.addIncludedValuesProvider(provider);
        assert.strictEqual(autodomainCalls, 0, "scale did not autodomain when a provider was added");
        scale.removeIncludedValuesProvider(provider);
        assert.strictEqual(autodomainCalls, 0, "scale dit not autodomain when a provider was removed");
      });
    });
  });
});
