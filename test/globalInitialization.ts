///<reference path="testReference.ts" />

interface Window {
  PHANTOMJS: boolean;
  Pixel_CloseTo_Requirement: number;
}

before(() => {
  // Set the render policy to immediate to make sure ETE tests can check DOM change immediately
  Plottable.Core.RenderController.setRenderPolicy(new Plottable.Core.RenderController.RenderPolicy.Immediate());
  window.Pixel_CloseTo_Requirement = window.PHANTOMJS ? 2 : 0.5;
});
