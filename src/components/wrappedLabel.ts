/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { SpaceRequest } from "../core/interfaces";
import { Label } from "./label";

const DEFAULT_MAX_LINES = 2;

export class WrappedLabel extends Label {
  protected _maxLines: number = DEFAULT_MAX_LINES;

  public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
    this._wrapper.maxLines(this._maxLines);
    let offeredLineLength = this.angle() === 0 ? offeredWidth : offeredHeight;
    if (offeredLineLength === 0) {
      offeredLineLength = Infinity;
    }
    const wrapped = this._wrapper.wrap(this._text, this._measurer, offeredLineLength);
    const measuredWrap = this._measurer.measure(wrapped.wrappedText);
    const minWidth = (this.angle() === 0 ? measuredWrap.width : measuredWrap.height) + 2 * this.padding();
    const minHeight = (this.angle() === 0 ? measuredWrap.height : measuredWrap.width) + 2 * this.padding();
    return { minWidth, minHeight };
  }

  /**
   * Get the label max number of wrapped lines.
   */
  public maxLines(): number;
  /**
   * Set the label's max number of wrapped lines.
   * @param maxLines
   */
  public maxLines(maxLines: number): this;
  public maxLines(maxLines?: number): number | this {
    // allow user to un-set by passing in null or undefined explicitly
    if (arguments.length === 0) {
      return this._maxLines;
    }
    this._maxLines = maxLines;
    this.redraw();
    return this;
  }
}