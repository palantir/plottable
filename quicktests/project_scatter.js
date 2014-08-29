function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);


    //data
<<<<<<< HEAD
    var dataseries1 = new Plottable.DataSource(data[0]);

||||||| merged common ancestors
    var dataseries1 = new Plottable.DataSource(data[0]);
    
=======
    var dataseries1 = new Plottable.Dataset(data[0]);

>>>>>>> rename-datasource
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
<<<<<<< HEAD
    var renderAreaD1 = new Plottable.Plot.Scatter(dataseries1, xScale, yScale)
                                    .project("r", widthProjector)
                                    .project("fill", colorProjector)
                                    .project("opacity", opacityProjector)
                                    .animate(true);

||||||| merged common ancestors
    renderAreaD1 = new Plottable.Plot.Scatter(dataseries1, xScale, yScale);   
    renderAreaD1
    .project("r", widthProjector)
    .project("fill", colorProjector)
    .project("opacity", opacityProjector)
    .animate(true);
    
=======
    renderAreaD1 = new Plottable.Plot.Scatter(dataseries1, xScale, yScale);
    renderAreaD1
    .project("r", widthProjector)
    .project("fill", colorProjector)
    .project("opacity", opacityProjector)
    .animate(true);

>>>>>>> rename-datasource
    //title + legend
    var title1 = new Plottable.Component.TitleLabel( "Opacity, r, color", "horizontal");

<<<<<<< HEAD

    var basicTable = new Plottable.Component.Table().addComponent(0,2, title1)
||||||| merged common ancestors
    
    basicTable = new Plottable.Component.Table().addComponent(0,2, title1)
=======

    basicTable = new Plottable.Component.Table().addComponent(0,2, title1)
>>>>>>> rename-datasource
                .addComponent(1, 1, yAxis)
                .addComponent(1, 2, renderAreaD1)
<<<<<<< HEAD
                .addComponent(2, 2, xAxis);

||||||| merged common ancestors
                .addComponent(2, 2, xAxis)
    
=======
                .addComponent(2, 2, xAxis)

>>>>>>> rename-datasource
    basicTable.renderTo(svg);

}
