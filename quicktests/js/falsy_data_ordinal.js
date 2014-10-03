function makeData() {
  "use strict";

  var data1 = [{x: null, y: null}, {x: null, y: 1}, {x: 1, y: null}, {x: 2, y: 2} ];
  var data2 = [{x: NaN, y: NaN}, {x: NaN, y: 1}, {x: 1, y: NaN}, {x: 2, y: 2}];
  var data3 = [{x: undefined, y: undefined}, {x: undefined, y: 1}, {x: 1, y: undefined},  {x: 2, y: 2}];
  var data4 = [{x: false, y: false}, {x: false, y: 1}, {x: 1, y: false}, {x: 2, y: 2}];
  var data5 = [{x: "", y: ""}, {x: "", y: 1}, {x: 1, y: ""}, {x: 2, y: 2}];
    
  return [data1, data2, data3, data4, data5];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);

  //Axis
  var scale_array = [];
  for (var i = 0; i < 40; i++){
      scale_array.push(new Plottable.Scale.Ordinal());
      scale_array.push(new Plottable.Scale.Linear());
  }

  var axis_array = [];
  for (var j = 0; j < 40; j += 2){
      axis_array.push(new Plottable.Axis.Category(scale_array[j], "bottom"));
      axis_array.push(new Plottable.Axis.Numeric(scale_array[j+1], "left"));
  }

  //Labels
  var title = new Plottable.Component.TitleLabel("null , NaN, undefined, false, \"\" on Ordinal");
  var desc = new Plottable.Component.Label("data: {x: type, y: type}, {x: type, y: 1}, {x: 1, y: type}, {x: 2, y: 2} ");
  var scatterLabel = new Plottable.Component.Label("Scatter");
  var lineLabel = new Plottable.Component.Label("Line");
  var areaLabel = new Plottable.Component.Label("Area");
  var vbarLabel = new Plottable.Component.Label("VBar");

  //Plots
  var scatter1 = new Plottable.Plot.Scatter(data[0], scale_array[0], scale_array[1]);
  var scatter_null = new Plottable.Component.Table([[axis_array[1], scatter1],[null, axis_array[0]]]);
  var scatter2 = new Plottable.Plot.Scatter(data[1], scale_array[2], scale_array[3]);
  var scatter_nan = new Plottable.Component.Table([[axis_array[3], scatter2],[null, axis_array[2]]]);
  var scatter3 = new Plottable.Plot.Scatter(data[2], scale_array[4], scale_array[5]);
  var scatter_undefined = new Plottable.Component.Table([[axis_array[5], scatter3],[null, axis_array[4]]]);
  var scatter4 = new Plottable.Plot.Scatter(data[3], scale_array[6], scale_array[7]);
  var scatter_false = new Plottable.Component.Table([[axis_array[7], scatter4],[null, axis_array[6]]]);
  var scatter5 = new Plottable.Plot.Scatter(data[4], scale_array[8], scale_array[9]);
  var scatter_empty = new Plottable.Component.Table([[axis_array[9], scatter5],[null, axis_array[8]]]);
  var scatterTable = new Plottable.Component.Table([ [scatter_null, scatter_nan, scatter_undefined, scatter_false, scatter_empty] ]);

  var line1 = new Plottable.Plot.Line(data[0], scale_array[10], scale_array[11]);
  var line_null = new Plottable.Component.Table([[axis_array[11], line1],[null, axis_array[10]]]);
  var line2 = new Plottable.Plot.Line(data[1], scale_array[12], scale_array[13]);
  var line_nan = new Plottable.Component.Table([[axis_array[13], line2],[null, axis_array[12]]]);
  var line3 = new Plottable.Plot.Line(data[2], scale_array[14], scale_array[15]);
  var line_undefined = new Plottable.Component.Table([[axis_array[15], line3],[null, axis_array[14]]]);
  var line4 = new Plottable.Plot.Line(data[3], scale_array[16], scale_array[17]);
  var line_false = new Plottable.Component.Table([[axis_array[17], line4],[null, axis_array[16]]]);
  var line5 = new Plottable.Plot.Line(data[4], scale_array[18], scale_array[19]);
  var line_empty = new Plottable.Component.Table([[axis_array[19], line5],[null, axis_array[18]]]);
  var lineTable = new Plottable.Component.Table([ [line_null, line_nan, line_undefined, line_false, line_empty] ]);

  var area1 = new Plottable.Plot.Area(data[0], scale_array[20], scale_array[21]);
  var area_null = new Plottable.Component.Table([[axis_array[21], area1],[null, axis_array[20]]]);
  var area2 = new Plottable.Plot.Area(data[1], scale_array[22], scale_array[23]);
  var area_nan = new Plottable.Component.Table([[axis_array[23], area2],[null, axis_array[22]]]);
  var area3 = new Plottable.Plot.Area(data[2], scale_array[24], scale_array[25]);
  var area_undefined = new Plottable.Component.Table([[axis_array[25], area3],[null, axis_array[24]]]);
  var area4 = new Plottable.Plot.Area(data[3], scale_array[26], scale_array[27]);
  var area_false = new Plottable.Component.Table([[axis_array[27], area4],[null, axis_array[26]]]);
  var area5 = new Plottable.Plot.Area(data[4], scale_array[28], scale_array[29]);
  var area_empty = new Plottable.Component.Table([[axis_array[29], area5],[null, axis_array[28]]]);
  var areaTable = new Plottable.Component.Table([ [area_null, area_nan, area_undefined, area_false, area_empty] ]);

  var vbar1 = new Plottable.Plot.VerticalBar(data[0], scale_array[30], scale_array[31]);
  var vbar_null = new Plottable.Component.Table([[axis_array[31], vbar1],[null, axis_array[30]]]);
  var vbar2 = new Plottable.Plot.VerticalBar(data[1], scale_array[32], scale_array[33]);
  var vbar_nan = new Plottable.Component.Table([[axis_array[33], vbar2],[null, axis_array[32]]]);
  var vbar3 = new Plottable.Plot.VerticalBar(data[2], scale_array[34], scale_array[35]);
  var vbar_undefined = new Plottable.Component.Table([[axis_array[35], vbar3],[null, axis_array[34]]]);
  var vbar4 = new Plottable.Plot.VerticalBar(data[3], scale_array[36], scale_array[37]);
  var vbar_false = new Plottable.Component.Table([[axis_array[37], vbar4],[null, axis_array[36]]]);
  var vbar5 = new Plottable.Plot.VerticalBar(data[4], scale_array[38], scale_array[39]);
  var vbar_empty = new Plottable.Component.Table([[axis_array[39], vbar5],[null, axis_array[38]]]);
  var vbarTable = new Plottable.Component.Table([ [vbar_null, vbar_nan, vbar_undefined, vbar_false, vbar_empty] ]);

  var chartTable = new Plottable.Component.Table([
    [scatterLabel, scatterTable],
    [lineLabel, lineTable],
    [areaLabel, areaTable],
    [vbarLabel, vbarTable]]);

  var finalTable = new Plottable.Component.Table([
    [title],
    [desc],
    [chartTable] ]);

  finalTable.padding(10,0)

  finalTable.renderTo(svg);

}
