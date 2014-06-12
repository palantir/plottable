///<reference path="testReference.ts" />

before(() => {
  // Set the render policy to immediate to make sure ETE tests can check DOM change immediately
  Plottable.Core.RenderController.setRenderPolicy(new Plottable.Core.RenderController.RenderPolicy.Immediate());
  Plottable.Abstract.Component.AUTORESIZE_BY_DEFAULT = false;
});
