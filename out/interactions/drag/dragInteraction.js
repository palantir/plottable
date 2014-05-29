///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var DragInteraction = (function (_super) {
        __extends(DragInteraction, _super);
        /**
        * Creates a DragInteraction.
        *
        * @param {Component} componentToListenTo The component to listen for interactions on.
        */
        function DragInteraction(componentToListenTo) {
            var _this = this;
            _super.call(this, componentToListenTo);
            this.dragInitialized = false;
            this.origin = [0, 0];
            this.location = [0, 0];
            this.dragBehavior = d3.behavior.drag();
            this.dragBehavior.on("dragstart", function () {
                return _this._dragstart();
            });
            this.dragBehavior.on("drag", function () {
                return _this._drag();
            });
            this.dragBehavior.on("dragend", function () {
                return _this._dragend();
            });
        }
        /**
        * Adds a callback to be called when the AreaInteraction triggers.
        *
        * @param {(a: SelectionArea) => any} cb The function to be called. Takes in a SelectionArea in pixels.
        * @returns {AreaInteraction} The calling AreaInteraction.
        */
        DragInteraction.prototype.callback = function (cb) {
            this.callbackToCall = cb;
            return this;
        };

        DragInteraction.prototype._dragstart = function () {
            var availableWidth = this.componentToListenTo.availableWidth;
            var availableHeight = this.componentToListenTo.availableHeight;

            // the constraint functions ensure that the selection rectangle will not exceed the hit box
            var constraintFunction = function (min, max) {
                return function (x) {
                    return Math.min(Math.max(x, min), max);
                };
            };
            this.constrainX = constraintFunction(0, availableWidth);
            this.constrainY = constraintFunction(0, availableHeight);
        };

        DragInteraction.prototype._drag = function () {
            if (!this.dragInitialized) {
                this.origin = [d3.event.x, d3.event.y];
                this.dragInitialized = true;
            }

            this.location = [this.constrainX(d3.event.x), this.constrainY(d3.event.y)];
        };

        DragInteraction.prototype._dragend = function () {
            if (!this.dragInitialized) {
                return;
            }
            this.dragInitialized = false;
            this._doDragend();
        };

        DragInteraction.prototype._doDragend = function () {
            // seperated out so it can be over-ridden by dragInteractions that want to pass out diff information
            // eg just x values for an xSelectionInteraction
            if (this.callbackToCall != null) {
                this.callbackToCall([this.origin, this.location]);
            }
        };

        DragInteraction.prototype._anchor = function (hitBox) {
            _super.prototype._anchor.call(this, hitBox);
            hitBox.call(this.dragBehavior);
            return this;
        };
        return DragInteraction;
    })(Plottable.Interaction);
    Plottable.DragInteraction = DragInteraction;
})(Plottable || (Plottable = {}));
