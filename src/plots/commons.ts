/*
Copyright 2014-present Palantir Technologies
Licensed under MIT (https://github.com/palantir/plottable/blob/master/LICENSE)
*/

import { Dataset } from "../core/dataset";
import { Point, Entity, Accessor } from "../core/interfaces";
import { Drawer } from "../drawers/drawer";
import { Plot } from "../plots/plot";
import { Scale, TransformableScale } from "../scales/scale";

/**
 * Computing the selection of an entity is an expensive operation. This object aims to
 * reproduce the behavior of the Plots.PlotEntity, excluding the selection, but including
 * drawer and validDatumIndex, which can be used to compute the selection.
 */
export interface LightweightPlotEntity {
  datum: any;
  dataset: Dataset;
  datasetIndex: number;
  position: Point;
  index: number;
  component: Plot;
  drawer: Drawer;
  validDatumIndex: number;
}

export interface PlotEntity extends Entity<Plot> {
  dataset: Dataset;
  datasetIndex: number;
  index: number;
  component: Plot;
}

export interface AccessorScaleBinding<D, R> {
  accessor: Accessor<any>;
  scale?: Scale<D, R>;
}

/**
 * TransformableAccessorScaleBinding mapping from property accessor to
 * TransformableScale. It is distinct from a plain AccessorScaleBinding
 * in that the scale is guaranteed to be invertable.
 */
export interface TransformableAccessorScaleBinding<D, R> {
  accessor: Accessor<any>;
  scale?: TransformableScale<D, R>;
}

export namespace Animator {
  export var MAIN = "main";
  export var RESET = "reset";
}

