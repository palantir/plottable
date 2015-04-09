function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);


    //data

    var dataseries1 = new Plottable.Dataset(data[0]);

    //Axis
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");


    var widthProjector = function(d, i, m) {
       return 25-(d.y*7);
    };

    var colorProjector = function(d, i, m) {
       var x = 22;
       x += Math.floor(d.y*30);
       var y = 10;
       y += Math.floor(d.x*40);
       return ("#11" + x + y);
    };

    var opacityProjector = function(d, i, m){
      return (d.x);
    };

    //rendering
    var renderAreaD1 = new Plottable.Plot.Scatter(xScale, yScale).addDataset(dataseries1)
                                    .attr("r", widthProjector)
                                    .attr("fill", colorProjector)
                                    .attr("opacity", opacityProjector)
                                    .project("x", "x", xScale)
                                    .project("y", "y", yScale)
                                    .animate(true);

    //title + legend
    var title1 = new Plottable.Component.TitleLabel( "Opacity, r, color", "horizontal");


    var basicTable = new Plottable.Component.Table().addComponent(title1, 0, 2)
                .addComponent(yAxis, 1, 1)
                .addComponent(renderAreaD1, 1, 2)
                .addComponent(xAxis, 2, 2);

    basicTable.renderTo(svg);

}
