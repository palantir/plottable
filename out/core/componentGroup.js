///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var ComponentGroup = (function (_super) {
        __extends(ComponentGroup, _super);
        /**
        * Creates a ComponentGroup.
        *
        * @constructor
        * @param {Component[]} [components] The Components in the ComponentGroup.
        */
        function ComponentGroup(components) {
            if (typeof components === "undefined") { components = []; }
            var _this = this;
            _super.call(this);
            this.classed("component-group", true);
            components.forEach(function (c) {
                return _this._addComponent(c);
            });
        }
        ComponentGroup.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
            var requests = this._components.map(function (c) {
                return c._requestedSpace(offeredWidth, offeredHeight);
            });
            var isEmpty = this.empty();
            var desiredWidth = isEmpty ? 0 : d3.max(requests, function (l) {
                return l.width;
            });
            var desiredHeight = isEmpty ? 0 : d3.max(requests, function (l) {
                return l.height;
            });
            return {
                width: Math.min(desiredWidth, offeredWidth),
                height: Math.min(desiredHeight, offeredHeight),
                wantsWidth: isEmpty ? false : requests.map(function (r) {
                    return r.wantsWidth;
                }).some(function (x) {
                    return x;
                }),
                wantsHeight: isEmpty ? false : requests.map(function (r) {
                    return r.wantsHeight;
                }).some(function (x) {
                    return x;
                })
            };
        };

        ComponentGroup.prototype.merge = function (c) {
            this._addComponent(c);
            return this;
        };

        ComponentGroup.prototype._computeLayout = function (xOrigin, yOrigin, availableWidth, availableHeight) {
            var _this = this;
            _super.prototype._computeLayout.call(this, xOrigin, yOrigin, availableWidth, availableHeight);
            this._components.forEach(function (c) {
                c._computeLayout(0, 0, _this.availableWidth, _this.availableHeight);
            });
            return this;
        };

        ComponentGroup.prototype._isFixedWidth = function () {
            return this._components.every(function (c) {
                return c._isFixedWidth();
            });
        };

        ComponentGroup.prototype._isFixedHeight = function () {
            return this._components.every(function (c) {
                return c._isFixedHeight();
            });
        };
        return ComponentGroup;
    })(Plottable.ComponentContainer);
    Plottable.ComponentGroup = ComponentGroup;
})(Plottable || (Plottable = {}));
