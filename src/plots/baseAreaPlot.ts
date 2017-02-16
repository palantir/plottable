/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Plots from "./";
import * as Utils from "../utils";

import { DrawerFactory, RenderAreaAccessor } from "./basePlot";

import { BaseLinePlot, ILinePlot } from "./baseLinePlot";

import { IComponent } from "../components";
import { Dataset } from "../core/dataset";
import { DrawStep } from "../drawers";
import * as Drawers from "../drawers";
import { IDrawer } from "../drawers/drawer";

import { Accessor, AttributeToProjector, Projector } from "../core/interfaces";
import { QuantitativeScale } from "../scales/quantitativeScale";

export interface IAreaPlot<X> extends ILinePlot<X> {
/**
   * Gets the AccessorScaleBinding for Y0.
   */
  y0(): Plots.AccessorScaleBinding<number, number>;
  /**
   * Sets Y0 to a constant number or the result of an Accessor<number>.
   * If a Scale has been set for Y, it will also be used to scale Y0.
   *
   * @param {number|Accessor<number>} y0
   * @returns {Area} The calling Area Plot.
   */
  y0(y0: number | Accessor<number>): this;
  y0(y0?: number | Accessor<number>): any;
}

export class BaseAreaPlot<X> extends BaseLinePlot<X> implements IAreaPlot<X> {
  private static _Y0_KEY = "y0";

  private _constantBaselineValueProvider: () => number[];
  private _lineDrawers = new Utils.Map<Dataset, IDrawer>();
  private _lineDrawerFactory: DrawerFactory;

  constructor(drawerFactory: DrawerFactory, lineDrawerFactory: DrawerFactory, component: IComponent<any>) {
    super(drawerFactory, component);
    this._lineDrawerFactory = lineDrawerFactory;
  }

  public renderArea(): d3.Selection<void>;
  public renderArea(renderArea: d3.Selection<void> | RenderAreaAccessor): this;
  public renderArea(renderArea?: d3.Selection<void> | RenderAreaAccessor): any {
    const superRenderArea = super.renderArea(renderArea);
    if (renderArea === undefined) {
        return superRenderArea;
    }

    // set the render area for all the line drawers of this plot
    this.datasets().forEach((dataset) => {
      this._lineDrawers.get(dataset).renderArea(this._renderArea(dataset));
    });

    return this;
  }

  public renderImmediately() {
    // draw the line above the area
    let drawSteps = this._generateLineDrawSteps();
    let dataToDraw = this._getDataToDraw();
    this.datasets().forEach((dataset) => this._lineDrawers.get(dataset).draw(dataToDraw.get(dataset), drawSteps));

    super.renderImmediately();

    return this;
  }

  public y(y?: number | Accessor<number>, yScale?: QuantitativeScale<number>): any {
    if (y == null) {
      return super.y();
    }

    if (yScale == null) {
      super.y(y);
    } else {
      super.y(y, yScale);
    }

    if (yScale != null) {
      let y0 = this.y0().accessor;
      if (y0 != null) {
        this._bindProperty(BaseAreaPlot._Y0_KEY, y0, yScale);
      }
      this._updateYScale();
    }

    return this;
  }

  public y0(y0?: number | Accessor<number>): any {
    if (y0 == null) {
      return this._propertyBindings.get(BaseAreaPlot._Y0_KEY);
    }
    let yBinding = this.y();
    let yScale = yBinding && yBinding.scale;
    this._bindProperty(BaseAreaPlot._Y0_KEY, y0, yScale);
    this._updateYScale();
    return this;
  }

  protected _addDataset(dataset: Dataset) {
    let lineDrawer = this._lineDrawerFactory(dataset);
    if (this._renderArea != null) {
      lineDrawer.renderArea(this._renderArea(dataset));
    }
    this._lineDrawers.set(dataset, lineDrawer);
    super._addDataset(dataset);
    return this;
  }

  protected _constructAreaProjector(xProjector: Projector, yProjector: Projector, y0Projector: Projector) {
    let definedProjector = (d: any, i: number, dataset: Dataset) => {
      let positionX = BaseAreaPlot._scaledAccessor(this.x())(d, i, dataset);
      let positionY = BaseAreaPlot._scaledAccessor(this.y())(d, i, dataset);
      return Utils.Math.isValidNumber(positionX) && Utils.Math.isValidNumber(positionY);
    };
    return (datum: any[], index: number, dataset: Dataset) => {
      let areaGenerator = d3.svg.area()
        .x((innerDatum, innerIndex) => xProjector(innerDatum, innerIndex, dataset))
        .y1((innerDatum, innerIndex) => yProjector(innerDatum, innerIndex, dataset))
        .y0((innerDatum, innerIndex) => y0Projector(innerDatum, innerIndex, dataset))
        .interpolate(this.interpolator())
        .defined((innerDatum, innerIndex) => definedProjector(innerDatum, innerIndex, dataset));
      return areaGenerator(datum);
    };
  }

  protected _generateDrawSteps(): DrawStep[] {
    let drawSteps: DrawStep[] = [];
    if (this._animateOnNextRender()) {
      let attrToProjector = this._generateAttrToProjector();
      attrToProjector["d"] = this._constructAreaProjector(BaseAreaPlot._scaledAccessor(this.x()),
        this._getResetYFunction(),
        BaseAreaPlot._scaledAccessor(this.y0()));
      drawSteps.push({ attrToProjector: attrToProjector, animator: this._getAnimator(Plots.Animator.RESET) });
    }

    drawSteps.push({
      attrToProjector: this._generateAttrToProjector(),
      animator: this._getAnimator(Plots.Animator.MAIN)
    });

    return drawSteps;
  }

  protected _generateLineDrawSteps() {
    let drawSteps: DrawStep[] = [];
    if (this._animateOnNextRender()) {
      let attrToProjector = this._generateLineAttrToProjector();
      attrToProjector["d"] = this._constructLineProjector(BaseAreaPlot._scaledAccessor(this.x()), this._getResetYFunction());
      drawSteps.push({ attrToProjector: attrToProjector, animator: this._getAnimator(Plots.Animator.RESET) });
    }
    drawSteps.push({
      attrToProjector: this._generateLineAttrToProjector(),
      animator: this._getAnimator(Plots.Animator.MAIN)
    });
    return drawSteps;
  }

  protected _getResetYFunction() {
    return BaseAreaPlot._scaledAccessor(this.y0());
  }

  protected _onDatasetUpdate(dataset?: Dataset) {
    super._onDatasetUpdate(dataset);
    this._updateYScale();
  }

  protected _propertyProjectors(): AttributeToProjector {
    let propertyToProjectors = super._propertyProjectors();
    propertyToProjectors["d"] = this._constructAreaProjector(BaseAreaPlot._scaledAccessor(this.x()),
      BaseAreaPlot._scaledAccessor(this.y()),
      BaseAreaPlot._scaledAccessor(this.y0()));
    return propertyToProjectors;
  }

  protected _removeDataset(dataset: Dataset) {
    super._removeDataset(dataset);

    if (this.datasets().indexOf(dataset) === -1) {
      return this;
    }

    const lineDrawer = this._lineDrawers.get(dataset);
    lineDrawer.remove();

    this._lineDrawers.delete(dataset);
    return this;
  }

  protected _updateYScale() {
    let extents = this._propertyExtents.get("y0");
    let extent = Utils.Array.flatten<number>(extents);
    let uniqExtentVals = Utils.Array.uniq<number>(extent);
    let constantBaseline = uniqExtentVals.length === 1 ? uniqExtentVals[0] : null;

    let yBinding = this.y();
    let yScale = <QuantitativeScale<number>> (yBinding && yBinding.scale);
    if (yScale == null) {
      return;
    }

    if (this._constantBaselineValueProvider != null) {
      yScale.removePaddingExceptionsProvider(this._constantBaselineValueProvider);
      this._constantBaselineValueProvider = null;
    }

    if (constantBaseline != null) {
      this._constantBaselineValueProvider = () => [constantBaseline];
      yScale.addPaddingExceptionsProvider(this._constantBaselineValueProvider);
    }
  }

  private _generateLineAttrToProjector() {
    let lineAttrToProjector = this._generateAttrToProjector();
    lineAttrToProjector["d"] = this._constructLineProjector(BaseAreaPlot._scaledAccessor(this.x()), BaseAreaPlot._scaledAccessor(this.y()));
    return lineAttrToProjector;
  }
}
