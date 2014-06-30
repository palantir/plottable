///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Formatters", () => {
  describe("fixed", () => {
    it("shows exactly [precision] digits", () => {
      var fixed3 = new Plottable.Formatter.Fixed();
      var result = fixed3.format(1);
      assert.strictEqual(result, "1.000", "defaults to three decimal places");
      result = fixed3.format(1.234);
      assert.strictEqual(result, "1.234", "shows three decimal places");
      result = fixed3.format(1.2345);
      assert.strictEqual(result, "", "changed values are not shown (get turned into empty strings)");
    });

    it("precision can be changed", () => {
      var fixed2 = new Plottable.Formatter.Fixed();
      fixed2.precision(2);
      var result = fixed2.format(1);
      assert.strictEqual(result, "1.00", "formatter was changed to show only two decimal places");
    });

    it("can be set to show rounded values", () => {
      var fixed3 = new Plottable.Formatter.Fixed();
      fixed3.showOnlyUnchangedValues(false);
      var result = fixed3.format(1.2349);
      assert.strictEqual(result, "1.235", "long values are rounded correctly");
    });
  });

  describe("general", () => {
    it("formats number to show at most [precision] digits", () => {
      var general = new Plottable.Formatter.General();
      var result = general.format(1);
      assert.strictEqual(result, "1", "shows no decimals if formatting an integer");
      result = general.format(1.234);
      assert.strictEqual(result, "1.234", "shows up to three decimal places");
      result = general.format(1.2345);
      assert.strictEqual(result, "", "(changed) values with more than three decimal places are not shown");
    });

    it("stringifies non-number values", () => {
      var general = new Plottable.Formatter.General();
      var result = general.format("blargh");
      assert.strictEqual(result, "blargh", "string values are passed through unchanged");
      result = general.format(null);
      assert.strictEqual(result, "null", "non-number inputs are stringified");
    });

    it("throws an error on strange precision", () => {
      assert.throws(() => {
          var general = new Plottable.Formatter.General(-1);
          var result = general.format(5);
      });
      assert.throws(() => {
          var general = new Plottable.Formatter.General(100);
          var result = general.format(5);
      });
    });
  });

  describe("identity", () => {
    it("stringifies inputs", () => {
      var identity = new Plottable.Formatter.Identity();
      var result = identity.format(1);
      assert.strictEqual(result, "1", "numbers are stringified");
      result = identity.format(0.999999);
      assert.strictEqual(result, "0.999999", "long numbers are stringified");
      result = identity.format(null);
      assert.strictEqual(result, "null", "formats null");
      result = identity.format(undefined);
      assert.strictEqual(result, "undefined", "formats undefined");
    });
  });

  describe("currency", () => {
    it("uses reasonable defaults", () => {
      var currencyFormatter = new Plottable.Formatter.Currency();
      var result = currencyFormatter.format(1);
      assert.strictEqual(result.charAt(0), "$", "defaults to $ for currency symbol");
      var decimals = result.substring(result.indexOf(".") + 1, result.length);
      assert.strictEqual(decimals.length, 2, "defaults to 2 decimal places");

      result = currencyFormatter.format(-1);
      assert.strictEqual(result.charAt(0), "-", "prefixes negative values with \"-\"");
      assert.strictEqual(result.charAt(1), "$", "places the currency symbol after the negative sign");
    });

    it("can change the type and position of the currency symbol", () => {
      var centsFormatter = new Plottable.Formatter.Currency(0, "c", false);
      var result = centsFormatter.format(1);
      assert.strictEqual(result.charAt(result.length-1), "c", "The specified currency symbol was appended");
    });
  });

  describe("percentage", () => {
    it("uses reasonable defaults", ()=> {
      var percentFormatter = new Plottable.Formatter.Percentage();
      var result = percentFormatter.format(1);
      assert.strictEqual(result, "100%",
        "the value was multiplied by 100, a percent sign was appended, and no decimal places are shown by default");
    });
  });

  describe("custom", () => {
    it("can take a custom formatting function", () => {
      var customFormatter: Plottable.Formatter.Custom;
      var blargify = function(d: any, f: Plottable.Formatter.Custom) {
        assert.strictEqual(f, customFormatter, "Formatter itself was supplied as second argument");
        return String(d) + "-blargh";
      };
      customFormatter = new Plottable.Formatter.Custom(0, blargify);
      var result = customFormatter.format(1);
      assert.strictEqual(result, "1-blargh", "it uses the custom formatting function");
    });
  });
});
