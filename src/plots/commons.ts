/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Dataset } from "../core/dataset";
import { IAccessor, IEntity, Point } from "../core/interfaces";
import { IDrawer } from "../drawers/drawer";
import { Plot } from "../plots/plot";
import { Scale, TransformableScale } from "../scales/scale";

/**
 * Computing the selection of an entity is an expensive operation. This object aims to
 * reproduce the behavior of the Plots.PlotEntity, excluding the selection, but including
 * drawer and validDatumIndex, which can be used to compute the selection.
 */
export interface ILightweightPlotEntity {
  datum: any;
  dataset: Dataset;
  datasetIndex: number;
  position: Point;
  index: number;
  component: Plot;
  drawer: IDrawer;
  validDatumIndex: number;
}

export interface IPlotEntity extends IEntity<Plot> {
  dataset: Dataset;
  datasetIndex: number;
  index: number;
  component: Plot;
}

export interface IAccessorScaleBinding<D, R> {
  /**
   * The (possibly upcasted to a function) user defined accessor.
   *
   * The first argument in `plot.x((d) => d.x, scale)`.
   */
  accessor: IAccessor<any>;
  /**
   * The Scale that the accessor's result gets passed through.
   *
   * The second argument in `plot.x((d) => d.x, scale)`.
   */
  scale?: Scale<D, R>;
}

/**
 * TransformableAccessorScaleBinding mapping from property accessor to
 * TransformableScale. It is distinct from a plain AccessorScaleBinding
 * in that the scale is guaranteed to be invertable.
 */
export interface ITransformableAccessorScaleBinding<D, R> {
  accessor: IAccessor<any>;
  scale?: TransformableScale<D, R>;
}

export namespace Animator {
  export let MAIN = "main";
  export let RESET = "reset";
}
