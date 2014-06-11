///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Formatters", () => {
  describe("fixed", () => {
    it("shows exactly [precision] digits", () => {
      var fixed3 = new Plottable.Util.Formatter.Fixed();
      var result = fixed3.format(1);
      var decimals = result.substring(result.indexOf(".") + 1, result.length);
      assert.strictEqual(decimals.length, 3, "defaults to three decimal places");
    });

    it ("precision can be changed", () => {
      var fixed2 = new Plottable.Util.Formatter.Fixed();
      fixed2.precision(2);
      var result = fixed2.format(1);
      var decimals = result.substring(result.indexOf(".") + 1, result.length);
      assert.strictEqual(decimals.length, 2, "formatter was changed to show only two decimal places");
    });
  });

  describe("general", () => {
    it("shows at most [precision] digits", () => {
      var general = new Plottable.Util.Formatter.General();
      var result = general.format(1);
      assert.strictEqual(result, "1", "shows no decimals if formatting an integer");
    });
  });

  describe("currency", () => {
    it("uses reasonable defaults", () => {
      var currencyFormatter = new Plottable.Util.Formatter.Currency();
      var result = currencyFormatter.format(1);
      assert.strictEqual(result.charAt(0), "$", "defaults to $ for currency symbol");
      var decimals = result.substring(result.indexOf(".") + 1, result.length);
      assert.strictEqual(decimals.length, 2, "defaults to 2 decimal places");

      result = currencyFormatter.format(-1);
      assert.strictEqual(result.charAt(0), "-", "prefixes negative values with \"-\"");
      assert.strictEqual(result.charAt(1), "$", "places the currency symbol after the negative sign");
    });

    it("can change the type and position of the currency symbol", () => {
      var centsFormatter = new Plottable.Util.Formatter.Currency(0, "c", false);
      var result = centsFormatter.format(1);
      assert.strictEqual(result.charAt(result.length-1), "c", "The specified currency symbol was appended");
    });
  });

  describe("percentage", () => {
    it("uses reasonable defaults", ()=> {
      var percentFormatter = new Plottable.Util.Formatter.Percentage();
      var result = percentFormatter.format(1);
      assert.strictEqual(result, "100%",
        "the value was multiplied by 100, a percent sign was appended, and no decimal places are shown by default");
    });
  });

  describe("custom", () => {
    it("can take a custom formatting function", () => {
      var customFormatter: Plottable.Util.Formatter.Custom;
      var blargify = function(d: any, f: Plottable.Util.Formatter.Custom) {
        assert.strictEqual(f, customFormatter, "Formatter itself was supplied as second argument");
        return String(d) + "-blargh";
      };
      customFormatter = new Plottable.Util.Formatter.Custom(0, blargify);
      var result = customFormatter.format(1);
      assert.strictEqual(result, "1-blargh", "it uses the custom formatting function");
    });
  });
});
