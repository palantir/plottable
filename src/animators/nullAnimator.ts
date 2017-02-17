/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

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
    // coerce possibly external d3 instance into our own instance of d3 so we can use d3-selection-multi
    selection = d3.selectAll<d3.BaseType, void>(selection.nodes());
    return selection.attrs(attrToAppliedProjector);
  }
}

