function commitChartD3(svg, data) {
  svg.classed("plottable", true);
  var svgWidth  = parseFloat(svg.attr("width"));
  var svgHeight = parseFloat(svg.attr("height"));
  var TITLE_HEIGHT = 46;
  var yAxisWidth   = 50;
  var yLabelWidth  = 22;
  var xAxisHeight  = 32;
  var xLabelHeight = 23;
  var renderAreaHeight = svgHeight - TITLE_HEIGHT - xAxisHeight - xLabelHeight;
  var renderAreaWidth  = svgWidth  - yAxisWidth - yLabelWidth;

  var xScale = new d3.time.scale()
        .domain([new Date(2014, 0, 20), new Date(2014, 2, 23)])
        .range([0, renderAreaWidth])
        .nice();

  var yScale = new d3.scale.linear()
        .domain([8, 26])
        .range([renderAreaHeight, 0])
        .nice();

  var rScale = new d3.scale.log()
        .range([2, 12])
        .domain(d3.extent(data, linesAddedAccessor));


  var colorScale = new d3.scale.ordinal()
        .domain(["danmane", "jlan", "aramaswamy", "derekcicerone"])
        .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728"]);


  var title  = svg.append("g").classed("title-label", true).classed("label", true);
  var xAxis  = svg.append("g").classed("x-axis" , true).classed("axis", true);
  var xLabel = svg.append("g").classed("axis-label", true).classed("label", true);
  var yAxis  = svg.append("g").classed("y-axis" , true).classed("axis", true);
  var yLabel = svg.append("g").classed("axis-label", true).classed("label", true);
  var plot   = svg.append("g").classed("plot"   , true);
  var legend = svg.append("g").classed("legend" , true);
  var grid   = plot.append("g").classed("gridlines", true);

  function translateG(g, x, y) {
    g.attr("transform", "translate(" + x + "," + y + ")");
  }
  translateG(yAxis, yLabelWidth + yAxisWidth, TITLE_HEIGHT);
  translateG(plot, yLabelWidth + yAxisWidth, TITLE_HEIGHT);
  translateG(xAxis, yLabelWidth + yAxisWidth, TITLE_HEIGHT + renderAreaHeight);
  translateG(xLabel, yLabelWidth + yAxisWidth, TITLE_HEIGHT + renderAreaHeight + xAxisHeight);
  translateG(legend, 965, 60);
  title.append("text").text("Commit History")
       .attr("dy", 36.8125).attr("x", 428);

  xLabel.append("text").text("Date of Commit")
        .attr("dy", 17.64).attr("x", 470);

  yLabel.append("text").text("Commit Time")
        .attr("dy", 17.64).attr("x", -306.5).attr("transform", "rotate(-90)");

  var legendTextHeight = 22;
  var legendUpdate = legend.selectAll(".legend-row").data(colorScale.domain());
  var legendEnter = legendUpdate.enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * legendTextHeight + ")" });
  legendEnter.append("circle")
             .attr("cx", 5).attr("cy", 5).attr("r", 10)
             .attr("fill", colorScale);
  legendEnter.append("text")
             .attr("x", legendTextHeight)
             .attr("y", 5 + legendTextHeight / 2)
             .text(function(d) { return d; });


  var dataSelection = plot.selectAll("circle").data(data);
  dataSelection.enter().append("circle");
  dataSelection.attr("cx", function(d) { return xScale(d.date) })
               .attr("cy", function(d) { return yScale(hourAccessor(d)) })
               .attr("r",  function(d) { return rScale(linesAddedAccessor(d)) })
               .attr("fill", function(d) { return colorScale(d.name) });

  var dateFormatter = d3.time.format("%-m/%-d/%y");
  var xAxisGen = d3.svg.axis().scale(xScale).tickFormat(dateFormatter);
  xAxis.call(xAxisGen);

  var yAxisGen = d3.svg.axis().scale(yScale).orient("left").tickFormat(hourFormatter);
  yAxis.call(yAxisGen);

  var xGrid = grid.selectAll(".x-line").data(xScale.ticks());
  xGrid.enter().append("line").classed("x-line", true);
  xGrid.attr("x1", xScale).attr("y1", 0).attr("x2", xScale).attr("y2", renderAreaHeight);

  var yGrid = grid.selectAll(".y-line").data(yScale.ticks());
  yGrid.enter().append("line").classed("y-line", true);
  yGrid.attr("x1", 0).attr("y1", yScale).attr("x2", renderAreaWidth).attr("y2", yScale);
}
