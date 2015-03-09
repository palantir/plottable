function makeData() {
  "use strict";
    return null;
}

function run(div, data, Plottable) {
  "use strict";

    var svg = div.append("svg").attr("height", 500);

    var scale1 = new Plottable.Scale.Category().domain(["foo", "bar", "baz"]);
    var scale2 = new Plottable.Scale.Category().domain([null, undefined, true, false]);
    var scale3 = new Plottable.Scale.Category().domain([0, 1, 2, 3]);
    var scale4 = new Plottable.Scale.Category().domain([{}, function(){}, []]);
    var scale5 = new Plottable.Scale.Category().domain([]);

    var axis1 = new Plottable.Axis.Category(scale1);
    var axis2 = new Plottable.Axis.Category(scale2);
    var axis3 = new Plottable.Axis.Category(scale3);
    var axis4 = new Plottable.Axis.Category(scale4);
    var axis5 = new Plottable.Axis.Category(scale5);

    var table = new Plottable.Component.Table([[axis1],[axis2],[axis3],[axis4],[axis5]]);


    table.renderTo(svg);

}
