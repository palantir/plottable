///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Formatters", () => {
  describe("general", () => {
    it("shows at most [precision] digits", () => {
      var general = Plottable.Util.Formatter.general();
      var result = general(1);
      assert.strictEqual(result, "1", "shows no decimals if formatting an integer");
      result = general(1.2345);
      assert.strictEqual(result, "1.235", "longer numbers are rounded and truncated appropriately");
    });
  });

  describe("fixed", () => {
    it("shows exactly [precision] digits", () => {
      var fixed3 = Plottable.Util.Formatter.fixed();
      var result = fixed3(1);
      var decimals = result.substring(result.indexOf(".") + 1, result.length);
      assert.strictEqual(decimals.length, 3, "defaults to three decimal places");
      result = fixed3(1.2345);
      decimals = result.substring(result.indexOf(".") + 1, result.length);
      assert.strictEqual(decimals.length, 3, "rounds to three decimal places");
    });
  });

  describe("currency", ()=> {
    it("uses reasonable defaults", () => {
      var currencyFormatter = Plottable.Util.Formatter.currency();
      var result = currencyFormatter(1);
      assert.strictEqual(result.charAt(0), "$", "defaults to $ for currency symbol");
      var decimals = result.substring(result.indexOf(".") + 1, result.length);
      assert.strictEqual(decimals.length, 2, "defaults to 2 decimal places");

      result = currencyFormatter(-1);
      assert.strictEqual(result.charAt(0), "-", "prefixes negative values with \"-\"");
      assert.strictEqual(result.charAt(1), "$", "places the currency symbol after the negative sign");
    });

    it("can change the type and position of the currency symbol", () => {
      var centsFormatter = Plottable.Util.Formatter.currency(0, "c", false);
      var result = centsFormatter(1);
      assert.strictEqual(result.charAt(result.length-1), "c", "The specified currency symbol was appended");
    });
  });

  describe("percentage", ()=> {
    it("uses reasonable defaults", ()=> {
      var percentFormatter = Plottable.Util.Formatter.percentage();
      var result = percentFormatter(1);
      assert.strictEqual(result.charAt(result.length-1), "%", "the percent sign was appended");
      var decimalPosition = result.indexOf(".");
      assert.strictEqual(decimalPosition, -1, "Shows no decimal places by default");
    });
  });
});
