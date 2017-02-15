/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3/build/d3.node";

import { Animator } from "./animator";
import { AttributeToAppliedProjector, SimpleSelection } from "../core/interfaces";
/**
 * An animator implementation with no animation. The attributes are
 * immediately set on the selection.
 */
export class Null implements Animator {
  public totalTime(selection: any) {
    return 0;
  }

  public animate(selection: SimpleSelection<any>, attrToAppliedProjector: AttributeToAppliedProjector): SimpleSelection<any> {
    return selection.attrs(attrToAppliedProjector);
  }
}

