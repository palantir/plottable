///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var DataSource = (function (_super) {
        __extends(DataSource, _super);
        /**
        * Creates a new DataSource.
        *
        * @constructor
        * @param {any[]} data
        * @param {any} metadata An object containing additional information.
        */
        function DataSource(data, metadata) {
            if (typeof data === "undefined") { data = []; }
            if (typeof metadata === "undefined") { metadata = {}; }
            _super.call(this);
            this._data = data;
            this._metadata = metadata;
            this.accessor2cachedExtent = new Plottable.StrictEqualityAssociativeArray();
        }
        DataSource.prototype.data = function (data) {
            if (data == null) {
                return this._data;
            } else {
                this._data = data;
                this.accessor2cachedExtent = new Plottable.StrictEqualityAssociativeArray();
                this._broadcast();
                return this;
            }
        };

        DataSource.prototype.metadata = function (metadata) {
            if (metadata == null) {
                return this._metadata;
            } else {
                this._metadata = metadata;
                this.accessor2cachedExtent = new Plottable.StrictEqualityAssociativeArray();
                this._broadcast();
                return this;
            }
        };

        DataSource.prototype._getExtent = function (accessor) {
            var cachedExtent = this.accessor2cachedExtent.get(accessor);
            if (cachedExtent === undefined) {
                cachedExtent = this.computeExtent(accessor);
                this.accessor2cachedExtent.set(accessor, cachedExtent);
            }
            return cachedExtent;
        };

        DataSource.prototype.computeExtent = function (accessor) {
            var appliedAccessor = Plottable.Utils.applyAccessor(accessor, this);
            var mappedData = this._data.map(appliedAccessor);
            if (mappedData.length === 0) {
                return undefined;
            } else if (typeof (mappedData[0]) === "string") {
                return Plottable.Utils.uniq(mappedData);
            } else {
                return d3.extent(mappedData);
            }
        };
        return DataSource;
    })(Plottable.Broadcaster);
    Plottable.DataSource = DataSource;
})(Plottable || (Plottable = {}));
