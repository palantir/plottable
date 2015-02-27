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

    var axis1 = new Plottable.Axis.Category(scale1, "left");
    var axis2 = new Plottable.Axis.Category(scale2, "left");
    var axis3 = new Plottable.Axis.Category(scale3, "left");
    var axis4 = new Plottable.Axis.Category(scale4, "left");
    var axis5 = new Plottable.Axis.Category(scale5, "left");
    
    var label1 = new Plottable.Component.Label("");
    var label2 = new Plottable.Component.Label("");
    var label3 = new Plottable.Component.Label("");
    var label4 = new Plottable.Component.Label("");
    var label5 = new Plottable.Component.Label("");
    
    var axisTable1 = new Plottable.Component.Table([[label1, axis1]]);
    var axisTable2 = new Plottable.Component.Table([[label2, axis2]]);
    var axisTable3 = new Plottable.Component.Table([[label3, axis3]]);
    var axisTable4 = new Plottable.Component.Table([[label4, axis4]]);
    var axisTable5 = new Plottable.Component.Table([[label5, axis5]]);

    var table = new Plottable.Component.Table([[axisTable1, axisTable2, axisTable3, axisTable4, axisTable5]]);


    table.renderTo(svg);

}
