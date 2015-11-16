///<reference path="../testReference.ts" />

describe("Scales", () => {
  describe("Scale", () => {
    class MockScale<D, R> extends Plottable.Scale<D, R> {
      private _domain: D[] = [];
      private _range: R[] = [];

      protected _getDomain() {
        return this._domain;
      }

      protected _setBackingScaleDomain(values: D[]) {
        this._domain = values;
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
        const valueProvider = () => [];
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
  });
});
