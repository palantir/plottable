import { SimpleSelection } from "../../src/core/interfaces";
import * as d3 from "d3";

import * as Plottable from "../src";

export class FixedSizeComponent extends Plottable.Component {
  public fsWidth: number;
  public fsHeight: number;

  constructor(width = 0, height = 0) {
    super();
    this.fsWidth = width;
    this.fsHeight = height;
  }

  public requestedSpace(availableWidth: number, availableHeight: number): Plottable.SpaceRequest {
    return {
      minWidth: this.fsWidth,
      minHeight: this.fsHeight,
    };
  }

  public fixedWidth() {
    return true;
  }

  public fixedHeight() {
    return true;
  }
}

export class NoOpAnimator implements Plottable.Animator {
  /*
   * A do-nothing Animator.
   * Useful for testing the reset states of Plots by blanking the MAIN Animator.
   */

  public totalTime(selection: any) {
    return 0;
  }

  public animate(selection: SimpleSelection<any>) {
    return selection;
  }
}
