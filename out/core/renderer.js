///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Renderer = (function (_super) {
        __extends(Renderer, _super);
        function Renderer(dataset) {
            _super.call(this);
            this._dataChanged = false;
            this._animate = false;
            this._ANIMATION_DURATION = 250;
            this._hasRendered = false;
            this._projectors = {};
            this._rerenderUpdateSelection = false;
            // A perf-efficient manner of rendering would be to calculate attributes only
            // on new nodes, and assume that old nodes (ie the update selection) can
            // maintain their current attributes. If we change the metadata or an
            // accessor function, then this property will not be true, and we will need
            // to recompute attributes on the entire update selection.
            this._requireRerender = false;
            this.clipPathEnabled = true;
            this.classed("renderer", true);

            var dataSource;
            if (dataset != null) {
                if (typeof dataset.data === "function") {
                    dataSource = dataset;
                } else {
                    dataSource = dataSource = new Plottable.DataSource(dataset);
                }
            } else {
                dataSource = new Plottable.DataSource();
            }
            this.dataSource(dataSource);
        }
        Renderer.prototype._anchor = function (element) {
            _super.prototype._anchor.call(this, element);
            this._dataChanged = true;
            return this;
        };

        Renderer.prototype.dataSource = function (source) {
            var _this = this;
            if (source == null) {
                return this._dataSource;
            }
            var oldSource = this._dataSource;
            if (oldSource != null) {
                this._deregisterFromBroadcaster(this._dataSource);
                this._requireRerender = true;
                this._rerenderUpdateSelection = true;

                // point all scales at the new datasource
                d3.keys(this._projectors).forEach(function (attrToSet) {
                    var projector = _this._projectors[attrToSet];
                    if (projector.scale != null) {
                        var rendererIDAttr = _this._plottableID + attrToSet;
                        projector.scale._removePerspective(rendererIDAttr);
                        projector.scale._addPerspective(rendererIDAttr, source, projector.accessor);
                    }
                });
            }
            this._dataSource = source;
            this._registerToBroadcaster(this._dataSource, function () {
                _this._dataChanged = true;
                _this._render();
            });
            this._dataChanged = true;
            this._render();
            return this;
        };

        Renderer.prototype.project = function (attrToSet, accessor, scale) {
            var _this = this;
            var rendererIDAttr = this._plottableID + attrToSet;
            var currentProjection = this._projectors[attrToSet];
            var existingScale = (currentProjection != null) ? currentProjection.scale : null;
            if (scale == null) {
                scale = existingScale;
            }
            if (existingScale != null) {
                existingScale._removePerspective(rendererIDAttr);
                this._deregisterFromBroadcaster(existingScale);
            }
            if (scale != null) {
                scale._addPerspective(rendererIDAttr, this.dataSource(), accessor);
                this._registerToBroadcaster(scale, function () {
                    return _this._render();
                });
            }
            this._projectors[attrToSet] = { accessor: accessor, scale: scale };
            this._requireRerender = true;
            this._rerenderUpdateSelection = true;
            return this;
        };

        Renderer.prototype._generateAttrToProjector = function () {
            var _this = this;
            var h = {};
            d3.keys(this._projectors).forEach(function (a) {
                var projector = _this._projectors[a];
                var accessor = Plottable.Utils.applyAccessor(projector.accessor, _this.dataSource());
                var scale = projector.scale;
                var fn = scale == null ? accessor : function (d, i) {
                    return scale.scale(accessor(d, i));
                };
                h[a] = fn;
            });
            return h;
        };

        Renderer.prototype._doRender = function () {
            if (this.element != null) {
                this._hasRendered = true;
                this._paint();
                this._dataChanged = false;
                this._requireRerender = false;
                this._rerenderUpdateSelection = false;
            }
            return this;
        };

        Renderer.prototype._paint = function () {
            // no-op
        };

        Renderer.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.renderArea = this.content.append("g").classed("render-area", true);
            return this;
        };

        /**
        * Enables or disables animation.
        *
        * @param {boolean} enabled Whether or not to animate.
        */
        Renderer.prototype.animate = function (enabled) {
            this._animate = enabled;
            return this;
        };
        Renderer.DEFAULT_COLOR_ACCESSOR = function (d) {
            return "#1f77b4";
        };
        return Renderer;
    })(Plottable.Component);
    Plottable.Renderer = Renderer;
})(Plottable || (Plottable = {}));
