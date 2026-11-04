/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Utils from "../utils";

import { Scale } from "./scale";

// Preserve the public D3 4 palette names removed in D3 5.
const CATEGORY20 = [
  "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c",
  "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5",
  "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f",
  "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5",
];

const CATEGORY20B = [
  "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939",
  "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39",
  "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b",
  "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6",
];

const CATEGORY20C = [
  "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d",
  "#fd8d3c", "#fdae6b", "#fdd0a2", "#31a354", "#74c476",
  "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8", "#bcbddc",
  "#dadaeb", "#636363", "#969696", "#bdbdbd", "#d9d9d9",
];

export class Color extends Scale<string, string> {

  private static _LOOP_LIGHTEN_FACTOR = 1.6;
  // The maximum number of colors we are getting from CSS stylesheets
  private static _MAXIMUM_COLORS_FROM_CSS = 256;

  private static _plottableColorCache: string[];

  private _domain: string[] = [];
  private _domainIndices = new Map<string, number>();
  private _range: string[];

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
    let range: readonly string[];
    switch (scaleType) {
      case null:
      case undefined:
        if (Color._plottableColorCache == null) {
          Color._plottableColorCache = Color._getPlottableColors();
        }
        range = Color._plottableColorCache;
        break;
      case "Category10":
      case "category10":
      case "10":
        range = d3.schemeCategory10;
        break;
      case "Category20":
      case "category20":
      case "20":
        range = CATEGORY20;
        break;
      case "Category20b":
      case "category20b":
      case "20b":
        range = CATEGORY20B;
        break;
      case "Category20c":
      case "category20c":
      case "20c":
        range = CATEGORY20C;
        break;
      default:
        throw new Error("Unsupported ColorScale type");
    }
    this._range = range.slice();
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
    const index = this._domainIndex(value);
    const color = this._range[index % this._range.length];
    const numLooped = Math.floor(index / this._range.length);
    if (numLooped === 0) {
      return color;
    }
    const modifyFactor = Math.log(numLooped * Color._LOOP_LIGHTEN_FACTOR + 1);
    return Utils.Color.lightenColor(color, modifyFactor);
  }

  private _domainIndex(value: string) {
    // Accessors read untyped data, so values can be numbers, and 1 and "1" must share a color
    const key = String(value);
    let index = this._domainIndices.get(key);
    if (index == null) {
      index = this._domain.push(value) - 1;
      this._domainIndices.set(key, index);
    }
    return index;
  }

  protected _getDomain() {
    return this._backingScaleDomain();
  }

  protected _backingScaleDomain(): string[];
  protected _backingScaleDomain(values: string[]): this;
  protected _backingScaleDomain(values?: string[]): any {
    if (values == null) {
      return this._domain.slice();
    } else {
      this._domain = [];
      this._domainIndices.clear();
      values.forEach((value) => this._domainIndex(value));
      return this;
    }
  }

  protected _getRange() {
    return this._range.slice();
  }

  protected _setRange(values: string[]) {
    this._range = values.slice();
  }
}
