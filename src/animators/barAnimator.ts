namespace Plottable.Animators {
  /**
   * A "staged" animation specific for bar charts
   * Animates exit, update and enter in sequence
   */
  export class Bar extends Attr implements Animator {
    private _rhythm: number;
    private _stageUpdate: boolean;

    constructor() {
      super();
      this._rhythm = .5;
      this._stageUpdate = true;
    };

    /**
     * Sets the relationship between activity and waits in the major steps in the animation (0 to 1)
     * Applied using a squEase easing function
     *
     * @returns {number} The current rhythm.
     */
    public rhythm(): number;
    /**
     * @param {number} rhythm the rhythm to apply to the major steps in the animation.
     * @returns {Bar} The calling Animator.
     */
    public rhythm(rhythm: number): Bar;
    public rhythm(rhythm?: number): any {
      if (rhythm == null) {
        return this._rhythm;
      } else {
        this._rhythm = rhythm;
        return this;
      }
    }

    /**
     * Specify whether to split the rendering of the Update selection into two stages
     *
     * @returns {boolean} The current setting.
     */
    public stageUpdate(): boolean;
    /**
     * @param {boolean} stageUpdate split the Update into two stages
     * @returns {Bar} The calling Animator.
     */
    public stageUpdate(stageUpdate: boolean): Bar;
    public stageUpdate(stageUpdate?: boolean): any {
      if (stageUpdate == null) {
        return this._stageUpdate;
      } else {
        this._stageUpdate = stageUpdate;
        return this;
      }
    }
    /**
     * animateJoin implementation
     */
    public animateJoin(joinResult: Drawers.JoinResult, attrToAppliedProjector: AttributeToAppliedProjector, drawer: Drawer): void {
      let yScale = this.yScale();

      // a projector to set bar height and y-origin to 0
      let zeroProj: AttributeToAppliedProjector = {
        height: function () { return 0; },
        y: function (d, i) { return yScale.scale(0); },
      };
      // durations for the stages - by checking the size() of the relevant selection, a stage may be
      // suppressed if it is not needed. this means that the actual overall duration of the transition
      // can be shorter than the requested duration
      // the steps, it all executed have these relative lengths
      // exiting bars shrink        :   4
      // update bars resize         :   4   (this step may be ommitted by setting stageUpdate = false;)
      // update bars reduce opacity :   1
      // update bars move on x axis :   4
      // update bars restore opacity:   1
      // entering bars expand       :   4
      let stepRelativeDurations = [4, (this.stageUpdate() ? 4 : 0), 1, 4, 1, 4];
      let totalRelativeDurations = stepRelativeDurations.reduce((a, b) => {
        return a + b;
      });

      // decide which steps are needed
      let exitStageOn: number = (joinResult.exit.size() > 0 ? 1 : 0);
      let updateStageOn: number = (joinResult.update.size() > 0 ? 1 : 0);
      let enterStageOn: number = (joinResult.enter.size() > 0 ? 1 : 0);

      let stepOn = [exitStageOn, updateStageOn, updateStageOn, updateStageOn, updateStageOn, enterStageOn];

      // final actual durations for each step, based on relative durations and whether step is needed
      // the animation is confined to the first part of this time interval by the squEase easing function
      let stepDurations = stepRelativeDurations.map((duration, index) => {
        return this.stepDuration() * (duration / totalRelativeDurations) * stepOn[index] ;
      });
      // delay before the beginning of enter step - for convenience
      let enterStepDelay = 0;
      for (let i = 0; i < 5; i++) {
        enterStepDelay += stepDurations[i];
      };

      // defines the 'rhythm' between movement and pause in each major step 0 - 1
      let squeezer = Plottable.Animators.EasingFunctions.squEase("linear-in-out", 0, this.rhythm());
      // Exit processing
      // STEP 0: Transition the bar height  to 0 (taking care to adjust the y origin), when done, remove
      joinResult.exit = this.getTransition(joinResult.exit, stepDurations[0], undefined, squeezer)
        .attr(zeroProj)
        .remove();

      // Update processing
      // update waits for the exit to finish with an empty transition
      joinResult.update = this.getTransition(joinResult.update, stepDurations[0]);
      // STEP 1: extract height and y from the attrToAppliedProjector - these two are applied first
      let heightProj: AttributeToAppliedProjector = this.pluckAttrs(attrToAppliedProjector, ["height", "y"]);
      joinResult.update = this.getTransition(joinResult.update, stepDurations[1], undefined, squeezer)
        .attr(heightProj);
      // STEP 2: quickly fade before the next step - to reduce "occlusion" as bars move across each other
      // and so make visual tracking easier
      joinResult.update = this.getTransition(joinResult.update, stepDurations[2])
          .attr({ "opacity": .6 });

      // STEP 3: apply all the remaining attributes, while maintaining the reduced opacity
      let proj3: AttributeToAppliedProjector = this.mergeAttrs(attrToAppliedProjector, { "opacity": () => { return .6; } });
      joinResult.update = this.getTransition(joinResult.update, stepDurations[3], undefined, squeezer)
        .attr(proj3);

      // STEP 4: quickly apply all the remaining attributes, including opacity - restores opacity to the required value
      // don;t use the squeeze on this transition
      joinResult.update = this.getTransition(joinResult.update, stepDurations[4])
        .attr(attrToAppliedProjector);

      // Enter
      // initialise the entering elements - all the target attributes are applied, but height and y are overridden to 0
      let enterInitProj: AttributeToAppliedProjector = this.mergeAttrs(attrToAppliedProjector, zeroProj);
      (<d3.Selection<any>>joinResult.enter)
        .attr(enterInitProj);

      // wait for the Exit and Update to finish - steps 0 to 4
      joinResult.enter = this.getTransition(joinResult.enter, enterStepDelay);
      // STEP 5: apply all attributes to the enter selection - this will transition height and y back to their final values
      // the squeeze is applied to keep a constant rhythm, even though this leaves a "wait" at the end of the transition
      joinResult.enter = this.getTransition(joinResult.enter, stepDurations[5], undefined, squeezer )
        .attr(attrToAppliedProjector);
    }

    public animate(selection: d3.Selection<any>
      , attrToAppliedProjector: AttributeToAppliedProjector): d3.Selection<any> | d3.Transition<any> {
      // legacy format - there is no enter or exit to animate so just delegate to Base
      return super.animate(selection, attrToAppliedProjector);
    }
  }
}
