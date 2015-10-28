module Plottable {
  export interface Animator {
    /**
     * Applies attributes to the 'enter update exit' selections created when binding new data into
     * the selection of DOM elements bound to the plot's current data (if any).
     * (see http://bost.ocks.org/mike/join/)
     * This method is invoked on the animator assigned to the plot by Drawer when drawing the plot data.
     *
     * @param {JoinResult} joinResult JoinResult object - its enter, update, exit
     *     and merge (enter + update) properties provide access to the selections
     *     created by the data join.
     * @param {AttributeToAppliedProjector} attrToAppliedProjector The set of
     *     AppliedProjectors that we will use to set attributes on the selection.
     * @param {Drawer} drawer the calling Drawer.
     * An animator that derives a transition from any property of joinResult must update that
     * property with the resulting transition object.
     * Animators are responsible for removing exiting elements by ensuring that remove() is called on joinResult.exit
     */
    animateJoin(joinResult: Drawers.JoinResult, attrToAppliedProjector: AttributeToAppliedProjector, drawer: Drawer): void;
    /**
     * Applies the supplied attributes to a specified d3.Selection with some animation.
     * animate is not used internally by plottable - animateJoin is used when rendering data in a plot.
     * @param {D3.Selection<any>} selection The update selection or transition selection that we wish to animate.
     * @param {AttributeToAppliedProjector} attrToAppliedProjector The set of
     *     AppliedProjectors that we will use to set attributes on the selection.
     * @return {any} Animators can return the selection or
     *     transition object so that the caller may chain the transitions between
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
