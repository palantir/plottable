function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);
        var renderers = [];


        var colors = new Plottable.Scale.Color("10").range();
        var numRenderers = 5;
        var names = ["bat", "cat", "mat", "rat", "pat"];
        var colorScale = new Plottable.Scale.Color();
        colorScale.range(colors);
        colorScale.domain(names);


        var xScale = new Plottable.Scale.Linear();
        var yScale = new Plottable.Scale.Linear();

        for (var i=0; i<numRenderers; i++) {
            var data2 = data[0].slice(i*5, i*5 + 5); //won't let me do data[0].slice(), splice, etc
            var renderer = new Plottable.Plot.Line(data2, xScale, yScale);
                renderers.push(renderer);
        }

        var cg = new Plottable.Component.Group();
        renderers.forEach(function(renderer, i) {
            renderer.project("stroke", function() { return colors[i]; });
            cg.merge(renderer);
        });

        var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
        var yAxis = new Plottable.Axis.Numeric(yScale, "left");

        var chart = new Plottable.Component.Table([
                                  [yAxis, cg],
                                  [null,  xAxis]
                                ]);
        
        var legendLabel = new Plottable.Component.TitleLabel("toggle");
  
    var legend = new Plottable.Component.Legend(colorScale);
      legend.toggleCallback(
      function (d, b) {
        var index = names.indexOf(d);
        renderers[index].classed("toggled-on", b);
        renderers[index].classed("toggled-off", !b);
      }
    );
        var legendTable = new Plottable.Component.Table([[legendLabel], [legend]]); 

        var outerTable = new Plottable.Component.Table([[chart, legendTable]]);
        outerTable.renderTo(svg);
}