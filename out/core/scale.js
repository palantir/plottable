///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Scale = (function (_super) {
        __extends(Scale, _super);
        /**
        * Creates a new Scale.
        *
        * @constructor
        * @param {D3.Scale.Scale} scale The D3 scale backing the Scale.
        */
        function Scale(scale) {
            _super.call(this);
            this._autoDomain = true;
            this.rendererID2Perspective = {};
            this.dataSourceReferenceCounter = new Plottable.IDCounter();
            this._autoNice = false;
            this._autoPad = false;
            this._d3Scale = scale;
        }
        Scale.prototype._getAllExtents = function () {
            var perspectives = d3.values(this.rendererID2Perspective);
            var extents = perspectives.map(function (p) {
                var source = p.dataSource;
                var accessor = p.accessor;
                return source._getExtent(accessor);
            }).filter(function (e) {
                return e != null;
            });
            return extents;
        };

        Scale.prototype._getExtent = function () {
            return [];
        };

        /**
        * Modify the domain on the scale so that it includes the extent of all
        * perspectives it depends on. Extent: The (min, max) pair for a
        * QuantitiativeScale, all covered strings for an OrdinalScale.
        * Perspective: A combination of a DataSource and an Accessor that
        * represents a view in to the data.
        */
        Scale.prototype.autoDomain = function () {
            this._setDomain(this._getExtent());
            return this;
        };

        Scale.prototype._addPerspective = function (rendererIDAttr, dataSource, accessor) {
            var _this = this;
            if (this.rendererID2Perspective[rendererIDAttr] != null) {
                this._removePerspective(rendererIDAttr);
            }
            this.rendererID2Perspective[rendererIDAttr] = { dataSource: dataSource, accessor: accessor };

            var dataSourceID = dataSource._plottableID;
            if (this.dataSourceReferenceCounter.increment(dataSourceID) === 1) {
                dataSource.registerListener(this, function () {
                    if (_this._autoDomain) {
                        _this.autoDomain();
                    }
                });
            }
            if (this._autoDomain) {
                this.autoDomain();
            }
            return this;
        };

        Scale.prototype._removePerspective = function (rendererIDAttr) {
            var dataSource = this.rendererID2Perspective[rendererIDAttr].dataSource;
            var dataSourceID = dataSource._plottableID;
            if (this.dataSourceReferenceCounter.decrement(dataSourceID) === 0) {
                dataSource.deregisterListener(this);
            }

            delete this.rendererID2Perspective[rendererIDAttr];
            if (this._autoDomain) {
                this.autoDomain();
            }
            return this;
        };

        /**
        * Returns the range value corresponding to a given domain value.
        *
        * @param value {any} A domain value to be scaled.
        * @returns {any} The range value corresponding to the supplied domain value.
        */
        Scale.prototype.scale = function (value) {
            return this._d3Scale(value);
        };

        Scale.prototype.domain = function (values) {
            if (values == null) {
                return this._d3Scale.domain();
            } else {
                this._autoDomain = false;
                this._setDomain(values);
                return this;
            }
        };

        Scale.prototype._setDomain = function (values) {
            this._d3Scale.domain(values);
            this._broadcast();
        };

        Scale.prototype.range = function (values) {
            if (values == null) {
                return this._d3Scale.range();
            } else {
                this._d3Scale.range(values);
                return this;
            }
        };

        /**
        * Creates a copy of the Scale with the same domain and range but without any registered listeners.
        *
        * @returns {Scale} A copy of the calling Scale.
        */
        Scale.prototype.copy = function () {
            return new Scale(this._d3Scale.copy());
        };
        return Scale;
    })(Plottable.Broadcaster);
    Plottable.Scale = Scale;
})(Plottable || (Plottable = {}));
