function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);


    //data

    var dataseries1 = new Plottable.DataSource(data[0]);

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
    var renderAreaD1 = new Plottable.Plot.Scatter(dataseries1, xScale, yScale)
                                    .project("r", widthProjector)
                                    .project("fill", colorProjector)
                                    .project("opacity", opacityProjector)
                                    .animate(true);

    //title + legend
    var title1 = new Plottable.Component.TitleLabel( "Opacity, r, color", "horizontal");


    var basicTable = new Plottable.Component.Table().addComponent(0,2, title1)
                .addComponent(1, 1, yAxis)
                .addComponent(1, 2, renderAreaD1)
                .addComponent(2, 2, xAxis);

    basicTable.renderTo(svg);

}
