module Plottable {
export module Animators {

  /**
   * Base for animators that animate specific attributes, such as Opacity, height... .
   */
  export class Bar extends Attr implements Animator {
    constructor() {
      super();
    };

    public animate(selection: d3.Selection<any>,
      attrToAppliedProjector: AttributeToAppliedProjector,
      drawingTarget?: Drawers.DrawingTarget): d3.Selection<any> | d3.Transition<any> {
      let yScale = this.yScale();
      let proj: AttributeToAppliedProjector = {
        height: function () { return 0; },
        y: function (d, i) { return yScale.scale(0); }
      };
      // set up timings
      let stageDuration = this.stepDuration() / 7;
      let exitStageDuration: number = (drawingTarget.exit.size() > 0 ? stageDuration * 2 : 0);
      let updateStageDuration: number = (drawingTarget.update.size() > 0 ? stageDuration * 2 : 0);
      let enterStageDuration: number = (drawingTarget.enter.size() > 0 ? stageDuration : 0);

      let squeezer = Plottable.EasingFunctions.squEase("linear-in-out", .5);
      // first kill the exiting  
      drawingTarget.exit = this.getTransition(drawingTarget.exit, exitStageDuration, undefined, squeezer)
        .attr(proj)
        .remove();

      let proj2: AttributeToAppliedProjector = {
        height: attrToAppliedProjector["height"],
        y: attrToAppliedProjector["y"]
      };

      drawingTarget.update = this.getTransition(drawingTarget.update, exitStageDuration);
      drawingTarget.update = this.getTransition(drawingTarget.update, updateStageDuration, undefined, squeezer)
        .attr(proj2);
      drawingTarget.update = this.getTransition(drawingTarget.update, updateStageDuration / 4)
          .attr({ "opacity": .6 });

      let proj3: AttributeToAppliedProjector = this.mergeAttrs(attrToAppliedProjector, { "opacity": () => { return .6; } });
      drawingTarget.update = this.getTransition(drawingTarget.update, updateStageDuration, undefined, squeezer)
        .attr(proj3);

      drawingTarget.update = this.getTransition(drawingTarget.update, 50)
        .attr(attrToAppliedProjector);
      let proj4: AttributeToAppliedProjector = this.mergeAttrs(attrToAppliedProjector, proj);
      <any>(drawingTarget.enter)
        .attr(proj4);

      drawingTarget.enter = this.getTransition(drawingTarget.enter, exitStageDuration + 2.25 * updateStageDuration);
      drawingTarget.enter = this.getTransition(drawingTarget.enter, enterStageDuration)
        .attr(attrToAppliedProjector);
      // set all the properties on the merge , save the transition returned
      return drawingTarget.merge;
    }
  }
}
}
