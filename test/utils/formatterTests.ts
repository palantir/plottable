///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Formatters", () => {
  describe("fixed", () => {
    it("shows exactly [precision] digits", () => {
      var fixed3 = Plottable.Formatters.fixed();
      var result = fixed3(1);
      assert.strictEqual(result, "1.000", "defaults to three decimal places");
      result = fixed3(1.234);
      assert.strictEqual(result, "1.234", "shows three decimal places");
      result = fixed3(1.2345);
      assert.strictEqual(result, "", "changed values are not shown (get turned into empty strings)");
    });

    it("precision can be changed", () => {
      var fixed2 = Plottable.Formatters.fixed(2);
      var result = fixed2(1);
      assert.strictEqual(result, "1.00", "formatter was changed to show only two decimal places");
    });

    it("can be set to show rounded values", () => {
      var fixed3 = Plottable.Formatters.fixed(3, false);
      var result = fixed3(1.2349);
      assert.strictEqual(result, "1.235", "long values are rounded correctly");
    });
  });

  describe("general", () => {
    it("formats number to show at most [precision] digits", () => {
      var general = Plottable.Formatters.general();
      var result = general(1);
      assert.strictEqual(result, "1", "shows no decimals if formatting an integer");
      result = general(1.234);
      assert.strictEqual(result, "1.234", "shows up to three decimal places");
      result = general(1.2345);
      assert.strictEqual(result, "", "(changed) values with more than three decimal places are not shown");
    });

    it("stringifies non-number values", () => {
      var general = Plottable.Formatters.general();
      var result = general("blargh");
      assert.strictEqual(result, "blargh", "string values are passed through unchanged");
      result = general(null);
      assert.strictEqual(result, "null", "non-number inputs are stringified");
    });

    it("throws an error on strange precision", () => {
      assert.throws(() => {
          var general = Plottable.Formatters.general(-1);
          var result = general(5);
      });
      assert.throws(() => {
          var general = Plottable.Formatters.general(100);
          var result = general(5);
      });
    });
  });

  describe("identity", () => {
    it("stringifies inputs", () => {
      var identity = Plottable.Formatters.identity();
      var result = identity(1);
      assert.strictEqual(result, "1", "numbers are stringified");
      result = identity(0.999999);
      assert.strictEqual(result, "0.999999", "long numbers are stringified");
      result = identity(null);
      assert.strictEqual(result, "null", "formats null");
      result = identity(undefined);
      assert.strictEqual(result, "undefined", "formats undefined");
    });
  });

  describe("currency", () => {
    it("uses reasonable defaults", () => {
      var currencyFormatter = Plottable.Formatters.currency();
      var result = currencyFormatter(1);
      assert.strictEqual(result.charAt(0), "$", "defaults to $ for currency symbol");
      var decimals = result.substring(result.indexOf(".") + 1, result.length);
      assert.strictEqual(decimals.length, 2, "defaults to 2 decimal places");

      result = currencyFormatter(-1);
      assert.strictEqual(result.charAt(0), "-", "prefixes negative values with \"-\"");
      assert.strictEqual(result.charAt(1), "$", "places the currency symbol after the negative sign");
    });

    it("can change the type and position of the currency symbol", () => {
      var centsFormatter = Plottable.Formatters.currency(0, "c", false);
      var result = centsFormatter(1);
      assert.strictEqual(result.charAt(result.length-1), "c", "The specified currency symbol was appended");
    });
  });

  describe("time", () => {
    it("uses reasonable defaults", () => {
      var timeFormatter = Plottable.Formatters.time();
      // year, month, day, hours, minutes, seconds, milliseconds
      var result = timeFormatter(new Date(2000, 0, 1, 0, 0, 0, 0));
      assert.strictEqual(result, "2000", "only the year was displayed");
      result = timeFormatter(new Date(2000, 2, 1, 0, 0, 0, 0));
      assert.strictEqual(result, "Mar", "only the month was displayed");
      result = timeFormatter(new Date(2000, 2, 2, 0, 0, 0, 0));
      assert.strictEqual(result, "Thu 02", "month and date displayed");
      result = timeFormatter(new Date(2000, 2, 1, 20, 0, 0, 0));
      assert.strictEqual(result, "08 PM", "only hour was displayed");
      result = timeFormatter(new Date(2000, 2, 1, 20, 34, 0, 0));
      assert.strictEqual(result, "08:34", "hour and minute was displayed");
      result = timeFormatter(new Date(2000, 2, 1, 20, 34, 53, 0));
      assert.strictEqual(result, ":53", "seconds was displayed");
      result = timeFormatter(new Date(2000, 0, 1, 0, 0, 0, 950));
      assert.strictEqual(result, ".950", "milliseconds was displayed");
    });
  });

  describe("percentage", () => {
    it("uses reasonable defaults", ()=> {
      var percentFormatter = Plottable.Formatters.percentage();
      var result = percentFormatter(1);
      assert.strictEqual(result, "100%",
        "the value was multiplied by 100, a percent sign was appended, and no decimal places are shown by default");
    });
  });

  describe("time", () => {
    it("uses reasonable defaults", () => {
      var timeFormatter = Plottable.Formatters.time();
      // year, month, day, hours, minutes, seconds, milliseconds
      var result = timeFormatter(new Date(2000, 0, 1, 0, 0, 0, 0));
      assert.strictEqual(result, "2000", "only the year was displayed");
      result = timeFormatter(new Date(2000, 2, 1, 0, 0, 0, 0));
      assert.strictEqual(result, "Mar", "only the month was displayed");
      result = timeFormatter(new Date(2000, 2, 2, 0, 0, 0, 0));
      assert.strictEqual(result, "Thu 02", "month and date displayed");
      result = timeFormatter(new Date(2000, 2, 1, 20, 0, 0, 0));
      assert.strictEqual(result, "08 PM", "only hour was displayed");
      result = timeFormatter(new Date(2000, 2, 1, 20, 34, 0, 0));
      assert.strictEqual(result, "08:34", "hour and minute was displayed");
      result = timeFormatter(new Date(2000, 2, 1, 20, 34, 53, 0));
      assert.strictEqual(result, ":53", "seconds was displayed");
      result = timeFormatter(new Date(2000, 0, 1, 0, 0, 0, 950));
      assert.strictEqual(result, ".950", "milliseconds was displayed");
    });
  });

  describe("custom", () => {
    it("can take a custom formatting function", () => {
      var customFormatter = function(d: any) {
        return String(d) + "-blargh";
      };
      var result = customFormatter(1);
      assert.strictEqual(result, "1-blargh", "it uses the custom formatting function");
    });
  });

  describe("SISuffix", () => {
    it("shortens long numbers", () => {
      var lnFormatter = Plottable.Formatters.si();
      var result = lnFormatter(1);
      assert.strictEqual(result, "1.00", "shows 3 signifigicant figures by default");
      result = lnFormatter(Math.pow(10, 12));
      assert.operator(result.length, "<=", 5, "large number was formatted to a short string");
      result = lnFormatter(Math.pow(10, -12));
      assert.operator(result.length, "<=", 5, "small number was formatted to a short string");
    });
  });
});
