import { assert } from "chai";

import * as Plottable from "../../src";

describe("Formatters", () => {
  describe("fixed()", () => {
    it("shows correct amount of digits according to precision", () => {
      const fixed3 = Plottable.Formatters.fixed();
      assert.strictEqual(fixed3(1), "1.000", "shows three decimal places by defalut");
      assert.strictEqual(fixed3(-1), "-1.000", "shows three decimal places for negative integer");
      assert.strictEqual(fixed3(1.234), "1.234", "shows three decimal places for float");
      assert.strictEqual(fixed3(-1.234), "-1.234", "shows three decimal placesfor for negative float");
      assert.strictEqual(fixed3(1.2346111111), "1.235", "shows three decimal places for long float");
      assert.strictEqual(fixed3(-1.2346111111), "-1.235", "shows three decimal places for long negatvie float");
      assert.strictEqual(fixed3(123), "123.000", "shows three decimal places for integer");

      assert.strictEqual(fixed3(Infinity), "Infinity", "formats non-numeric number correctly");
      assert.strictEqual(fixed3(-Infinity), "-Infinity", "formats non-numeric number correctly");
      assert.strictEqual(fixed3(NaN), "NaN", "formats non-numeric number correctly");

      const fixed0 = Plottable.Formatters.fixed(0);
      assert.strictEqual(fixed0(1), "1", "shows no decimal places for integer");
      assert.strictEqual(fixed0(-1), "-1", "shows no decimal places for negative integer");
      assert.strictEqual(fixed0(1.23), "1", "shows no decimal places for float");
      assert.strictEqual(fixed0(-1.23), "-1", "shows no decimal places for negative float");
      assert.strictEqual(fixed0(123.456), "123", "shows no decimal places for integer");
    });

    it.skip("throws exception for non-numeric values", () => {
      const nonNumericValues = [null, undefined, "123", "abc", ""];
      const fixed = Plottable.Formatters.fixed();
      nonNumericValues.forEach((value) =>
        (<any> assert).throws(() => fixed(<any> value), Error,
          "error message TBD", `${value} is not a valid value for Formatter.fixed`),
      );
    });

    it("throws exception for invalid precision", () => {
      const nonIntegerValues = [null, 2.1, NaN, "5", "abc"];
      nonIntegerValues.forEach((value) =>
        (<any> assert).throws(() => Plottable.Formatters.fixed(<any> value), Error,
          "Formatter precision must be an integer", `${value} is not a valid precision value`),
      );

      const outOfBoundValues = [-1, 21, -Infinity, Infinity];
      outOfBoundValues.forEach((value) =>
        (<any> assert).throws(() => Plottable.Formatters.fixed(<any> value), Error,
          "Formatter precision must be between 0 and 20", `${value} is not a valid precision value`),
      );
    });
  });

  describe("general()", () => {
    it("shows correct amount of digits according to precision", () => {
      const general3 = Plottable.Formatters.general();
      assert.strictEqual(general3(1), "1", "does not pad 0 to three decimal places");
      assert.strictEqual(general3(-1), "-1", "does not pad 0 to three decimal places");
      assert.strictEqual(general3(1.234), "1.234", "shows up to three decimal places");
      assert.strictEqual(general3(-1.234), "-1.234", "shows up to three decimal places");
      assert.strictEqual(general3(1.2346), "1.235", "shows up to three decimal places");
      assert.strictEqual(general3(-1.2346), "-1.235", "shows up to three decimal places");

      const general2 = Plottable.Formatters.general(2);
      assert.strictEqual(general2(1), "1", "does not pad 0 to two decimal places");
      assert.strictEqual(general2(-1), "-1", "does not pad 0 to two decimal places");
      assert.strictEqual(general2(1.2), "1.2", "does not pad 0 to two decimal places");
      assert.strictEqual(general2(-1.2), "-1.2", "does not pad 0 to two decimal places");
      assert.strictEqual(general2(1.23), "1.23", "shows up to two decimal places");
      assert.strictEqual(general2(-1.23), "-1.23", "shows up to two decimal places");
      assert.strictEqual(general2(1.235), "1.24", "shows up to two decimal places");
      assert.strictEqual(general2(-1.235), "-1.24", "shows up to two decimal places");

      const general0 = Plottable.Formatters.general(0);
      assert.strictEqual(general0(1), "1", "shows no decimals");
      assert.strictEqual(general0(1.535), "2", "shows no decimals");
    });

    it("stringifies non-numeric values", () => {
      const general = Plottable.Formatters.general();
      const nonNumericValues = [null, undefined, Infinity, -Infinity, NaN, "123", "abc"];
      const stringifiedValues = ["null", "undefined", "Infinity", "-Infinity", "NaN", "123", "abc"];
      nonNumericValues.forEach((value, i) =>
        assert.strictEqual(general(value), stringifiedValues[i], `non-numeric input ${value} is stringified`),
      );
    });

    it("throws an error on invalid precision", () => {
      const nonIntegerValues = [null, 2.1, NaN, "5", "abc"];
      nonIntegerValues.forEach((value) =>
        (<any> assert).throws(() => Plottable.Formatters.general(<any> value), Error,
          "Formatter precision must be an integer", `${value} is not a valid precision value`),
      );

      const outOfBoundValues = [-1, 21, -Infinity, Infinity];
      outOfBoundValues.forEach((value) =>
        (<any> assert).throws(() => Plottable.Formatters.general(<any> value), Error,
          "Formatter precision must be between 0 and 20", `${value} is not a valid precision value`),
      );
    });
  });

  describe("identity()", () => {
    it("stringifies inputs", () => {
      const identity = Plottable.Formatters.identity();
      const values = [1, 0.999999, null, undefined, Infinity, -Infinity, NaN, "123", "abc", ""];
      const stringifiedValues = ["1", "0.999999", "null", "undefined", "Infinity", "-Infinity", "NaN", "123", "abc", ""];
      values.forEach((value, i) =>
        assert.strictEqual(identity(value), stringifiedValues[i], `${value} is stringified`),
      );
    });
  });

  describe("currency()", () => {
    it("formats values based on precision, symobl, and prefix correctly", () => {
      const defaultFormatter = Plottable.Formatters.currency();
      assert.strictEqual(defaultFormatter(1), "$1.00", "formatted correctly with default \"$\" prefix");
      assert.strictEqual(defaultFormatter(-1), "-$1.00", "formatted negative integer correctly with default \"$\" prefix");
      assert.strictEqual(defaultFormatter(1.999), "$2.00", "formatted correctly with default \"$\" prefix");
      assert.strictEqual(defaultFormatter(-1.234), "-$1.23", "formatted negative float correctly with default \"$\" prefix");

      const currencyFormatter0 = Plottable.Formatters.currency(0);
      assert.strictEqual(currencyFormatter0(1.1234), "$1", "formatted with correct precision");
      assert.strictEqual(currencyFormatter0(123), "$123", "formatted with correct precision");

      const poundFormatter = Plottable.Formatters.currency(2, "£");
      assert.strictEqual(poundFormatter(1.1234), "£1.12", "formatted with correct precision and \"£\" as prefix");
      assert.strictEqual(poundFormatter(-100.987), "-£100.99", "formatted with correct precision and \"£\" as prefix");

      const centsFormatter = Plottable.Formatters.currency(0, "c", false);
      assert.strictEqual(centsFormatter(1), "1c", "formatted correctly with \"c\" as suffix");
      assert.strictEqual(centsFormatter(-1), "-1c", "formatted correctly with \"c\" as suffix");
    });

    it("throws an error on invalid precision", () => {
      const nonIntegerValues = [null, 2.1, NaN, "5", "abc"];
      nonIntegerValues.forEach((value) =>
        (<any> assert).throws(() => Plottable.Formatters.currency(<any> value), Error,
          "Formatter precision must be an integer", `${value} is not a valid precision value`),
      );

      const outOfBoundValues = [-1, 21, -Infinity, Infinity];
      outOfBoundValues.forEach((value) =>
        (<any> assert).throws(() => Plottable.Formatters.currency(<any> value), Error,
          "Formatter precision must be between 0 and 20", `${value} is not a valid precision value`),
      );
    });

    it.skip("throws exception for non-numeric values", () => {
      const nonNumericValues: any[] = [null, undefined, "123", "abc", ""];
      // "$0.00", "$NaN", "$123.00", "$NaN", "$0.00"
      const defaultFormatter = Plottable.Formatters.currency();
      nonNumericValues.forEach((value) =>
        (<any> assert).throws(() => defaultFormatter(<any> value), Error,
          "error message TBD", `${value} is not a valid value for Formatter.currency`),
      );
    });

  });

  describe("multiTime()", () => {
    it("uses reasonable defaults", () => {
      const timeFormatter = Plottable.Formatters.multiTime();
      // year, month, day, hours, minutes, seconds, milliseconds
      assert.strictEqual(timeFormatter(new Date(2000, 0, 1, 0, 0, 0, 0)), "2000", "only the year was displayed");
      assert.strictEqual(timeFormatter(new Date(2000, 2, 1, 0, 0, 0, 0)), "Mar", "only the month was displayed");
      assert.strictEqual(timeFormatter(new Date(2000, 2, 5, 0, 0, 0, 0)), "Mar 05", "month and date displayed");
      assert.strictEqual(timeFormatter(new Date(2000, 2, 2, 0, 0, 0, 0)), "Thu 02", "day and date displayed");
      assert.strictEqual(timeFormatter(new Date(2000, 2, 1, 20, 0, 0, 0)), "08 PM", "only hour was displayed");
      assert.strictEqual(timeFormatter(new Date(2000, 2, 1, 20, 34, 0, 0)), "08:34", "hour and minute was displayed");
      assert.strictEqual(timeFormatter(new Date(2000, 2, 1, 20, 34, 53, 0)), ":53", "seconds was displayed");
      assert.strictEqual(timeFormatter(new Date(2000, 0, 1, 0, 0, 0, 950)), ".950", "milliseconds was displayed");
    });

    it.skip("throws exception for non-Date values", () => {
      const nonNumericValues = [null, undefined, NaN, "123", "abc", "", 0];
      const timeFormatter = Plottable.Formatters.multiTime();
      nonNumericValues.forEach((value) =>
        (<any> assert).throws(() => timeFormatter(<any> value), Error,
          "error message TBD", `${value} is not a valid value for Formatter.multiTime`),
      );
    });
  });

  describe("percentage()", () => {
    it("formats number to percetage with correct precision", () => {
      const percentFormatter = Plottable.Formatters.percentage();
      assert.strictEqual(percentFormatter(1), "100%",
        "the value was multiplied by 100, a percent sign was appended, and no decimal places are shown by default");
      assert.strictEqual(percentFormatter(0.07), "7%", "does not have trailing zeros and is not empty string");
      assert.strictEqual(percentFormatter(-0.355), "-36%", "negative values are formatted correctly");
      assert.strictEqual(percentFormatter(50), "5000%", "formats 2 digit integer correctly");

      const twoPercentFormatter = Plottable.Formatters.percentage(2);
      assert.strictEqual(twoPercentFormatter(0.0035), "0.35%", "works even if multiplying by 100 does not make it an integer");
      assert.strictEqual(twoPercentFormatter(-0.123), "-12.30%", "add 0 padding to make precision");
    });

    it.skip("formats non-numeric number correctly", () => {
      const percentFormatter = Plottable.Formatters.percentage();
      assert.strictEqual(percentFormatter(NaN), "NaN", "stringifies non-numeric number");
      assert.strictEqual(percentFormatter(Infinity), "Infinity", "stringifies non-numeric number");
      assert.strictEqual(percentFormatter(-Infinity), "-Infinity", "stringifies non-numeric number");
    });

    it("throws an error on invalid precision", () => {
      const nonIntegerValues = [null, 2.1, NaN, "5", "abc"];
      nonIntegerValues.forEach((value) =>
        (<any> assert).throws(() => Plottable.Formatters.percentage(<any> value), Error,
          "Formatter precision must be an integer", `${value} is not a valid precision value`),
      );

      const outOfBoundValues = [-1, 21, -Infinity, Infinity];
      outOfBoundValues.forEach((value) =>
        (<any> assert).throws(() => Plottable.Formatters.percentage(<any> value), Error,
          "Formatter precision must be between 0 and 20", `${value} is not a valid precision value`),
      );
    });

    it.skip("throws exception for non-numeric values", () => {
      const nonNumericValues = [null, undefined, "123", "abc", ""];
      const percentFormatter = Plottable.Formatters.percentage();
      nonNumericValues.forEach((value) =>
        (<any> assert).throws(() => percentFormatter(<any> value), Error,
          "error message TBD", `${value} is not a valid value for Formatter.percentage`),
      );
    });
  });

  describe("siSuffix()", () => {
    it("shortens long numbers", () => {
      const lnFormatter = Plottable.Formatters.siSuffix();
      assert.strictEqual(lnFormatter(1), "1.00", "shows 3 signifigicant figures by default");
      assert.operator(lnFormatter(Math.pow(10, 12)).length, "<=", 5, "large number was formatted to a short string");
      assert.operator(lnFormatter(Math.pow(10, -12)).length, "<=", 5, "small number was formatted to a short string");
      assert.strictEqual(lnFormatter(Math.pow(10, 5) * 1.55555), "156k", "formatting respects precision");
      assert.strictEqual(lnFormatter(-Math.pow(10, 6) * 23.456), "-23.5M", "formatting respects precision");

      const lnFormatter2 = Plottable.Formatters.siSuffix(2);
      assert.strictEqual(lnFormatter2(1), "1.0", "shows 2 signifigicant figures by default");
      assert.strictEqual(lnFormatter2(Math.pow(10, 5) * 1.55555), "160k", "formatting respects precision");
      assert.strictEqual(lnFormatter2(-Math.pow(10, 6) * 23.456), "-23M", "formatting respects precision");
    });

    it.skip("formats non-numeric number correctly", () => {
      const lnFormatter = Plottable.Formatters.siSuffix();
      assert.strictEqual(lnFormatter(NaN), "NaN", "stringifies non-numeric number");
      assert.strictEqual(lnFormatter(Infinity), "Infinity", "stringifies non-numeric number");
      assert.strictEqual(lnFormatter(-Infinity), "-Infinity", "stringifies non-numeric number");
    });

    it("throws an error on invalid precision", () => {
      const nonIntegerValues = [null, 2.1, NaN, "5", "abc"];
      nonIntegerValues.forEach((value) =>
        (<any> assert).throws(() => Plottable.Formatters.siSuffix(<any> value), Error,
          "Formatter precision must be an integer", `${value} is not a valid precision value`),
      );

      const outOfBoundValues = [-1, 21, -Infinity, Infinity];
      outOfBoundValues.forEach((value) =>
        (<any> assert).throws(() => Plottable.Formatters.siSuffix(<any> value), Error,
          "Formatter precision must be between 0 and 20", `${value} is not a valid precision value`),
      );
    });

    it.skip("throws exception for non-numeric values", () => {
      const nonNumericValues = [null, undefined, "123", "abc", ""];
      const lnFormatter = Plottable.Formatters.siSuffix();
      nonNumericValues.forEach((value) =>
        (<any> assert).throws(() => lnFormatter(<any> value), Error,
          "error message TBD", `${value} is not a valid value for Formatter.siSuffix`),
      );
    });
  });

  describe("shortScale()", () => {
    it("shortens long numbers", () => {
      const formatter = Plottable.Formatters.shortScale();
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
      assert.strictEqual(formatter(-0), "0.000", "-0 gets formatted well");

      assert.strictEqual(formatter(Infinity), "Infinity", "Infinity edge case");
      // this is actually failing because of d3 - see https://github.com/d3/d3-format/issues/42
      // assert.strictEqual(formatter(-Infinity), "-Infinity", "-Infinity edge case");
      assert.strictEqual(formatter(NaN), "NaN", "NaN edge case");

      assert.strictEqual(formatter(1e37), "1.000e+37", "large magnitute number use scientific notation");
      assert.strictEqual(formatter(1e-7), "1.000e-7", "small magnitude numbers use scientific notation");
    });

    it("respects the precision provided", () => {
      const formatter = Plottable.Formatters.shortScale(1);
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

      const formatter0 = Plottable.Formatters.shortScale(0);
      assert.strictEqual(formatter0(1), "1", "Just one decimal digit is added");
      assert.strictEqual(formatter0(999), "999", "Conversion to K happens in the same place (lower)");
      assert.strictEqual(formatter0(1000), "1K", "Conversion to K happens in the same place (upper)");

      assert.strictEqual(formatter0(999000000000000000), "999Q", "Largest positive short-scale representable number");
      assert.strictEqual(formatter0(999400000000000000), "999Q", "Largest positive short-scale representable number round-down");
      assert.strictEqual(formatter0(999500000000000000), "1e+18", "Largest positive short-scale representable number round-up");

      assert.strictEqual(formatter0(-999000000000000000), "-999Q", "Largest negative short-scale representable number");
      assert.strictEqual(formatter0(-999400000000000000), "-999Q", "Largest negative short-scale representable number round-down");
      assert.strictEqual(formatter0(-999500000000000000), "-1e+18", "Largest negative short-scale representable number round-up");

      assert.strictEqual(formatter0(0.9), "9e-1", "Round up is not applied for very small positive numbers");
      assert.strictEqual(formatter0(0), "0", "0 gets formatted well");
    });

    it("throws an error on invalid precision", () => {
      const nonIntegerValues = [null, 2.1, NaN, "5", "abc"];
      nonIntegerValues.forEach((value) =>
        (<any> assert).throws(() => Plottable.Formatters.shortScale(<any> value), Error,
          "Formatter precision must be an integer", `${value} is not a valid precision value`),
      );

      const outOfBoundValues = [-1, 21, -Infinity, Infinity];
      outOfBoundValues.forEach((value) =>
        (<any> assert).throws(() => Plottable.Formatters.shortScale(<any> value), Error,
          "Formatter precision must be between 0 and 20", `${value} is not a valid precision value`),
      );
    });
  });
});
