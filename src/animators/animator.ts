module Plottable {
  export interface Animator {
    /**
     * Applies attributes to the 'enter update exit' selections created by the Drawer when binding data
     * Drawer invokes Animators using this signature:
     * @param {DrawingTarget} drawingTarget DrawingTarget object - its enter update exit and merge ( enter + update)
     *  properties provide access to the selections.
     * @param {AttributeToAppliedProjector} attrToAppliedProjector The set of
     *     AppliedProjectors that we will use to set attributes on the selection.
     * @param {Drawer} drawer the calling Drawer.
     * An animator that derives a transition from any property of drawingTarget must update that
     * property with the resulting transition object.
     * Animators are responsible for removing exiting elements by ensuring that remove() is called on drawingTarget.exit
     */
    animate(drawingTarget: Drawers.DrawingTarget, attrToAppliedProjector: AttributeToAppliedProjector, drawer: Drawer): void;
    /**
     * Applies the supplied attributes to a d3.Selection with some animation.
     * @param {D3.Selection<any>} selection The update selection or transition selection that we wish to animate.
     * @param {AttributeToAppliedProjector} attrToAppliedProjector The set of
     *     AppliedProjectors that we will use to set attributes on the selection.
     * @return {any} Animators should return the selection or
     *     transition object so that plots may chain the transitions between
     *     animators.
     */
    animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector): d3.Selection<any> | d3.Transition<any>;
    /**
     * Given the number of elements, return the total time the animation requires
     *
     * @param {number} numberofIterations The number of elements that will be drawn
     * @returns {number}
     */
    totalTime(numberOfIterations: number): number;
  }
}
