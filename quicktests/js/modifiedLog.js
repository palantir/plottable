
function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];

}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);

    var bigger = function(d){
        d.x = Math.pow(3, d.x);
        d.y = Math.pow(3, d.y);
        if (d.x === Infinity) {d.x = Math.pow(10, 10);}
        if (d.y === Infinity) {d.y = Math.pow(10, 10);}
    };

  var d1 = data[0].slice(0, 20);
  d1.forEach(bigger);
  var d2 = data[0].slice(0, 20);
  d2.forEach(bigger);
  var d3 = data[0].slice(0, 20);
  d3.forEach(bigger);
  var d4 = data[0].slice(0, 20);
  d4.forEach(bigger);

    //data
    var dataseries1 = new Plottable.DataSource(d1);
    dataseries1.metadata({name: "series1"});
    var dataseries2 = new Plottable.DataSource(d2);
    dataseries2.metadata({name: "series2"});
    var dataseries3 = new Plottable.DataSource(d3);
    dataseries3.metadata({name: "series3"});
    var dataseries4 = new Plottable.DataSource(d4);
    dataseries4.metadata({name: "series4"});


    var colorScale1 = new Plottable.Scale.Color("20");
    colorScale1.domain(["series1", "series2", "series3", "series4"]);

    //Axis
    var xScale = new Plottable.Scale.ModifiedLog();
    var yScale = new Plottable.Scale.ModifiedLog();
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");


    var colorProjector = function(d, i, m) {
       return colorScale1.scale(m.name);
    };

    //rendering
    var renderAreaD1 = new Plottable.Plot.Line(dataseries1, xScale, yScale);
    var renderAreaD2 = new Plottable.Plot.Line(dataseries2, xScale, yScale);
    var renderAreaD3 = new Plottable.Plot.Line(dataseries3, xScale, yScale);
    var renderAreaD4 = new Plottable.Plot.Line(dataseries4, xScale, yScale);
    renderAreaD1.project("stroke", colorProjector);
    renderAreaD2.project("stroke", colorProjector);
    renderAreaD3.project("stroke", colorProjector);
    renderAreaD4.project("stroke", colorProjector);
    var renderAreas = renderAreaD1.merge(renderAreaD2)
                        .merge(renderAreaD3).merge(renderAreaD4);


    //title + legend
    var title1 = new Plottable.Component.TitleLabel( "Two Data Series", "horizontal");
    var legend1 = new Plottable.Component.Legend(colorScale1);
    var titleTable = new Plottable.Component.Table().addComponent(0,0, title1)
                                          .addComponent(0,1, legend1);

    var basicTable = new Plottable.Component.Table().addComponent(0,2, titleTable)
                .addComponent(1, 1, yAxis)
                .addComponent(1, 2, renderAreas)
                .addComponent(2, 2, xAxis);

    basicTable.renderTo(svg);
    function flipy(element, index, array) {
      element.y = -1 * element.y;
    }
    function flipx(element, index, array) {
      element.x = -1 * element.x;
    }

    function flipData() {
        var ds = dataseries4.data();
        ds.forEach(flipy);
        dataseries4.data(ds);

        ds = dataseries3.data();
        ds.forEach(flipy);
        ds.forEach(flipx);
        dataseries3.data(ds);

        ds = dataseries2.data();
        ds.forEach(flipx);
        dataseries2.data(ds);
    }
    flipData();

}
