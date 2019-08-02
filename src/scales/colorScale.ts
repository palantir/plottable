/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Utils from "../utils";

import { Scale } from "./scale";

/**
 * Workaround for bad d3 behavior.
 *
 * d3's color scales, which are oridinal scales, have side-effects when invoked.
 * When you call the `scale(value)` as a function, it will implicitly add new
 * values to the domain.
 *
 * These side-effects cause us to rely on looking up the current scale state
 * with the `.domain()` and `.range()` methods. However, these methods have poor
 * performance implications since they will always slice their internal values
 * before returning. Inside the inner render loop of color scatter plot points,
 * these slices add up.
 */
class ImplicitSeriesTracker {
  public count = 0;
  private tracker: Record<string, number> = {};

  public getIndex(value: string) {
    if (this.tracker[value] != null) {
      return this.tracker[value];
    } else{
      const idx = this.count;
      this.tracker[value] = idx;
      this.count += 1;
      return idx;
    }
  }

  public clear() {
    this.count = 0;
    this.tracker = {};
  }
}

export class Color extends Scale<string, string> {

  private static _LOOP_LIGHTEN_FACTOR = 1.6;
  // The maximum number of colors we are getting from CSS stylesheets
  private static _MAXIMUM_COLORS_FROM_CSS = 256;

  private static _plottableColorCache: string[];

  private _d3Scale: d3.ScaleOrdinal<string, string>;
  // Cache the number of range value to avoid calling `scale.range().length`
  private _rangeLength = 1;
  private _tracker = new ImplicitSeriesTracker();

  /**
   * A Color Scale maps string values to color hex values expressed as a string.
   *
   * @constructor
   * @param {string} [scaleType] One of "Category10"/"Category20"/"Category20b"/"Category20c".
   *   (see https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors)
   *   If not supplied, reads the colors defined using CSS -- see plottable.css.
   */
  constructor(scaleType?: string) {
    super();
    let scale: d3.ScaleOrdinal<string, string>;
    switch (scaleType) {
      case null:
      case undefined:
        if (Color._plottableColorCache == null) {
          Color._plottableColorCache = Color._getPlottableColors();
        }
        scale = d3.scaleOrdinal<string, string>().range(Color._plottableColorCache);
        break;
      case "Category10":
      case "category10":
      case "10":
        scale = d3.scaleOrdinal(d3.schemeCategory10);
        break;
      case "Category20":
      case "category20":
      case "20":
        scale = d3.scaleOrdinal(d3.schemeCategory20);
        break;
      case "Category20b":
      case "category20b":
      case "20b":
        scale = d3.scaleOrdinal(d3.schemeCategory20b);
        break;
      case "Category20c":
      case "category20c":
      case "20c":
        scale = d3.scaleOrdinal(d3.schemeCategory20c);
        break;
      default:
        throw new Error("Unsupported ColorScale type");
    }
    this._d3Scale = scale;
    this._rangeLength = this._d3Scale.range().length;
  }

  public extentOfValues(values: string[]) {
    return Utils.Array.uniq(values);
  }

  // Duplicated from OrdinalScale._getExtent - should be removed in #388
  protected _getExtent(): string[] {
    return Utils.Array.uniq(this._getAllIncludedValues());
  }

  public static invalidateColorCache() {
    Color._plottableColorCache = null;
  }

  private static _getPlottableColors(): string[] {
    const plottableDefaultColors: string[] = [];
    const colorTester = d3.select("body").append("plottable-color-tester");

    const defaultColorHex: string = Utils.Color.colorTest(colorTester, "");
    let i = 0;
    let colorHex = Utils.Color.colorTest(colorTester, "plottable-colors-0");
    while (colorHex != null && i < this._MAXIMUM_COLORS_FROM_CSS) {
      if (colorHex === defaultColorHex && colorHex === plottableDefaultColors[plottableDefaultColors.length - 1]) {
        break;
      }
      plottableDefaultColors.push(colorHex);
      i++;
      colorHex = Utils.Color.colorTest(colorTester, `plottable-colors-${i}`);
    }
    colorTester.remove();

    return plottableDefaultColors;
  }

  /**
   * Returns the color-string corresponding to a given string.
   *
   * If there are not enough colors in the range(), a lightened version of an
   * existing color will be used.
   *
   * @param {string} value
   * @returns {string}
   */
  public scale(value: string): string {
    const color = this._d3Scale(value);
    const index = this._tracker.getIndex(value);
    const numLooped = Math.floor(index / this._rangeLength);
    if (numLooped === 0) {
      return color;
    }
    const modifyFactor = Math.log(numLooped * Color._LOOP_LIGHTEN_FACTOR + 1);
    return Utils.Color.lightenColor(color, modifyFactor);
  }

  protected _getDomain() {
    return this._backingScaleDomain();
  }

  protected _backingScaleDomain(): string[];
  protected _backingScaleDomain(values: string[]): this;
  protected _backingScaleDomain(values?: string[]): any {
    if (values == null) {
      return this._d3Scale.domain();
    } else {
      this._d3Scale.domain(values);
      this._tracker.clear();
      return this;
    }
  }

  protected _getRange() {
    return this._d3Scale.range();
  }

  protected _setRange(values: string[]) {
    this._d3Scale.range(values);
    this._rangeLength = values.length;
  }
}
