/**
 * @fileoverview Tests the namespace structure to ensure all the exports we want to be available, are.
 */

import * as Plottable from "../src";

const test = [
  // namespaces and nested namespaces
  Plottable.Animators.Easing,
  Plottable.Animators.Null,
  Plottable.Axes.Category,
  Plottable.Axes.Numeric,
  Plottable.Components.AxisLabel,
  Plottable.Components.TitleLabel,
  Plottable.Components.Table,
  Plottable.Configs.SHOW_WARNINGS,
  Plottable.Dispatchers.Key,
  Plottable.Drawers.LineSVGDrawer,
  Plottable.Formatters.identity,
  Plottable.Plots.Pie,
  Plottable.Plots.Animator.MAIN,
  Plottable.RenderController.flush,
  Plottable.RenderPolicies.AnimationFrame,
  Plottable.Scales.Linear,
  Plottable.Scales.TickGenerators.integerTickGenerator,
  Plottable.SymbolFactories.circle,
  Plottable.TimeInterval.day,
  Plottable.Utils.Map,
  Plottable.Utils.Array.add,

  // classes on the Plottable namespace
  Plottable.Axis,
  Plottable.Component,
  Plottable.ComponentContainer,
  Plottable.Dataset,
  Plottable.Dispatcher,
  Plottable.ProxyDrawer,
  Plottable.Interaction,
  Plottable.Plot,
  Plottable.QuantitativeScale,
  Plottable.Scale,
  Plottable.XYPlot,
];

type TestInterfaces = Plottable.Axes.IDownsampleInfo
    | Plottable.Axes.TimeAxisConfiguration
    | Plottable.Plots.IAccessorScaleBinding<any, any>
    | Plottable.Scales.TickGenerators.ITickGenerator<any>
    | Plottable.Scales.IPaddingExceptionsProvider<any>
    | Plottable.IAccessor<any>
    | Plottable.IAnimator
    | Plottable.IDragLineCallback<any>
    | Plottable.DragBoxCallback
    | Plottable.IEntity<any>
    | Plottable.IScaleCallback<any>;

type TestTypeAliases = Plottable.Bounds
    | Plottable.ClickCallback
    | Plottable.DatasetCallback
    | Plottable.Formatter
    | Plottable.Point
    | Plottable.PointerCallback
    | Plottable.Projector
    | Plottable.Range
    | Plottable.SpaceRequest
    | Plottable.SymbolFactory
    | Plottable.TransformableScale<any, any>
    | Plottable.AxisOrientation;

const version = Plottable.version;
