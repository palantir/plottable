function makeData() {
  "use strict";
    return null;
}

function run(svg, data, Plottable) {
  "use strict";

    var scale1 = new Plottable.Scale.Ordinal().domain(["foo", "bar", "baz"]);
    var scale2 = new Plottable.Scale.Ordinal().domain([null, undefined, true, false]);
    var scale3 = new Plottable.Scale.Ordinal().domain([0, 1, 2, 3]);
    var scale4 = new Plottable.Scale.Ordinal().domain([{}, function(){}, []]);
    var scale5 = new Plottable.Scale.Ordinal().domain([]);

    var axis1 = new Plottable.Axis.Category(scale1);
    var axis2 = new Plottable.Axis.Category(scale2);
    var axis3 = new Plottable.Axis.Category(scale3);
    var axis4 = new Plottable.Axis.Category(scale4);
    var axis5 = new Plottable.Axis.Category(scale5);

    var table = new Plottable.Component.Table([[axis1],[axis2],[axis3],[axis4],[axis5]]);


    table.renderTo(svg);

}
