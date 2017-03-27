/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { AttributeToAppliedProjector, SimpleSelection } from "../core/interfaces";
import { coerceExternalD3 } from "../utils/coerceD3";
import { IAnimator } from "./animator";
/**
 * An animator implementation with no animation. The attributes are
 * immediately set on the selection.
 */
export class Null implements IAnimator {
  public totalTime(selection: any) {
    return 0;
  }

  public animate(selection: SimpleSelection<any>, attrToAppliedProjector: AttributeToAppliedProjector): SimpleSelection<any> {
    selection = coerceExternalD3(selection);
    return selection.attrs(attrToAppliedProjector);
  }
}
