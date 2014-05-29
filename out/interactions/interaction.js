///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    var Interaction = (function () {
        /**
        * Creates an Interaction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for interactions on.
        */
        function Interaction(componentToListenTo) {
            this.componentToListenTo = componentToListenTo;
        }
        Interaction.prototype._anchor = function (hitBox) {
            this.hitBox = hitBox;
        };

        /**
        * Registers the Interaction on the Component it's listening to.
        * This needs to be called to activate the interaction.
        */
        Interaction.prototype.registerWithComponent = function () {
            this.componentToListenTo.registerInteraction(this);
            return this;
        };
        return Interaction;
    })();
    Plottable.Interaction = Interaction;
})(Plottable || (Plottable = {}));
