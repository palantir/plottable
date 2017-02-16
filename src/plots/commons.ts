/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { IComponent } from "../components";
import { Dataset } from "../core/dataset";
import { Point, SVGEntity, Entity, Accessor } from "../core/interfaces";
import { Drawer, IDrawer } from "../drawers/drawer";
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
  component: IComponent<any>;
  drawer: IDrawer;
  validDatumIndex: number;
}

export interface PlotEntity extends Entity<IComponent<any>> {
  dataset: Dataset;
  datasetIndex: number;
  index: number;
  component: IComponent<any>;
}

export type SVGPlotEntity = SVGEntity<IComponent<any>> & PlotEntity;

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

