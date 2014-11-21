
function makeData() {
  "use strict";
  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";
  var svg = div.append("svg").attr("height", 500);

  var dates = [];

  var xScale = new Plottable.Scale.Time();
  var yScale = new Plottable.Scale.Linear();
  var ds = new Plottable.Dataset(dates);
  var parse = function(d) {return d3.time.format("%x").parse(d.x);};
  var plot = new Plottable.Plot.VerticalBar(xScale, yScale)
                      .addDataset(ds)
                      .attr("x", parse, xScale)
                      .project("y", "y", yScale);

  var xAxis = new Plottable.Axis.Time(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var title = new Plottable.Component.TitleLabel("Click to add data");

  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var renderGroup = plot.merge(gridlines);
  var titleTable = new Plottable.Component.Table([[title]]);
  var contentTable = new Plottable.Component.Table([
                                                    [yAxis, renderGroup],
                                                    [null, xAxis]]);
  new Plottable.Component.Table([
                                 [titleTable],
                                 [contentTable]
                                 ]).renderTo(svg);


  function addData(){
    var d = ds.data();
    var pts = d.length;
    if(pts >= 50){return;}
    var date = Math.floor((data[1][pts].x * 73) % 12) + 1;
    date = date + "/";
    date = date + ((Math.floor(data[0][pts].y * 91) % 28) + 1);
    date = date + "/";
    date = date + Math.floor(data[0][pts].x * 3000);
    var obj = {x: date, y: data[1][pts].y * 500 - 250};

    d.push(obj);
    ds.data(d);

  }
  var clickInteraction = new Plottable.Interaction.Click().callback(addData);
  title.registerInteraction(clickInteraction);
}
