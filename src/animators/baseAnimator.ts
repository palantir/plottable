///<reference path="../reference.ts" />

module Plottable {
    export module Animators {

        /**
         * An Animator with easing and configurable durations and delays.
         */
        export class Base implements Animator {
            /**
             * The default starting delay of the animation in milliseconds
             */
            private static _DEFAULT_START_DELAY_MILLISECONDS = 0;
            /**
             * The default duration of one animation step in milliseconds
             */
            private static _DEFAULT_STEP_DURATION_MILLISECONDS = 300;
            /**
             * The default maximum start delay between each step of an animation
             */
            private static _DEFAULT_ITERATIVE_DELAY_MILLISECONDS = 15;
            /**
             * The default maximum total animation duration
             */
            private static _DEFAULT_MAX_TOTAL_DURATION_MILLISECONDS = Infinity;
            /**
             * The default easing of the animation
             */
            private static _DEFAULT_EASING_MODE = "linear-in-out";

            private _startDelay: number;
            private _stepDuration: number;
            private _stepDelay: number;
            private _maxTotalDuration: number;
            private _easingMode: string;
            private _xScale: Plottable.Scale<any, any>;
            private _yScale: Plottable.Scale<any, any>;
            /**
             * Constructs the default animator
             *
             * @constructor
             */
            constructor() {
                this._startDelay = Base._DEFAULT_START_DELAY_MILLISECONDS;
                this._stepDuration = Base._DEFAULT_STEP_DURATION_MILLISECONDS;
                this._stepDelay = Base._DEFAULT_ITERATIVE_DELAY_MILLISECONDS;
                this._maxTotalDuration = Base._DEFAULT_MAX_TOTAL_DURATION_MILLISECONDS;
                this._easingMode = Base._DEFAULT_EASING_MODE;
            }

            public totalTime(numberOfSteps: number) {
              let adjustedIterativeDelay = this._getAdjustedIterativeDelay(numberOfSteps);
              return this.startDelay() + adjustedIterativeDelay * (Math.max(numberOfSteps - 1, 0)) + this.stepDuration();
            }

            public animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector, drawingTarget?: Drawers.DrawingTarget): d3.Selection<any> | d3.Transition<any> {
              let numberOfSteps = (<any>drawingTarget.merge)[0].length;
              let adjustedIterativeDelay = this._getAdjustedIterativeDelay(numberOfSteps);

              // set all the properties on the merge , save the transition returned
              drawingTarget.merge = this.getTransition(drawingTarget.merge, this.stepDuration(), (d: any, i: number) => this.startDelay() + adjustedIterativeDelay * i)
                .attr(attrToAppliedProjector);
              
              // remove the exiting elements
              drawingTarget.exit
                .remove();
              return drawingTarget.merge;
            }

            /**
             * return a transition from the selection, with the requested duration 
             * and (possibly) delay. As a convenience, this may return the selection itself
             * without applying a transition if durection = 0
             *
             */
            protected getTransition(selection: d3.Selection<any>|d3.Transition<any>|d3.selection.Update<any>, duration: number, delay?: (d: any, i: number) => number, easing?: any): any {
                // if the duration is 0, just return the selection
                if (duration === 0)
                return selection;

                easing = easing || this.easingMode();
                if (this.isTransition(selection) || delay === undefined) {
                // if the selection is already a transition, create a new transition, but let d3 supply the default
                // delay, that way they will "chain"
                  return selection.transition()
                    .ease(easing)
                    .duration(duration);

                } else {
                // otherwise is the selection is NOT a transition, create a new transition setting up the delay
                  return selection.transition()
                    .ease(easing)
                    .duration(duration)
                    .delay(delay);

                }
            }

            /**
             * @isTransition
             *
             *  return true if the d3 object passed in is a transition
             *
             */
            protected isTransition(selection: any): boolean {
              return (selection.namespace === "__transition__"? true: false);
            }
            protected mergeAttrs(attr1: AttributeToAppliedProjector, attr2: AttributeToAppliedProjector): AttributeToAppliedProjector {
              let a: AttributeToAppliedProjector = {};
              for (var attrName in attr1) {
                a[attrName] = attr1[attrName];
              }
              for (var attrName in attr2) {
                a[attrName] = attr2[attrName];
              }
              return a;
            }

            /**
             *  return the AtributeToAppliedProjector comprising only those attributes listed in names
             *
             */
            protected pluckAttrs(attr: AttributeToAppliedProjector, names: string[]): AttributeToAppliedProjector {
              //let out = 
              return attr;
            }

            protected delay(selection: any): (d: any, i: number) => number {
              let dom: any[] = selection[0];
              let numberOfSteps: number = selection[0].length;
              let adjustedIterativeDelay: number = this._getAdjustedIterativeDelay(numberOfSteps);

              return (d: any, i: number) => this.startDelay() + adjustedIterativeDelay * i;
            }
         
            /**
             * Gets the start delay of the animation in milliseconds.
             *
             * @returns {number} The current start delay.
             */
            public startDelay(): number;
            /**
             * Sets the start delay of the animation in milliseconds.
             *
             * @param {number} startDelay The start delay in milliseconds.
             * @returns {Easing} The calling Easing Animator.
             */
            public startDelay(startDelay: number): Easing;
            public startDelay(startDelay?: number): any {
                if (startDelay == null) {
                    return this._startDelay;
                } else {
                    this._startDelay = startDelay;
                    return this;
                }
            }

            /**
             * Gets the duration of one animation step in milliseconds.
             *
             * @returns {number} The current duration.
             */
            public stepDuration(): number;
            /**
             * Sets the duration of one animation step in milliseconds.
             *
             * @param {number} stepDuration The duration in milliseconds.
             * @returns {Easing} The calling Easing Animator.
             */
            public stepDuration(stepDuration: number): Easing;
            public stepDuration(stepDuration?: number): any {
                if (stepDuration == null) {
                    return Math.min(this._stepDuration, this._maxTotalDuration);
                } else {
                    this._stepDuration = stepDuration;
                    return this;
                }
            }

            /**
             * Gets the maximum start delay between animation steps in milliseconds.
             *
             * @returns {number} The current maximum iterative delay.
             */
            public stepDelay(): number;
            /**
             * Sets the maximum start delay between animation steps in milliseconds.
             *
             * @param {number} stepDelay The maximum iterative delay in milliseconds.
             * @returns {Easing} The calling Easing Animator.
             */
            public stepDelay(stepDelay: number): Easing;
            public stepDelay(stepDelay?: number): any {
                if (stepDelay == null) {
                    return this._stepDelay;
                } else {
                    this._stepDelay = stepDelay;
                    return this;
                }
            }

            /**
             * Gets the maximum total animation duration constraint in milliseconds.
             *
             * If the animation time would exceed the specified time, the duration of each step
             * and the delay between each step will be reduced until the animation fits within
             * the specified time.
             * 
             * @returns {number} The current maximum total animation duration.
             */
            public maxTotalDuration(): number;
            /**
             * Sets the maximum total animation duration constraint in miliseconds.
             * 
             * If the animation time would exceed the specified time, the duration of each step
             * and the delay between each step will be reduced until the animation fits within
             * the specified time.
             *
             * @param {number} maxTotalDuration The maximum total animation duration in milliseconds.
             * @returns {Easing} The calling Easing Animator.
             */
            public maxTotalDuration(maxTotalDuration: number): Easing;
            public maxTotalDuration(maxTotalDuration?: number): any {
                if (maxTotalDuration == null) {
                    return this._maxTotalDuration;
                } else {
                    this._maxTotalDuration = maxTotalDuration;
                    return this;
                }
            }

            /**
             * Gets the current easing mode of the animation.
             *
             * @returns {string} the current easing mode.
             */
            public easingMode(): string;
            /**
             * Sets the easing mode of the animation.
             *
             * @param {string} easingMode The desired easing mode.
             * @returns {Easing} The calling Easing Animator.
             */
            public easingMode(easingMode: string): Base;
            public easingMode(easingMode?: string): any {
                if (easingMode == null) {
                    return this._easingMode;
                } else {
                    this._easingMode = easingMode;
                    return this;
                }
            }

            /**
              * xScale -- a referene to the xScale used by the owning plot
              * the animator can use this to calculate positions
              * @returns {Plottable.Scale<any, any>} the xScale.
              */
            public xScale(): Plottable.Scale<any, any>;
            /**
             * Sets the easing mode of the animation.
             *
             * @param {Plottable.Scale<any, any} xScale The desired easing mode.
             * @returns {Base} The calling Animator.
             */
            public xScale(xScale: Plottable.Scale<any, any>): Base;
            public xScale(xScale?: Plottable.Scale<any, any>): any {
              if (xScale == null) {
                return this._xScale;
              } else {
                this._xScale = xScale;
                return this;
              }
            }   

            /**
             * yScale -- a referene to the yScale used by the owning plot
             * the animator can use this to calculate positions
             * @returns {Plottable.Scale<any, any>} the yScale.
             */
            public yScale(): Plottable.Scale<any, any>;
            /**
             * a yScale available to the animator for converting rendering 'logical' y values.
             *
             * @param {Plottable.Scale<any, any} yScale The desired easing mode.
             * @returns {Base} The calling Animator.
             */
            public yScale(yScale: Plottable.Scale<any, any>): Base;
            public yScale(yScale?: Plottable.Scale<any, any>): any {
              if (yScale == null) {
                return this._yScale;
              } else {
                this._yScale = yScale;
                return this;
              }
            }

            /* easing functions
             * the Base animator provides easing functions 

            /**
             * Adjust the iterative delay, such that it takes into account the maxTotalDuration constraint
             */
            protected _getAdjustedIterativeDelay(numberOfSteps: number) {
                let stepStartTimeInterval = this.maxTotalDuration() - this.stepDuration();
                stepStartTimeInterval = Math.max(stepStartTimeInterval, 0);
                let maxPossibleIterativeDelay = stepStartTimeInterval / Math.max(numberOfSteps - 1, 1);
                return Math.min(this.stepDelay(), maxPossibleIterativeDelay);
            }
        }
    }
}
