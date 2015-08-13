///<reference path="../testReference.ts" />

describe("Formatters", () => {
  describe("fixed", () => {
    it("shows exactly [precision] digits", () => {
      let fixed3 = Plottable.Formatters.fixed();
      let result = fixed3(1);
      assert.strictEqual(result, "1.000", "defaults to three decimal places");
      result = fixed3(1.234);
      assert.strictEqual(result, "1.234", "shows three decimal places");
      result = fixed3(1.2346);
      assert.strictEqual(result, "1.235", "changed values are not shown (get turned into empty strings)");
    });

    it("precision can be changed", () => {
      let fixed2 = Plottable.Formatters.fixed(2);
      let result = fixed2(1);
      assert.strictEqual(result, "1.00", "formatter was changed to show only two decimal places");
    });

    it("can be set to show rounded values", () => {
      let fixed3 = Plottable.Formatters.fixed(3);
      let result = fixed3(1.2349);
      assert.strictEqual(result, "1.235", "long values are rounded correctly");
    });

    it("non-integer precision throws exception", () => {
      assert.throws(() => Plottable.Formatters.fixed(2.1)(123.313), "Formatter precision must be an integer");
    });
  });

  describe("general", () => {
    it("formats number to show at most [precision] digits", () => {
      let general = Plottable.Formatters.general();
      let result = general(1);
      assert.strictEqual(result, "1", "shows no decimals if formatting an integer");
      result = general(1.234);
      assert.strictEqual(result, "1.234", "shows up to three decimal places");
      result = general(1.2345);
      assert.strictEqual(result, "1.235", "(changed) values with more than three decimal places are not shown");
    });

    it("stringifies non-number values", () => {
      let general = Plottable.Formatters.general();
      let result = general("blargh");
      assert.strictEqual(result, "blargh", "string values are passed through unchanged");
      result = general(null);
      assert.strictEqual(result, "null", "non-number inputs are stringified");
    });

    it("throws an error on strange precision", () => {
      assert.throws(() => {
          Plottable.Formatters.general(-1);
      });
      assert.throws(() => {
          Plottable.Formatters.general(100);
      });
    });

    it("non-integer precision throws error", () => {
      assert.throws(() => Plottable.Formatters.general(2.1)(123.313), "Formatter precision must be an integer");
    });
  });

  describe("identity", () => {
    it("stringifies inputs", () => {
      let identity = Plottable.Formatters.identity();
      let result = identity(1);
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
      let currencyFormatter = Plottable.Formatters.currency();
      let result = currencyFormatter(1);
      assert.strictEqual(result.charAt(0), "$", "defaults to $ for currency symbol");
      let decimals = result.substring(result.indexOf(".") + 1, result.length);
      assert.strictEqual(decimals.length, 2, "defaults to 2 decimal places");

      result = currencyFormatter(-1);
      assert.strictEqual(result.charAt(0), "-", "prefixes negative values with \"-\"");
      assert.strictEqual(result.charAt(1), "$", "places the currency symbol after the negative sign");
    });

    it("can change the type and position of the currency symbol", () => {
      let centsFormatter = Plottable.Formatters.currency(0, "c", false);
      let result = centsFormatter(1);
      assert.strictEqual(result.charAt(result.length - 1), "c", "The specified currency symbol was appended");
    });

    it("non-integer precision throws exception", () => {
      assert.throws(() => Plottable.Formatters.currency(2.1)(123.313), "Formatter precision must be an integer");
    });

  });

  describe("multiTime", () => {
    it("uses reasonable defaults", () => {
      let timeFormatter = Plottable.Formatters.multiTime();
      // year, month, day, hours, minutes, seconds, milliseconds
      let result = timeFormatter(new Date(2000, 0, 1, 0, 0, 0, 0));
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
    it("uses reasonable defaults", () => {
      let percentFormatter = Plottable.Formatters.percentage();
      let result = percentFormatter(1);
      assert.strictEqual(result, "100%",
        "the value was multiplied by 100, a percent sign was appended, and no decimal places are shown by default");
    });

    it("can handle float imprecision", () => {
      let percentFormatter = Plottable.Formatters.percentage();
      let result = percentFormatter(0.07);
      assert.strictEqual(result, "7%", "does not have trailing zeros and is not empty string");
      let twoPercentFormatter = Plottable.Formatters.percentage(2);
      let result2 = twoPercentFormatter(0.0035);
      assert.strictEqual(result2, "0.35%", "works even if multiplying by 100 does not make it an integer");
    });

    it("onlyShowUnchanged set to false", () => {
      let percentFormatter = Plottable.Formatters.percentage(0);
      let result = percentFormatter(0.075);
      assert.strictEqual(result, "8%", "shows formatter changed value");
    });

    it("non-integer precision throws exception", () => {
      assert.throws(() => Plottable.Formatters.percentage(2.1)(0.313), "Formatter precision must be an integer");
    });
  });

  describe("multiTime", () => {
    it("uses reasonable defaults", () => {
      let timeFormatter = Plottable.Formatters.multiTime();
      // year, month, day, hours, minutes, seconds, milliseconds
      let result = timeFormatter(new Date(2000, 0, 1, 0, 0, 0, 0));
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

  describe("SISuffix", () => {
    it("shortens long numbers", () => {
      let lnFormatter = Plottable.Formatters.siSuffix();
      let result = lnFormatter(1);
      assert.strictEqual(result, "1.00", "shows 3 signifigicant figures by default");
      result = lnFormatter(Math.pow(10, 12));
      assert.operator(result.length, "<=", 5, "large number was formatted to a short string");
      result = lnFormatter(Math.pow(10, -12));
      assert.operator(result.length, "<=", 5, "small number was formatted to a short string");
    });

    it("non-integer precision throws exception", () => {
      assert.throws(() => Plottable.Formatters.siSuffix(2.1)(123.313), "Formatter precision must be an integer");
    });
  });

  describe("shortScale", () => {
    it("shortens long numbers", () => {
      let formatter = Plottable.Formatters.shortScale();
      assert.strictEqual(formatter(1), "1.000", "small numbers format simply");
      assert.strictEqual(formatter(-1), "-1.000", "negative small numbers format simply");

      assert.strictEqual(formatter(2e3), "2.000K", "thousands numbers format using short scale magnitudes");
      assert.strictEqual(formatter(2e6), "2.000M", "millions numbers format using short scale magnitudes");
      assert.strictEqual(formatter(2e9), "2.000B", "billions numbers format using short scale magnitudes");
      assert.strictEqual(formatter(2e12), "2.000T", "trillions magnitude numbers format using short scale magnitudes");
      assert.strictEqual(formatter(2e15), "2.000Q", "quadrillions numbers format using short scale magnitudes");

      assert.strictEqual(formatter(999.999), "999.999", "boundary cases are correct");
      assert.strictEqual(formatter(999.99999), "1.000K", "rounding cases are correct");
      assert.strictEqual(formatter(-999.99999), "-1.000K", "negative rounding cases are correct");
      assert.strictEqual(formatter(1000000), "1.000M", "boundary cases are correct");

      assert.strictEqual(formatter(999999000000000000), "999.999Q", "Largest positive short-scale representable number");
      assert.strictEqual(formatter(999999400000000000), "999.999Q", "Largest positive short-scale representable number round-down");
      assert.strictEqual(formatter(999999500000000000), "1.000e+18", "Largest positive short-scale non-representable number round-up");
      assert.strictEqual(formatter(1e17), "100.000Q", "Last positive round short-scale representable number");
      assert.strictEqual(formatter(1e18), "1.000e+18", "First positive round short-scale non-representable number");

      assert.strictEqual(formatter(-999999000000000000), "-999.999Q", "Largest negative short-scale representable number");
      assert.strictEqual(formatter(999999400000000000), "999.999Q", "Largest negative short-scale representable number round-down");
      assert.strictEqual(formatter(999999500000000000), "1.000e+18", "Largest negative short-scale non-representable number round-up");
      assert.strictEqual(formatter(-1e17), "-100.000Q", "Last negative round short-scale representable number");
      assert.strictEqual(formatter(-1e18), "-1.000e+18", "First negative round short-scale non-representable number");

      assert.strictEqual(formatter(0.001), "0.001", "Smallest positive short-scale representable number");
      assert.strictEqual(formatter(0.0009), "9.000e-4", "Round up is not applied for very small positive numbers");

      assert.strictEqual(formatter(-0.001), "-0.001", "Smallest negative short-scale representable number");
      assert.strictEqual(formatter(-0.0009), "-9.000e-4", "Round up is not applied for very small negative numbers");

      assert.strictEqual(formatter(0), "0.000", "0 gets formatted well");
      assert.strictEqual(formatter(-0), "-0.000", "-0 gets formatted well");

      assert.strictEqual(formatter(Infinity), "Infinity", "Infinity edge case");
      assert.strictEqual(formatter(-Infinity), "-Infinity", "-Infinity edge case");
      assert.strictEqual(formatter(NaN), "NaN", "NaN edge case");

      assert.strictEqual(formatter(1e37), "1.000e+37", "large magnitute number use scientific notation");
      assert.strictEqual(formatter(1e-7), "1.000e-7", "small magnitude numbers use scientific notation");
    });

    it("respects the precision provided", () => {
      let formatter = Plottable.Formatters.shortScale(1);
      assert.strictEqual(formatter(1), "1.0", "Just one decimal digit is added");
      assert.strictEqual(formatter(999), "999.0", "Conversion to K happens in the same place (lower)");
      assert.strictEqual(formatter(1000), "1.0K", "Conversion to K happens in the same place (upper)");

      assert.strictEqual(formatter(999900000000000000), "999.9Q", "Largest positive short-scale representable number");
      assert.strictEqual(formatter(999940000000000000), "999.9Q", "Largest positive short-scale representable number round-down");
      assert.strictEqual(formatter(999950000000000000), "1.0e+18", "Largest positive short-scale representable number round-up");

      assert.strictEqual(formatter(-999900000000000000), "-999.9Q", "Largest negative short-scale representable number");
      assert.strictEqual(formatter(-999940000000000000), "-999.9Q", "Largest negative short-scale representable number round-down");
      assert.strictEqual(formatter(-999950000000000000), "-1.0e+18", "Largest negative short-scale representable number round-up");

      assert.strictEqual(formatter(0.1), "0.1", "Smallest positive short-scale representable number");
      assert.strictEqual(formatter(0.09), "9.0e-2", "Round up is not applied for very small positive numbers");

      assert.strictEqual(formatter(-0.1), "-0.1", "Smallest negative short-scale representable number");
      assert.strictEqual(formatter(-0.09), "-9.0e-2", "Round up is not applied for very small negative numbers");

      assert.strictEqual(formatter(0), "0.0", "0 gets formatted well");
    });

    it("0 as precision also works and uses integers only", () => {
      let formatter = Plottable.Formatters.shortScale(0);
      assert.strictEqual(formatter(1), "1", "Just one decimal digit is added");
      assert.strictEqual(formatter(999), "999", "Conversion to K happens in the same place (lower)");
      assert.strictEqual(formatter(1000), "1K", "Conversion to K happens in the same place (upper)");

      assert.strictEqual(formatter(999000000000000000), "999Q", "Largest positive short-scale representable number");
      assert.strictEqual(formatter(999400000000000000), "999Q", "Largest positive short-scale representable number round-down");
      assert.strictEqual(formatter(999500000000000000), "1e+18", "Largest positive short-scale representable number round-up");

      assert.strictEqual(formatter(-999000000000000000), "-999Q", "Largest negative short-scale representable number");
      assert.strictEqual(formatter(-999400000000000000), "-999Q", "Largest negative short-scale representable number round-down");
      assert.strictEqual(formatter(-999500000000000000), "-1e+18", "Largest negative short-scale representable number round-up");

      assert.strictEqual(formatter(0.9), "9e-1", "Round up is not applied for very small positive numbers");
      assert.strictEqual(formatter(0), "0", "0 gets formatted well");
    });

    it("non-integer precision throws exception", () => {
      assert.throws(() => Plottable.Formatters.shortScale(2.1)(123.313), "Formatter precision must be an integer");
    });
  });

  describe("relativeDate", () => {
    it("uses reasonable defaults", () => {
      let relativeDateFormatter = Plottable.Formatters.relativeDate();
      let result = relativeDateFormatter(7 * Plottable.MILLISECONDS_IN_ONE_DAY);
      assert.strictEqual(result, "7", "7 day difference from epoch, incremented by days, no suffix");
    });

    it("resulting value is difference from base value", () => {
      let relativeDateFormatter = Plottable.Formatters.relativeDate(5 * Plottable.MILLISECONDS_IN_ONE_DAY);
      let result = relativeDateFormatter(9 * Plottable.MILLISECONDS_IN_ONE_DAY);
      assert.strictEqual(result, "4", "4 days greater from base value");
      result = relativeDateFormatter(Plottable.MILLISECONDS_IN_ONE_DAY);
      assert.strictEqual(result, "-4", "4 days less from base value");
    });

    it("can increment by different time types (hours, minutes)", () => {
      let hoursRelativeDateFormatter = Plottable.Formatters.relativeDate(0, Plottable.MILLISECONDS_IN_ONE_DAY / 24);
      let result = hoursRelativeDateFormatter(3 * Plottable.MILLISECONDS_IN_ONE_DAY);
      assert.strictEqual(result, "72", "72 hour difference from epoch");

      let minutesRelativeDateFormatter = Plottable.Formatters.relativeDate(0, Plottable.MILLISECONDS_IN_ONE_DAY / (24 * 60));
      result = minutesRelativeDateFormatter(3 * Plottable.MILLISECONDS_IN_ONE_DAY);
      assert.strictEqual(result, "4320", "4320 minute difference from epoch");
    });

    it("can append a suffix", () => {
      let relativeDateFormatter = Plottable.Formatters.relativeDate(0, Plottable.MILLISECONDS_IN_ONE_DAY, "days");
      let result = relativeDateFormatter(7 * Plottable.MILLISECONDS_IN_ONE_DAY);
      assert.strictEqual(result, "7days", "days appended to the end");
    });
  });
});
