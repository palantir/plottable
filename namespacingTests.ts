import * as Plottable from "./src";

var test = [
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
  Plottable.Drawers.Line,
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
  Plottable.Drawer,
  Plottable.Interaction,
  Plottable.Plot,
  Plottable.QuantitativeScale,
  Plottable.Scale,
  Plottable.XYPlot,
];

type TestInterfaces = Plottable.Axes.DownsampleInfo
  | Plottable.Axes.TimeAxisConfiguration
  | Plottable.Plots.AccessorScaleBinding<any, any>
  | Plottable.Scales.TickGenerators.TickGenerator<any>
  | Plottable.Scales.PaddingExceptionsProvider
  | Plottable.Accessor<any>
  | Plottable.Animator
  | Plottable.DragLineCallback<any>
  | Plottable.DragBoxCallback
  | Plottable.Entity<any>
  | Plottable.ScaleCallback<any>;


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
