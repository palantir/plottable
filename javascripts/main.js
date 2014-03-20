window.onload = function() {
  d3.json("../examples/data/gitstats.json", function(data) {
    data.forEach(function(d) {
      d.date = new Date(d.date);
      d.name = d.name === "ashwinraman9" ? "aramaswamy" : d.name;
    });
    datachart(data);
  });
}



function datachart(data) {
  var svg = d3.select("#svg1");
  var width = svg.node().clientWidth;
  var height = width * 0.75;
  svg.attr("height", height);
  var xScale = new Plottable.QuantitiveScale(d3.time.scale());
  xScale.domain([new Date(2013, 12, 1), new Date(2014, 3, 20)]);
  var yScale = new Plottable.LinearScale();
  var rScale = new Plottable.QuantitiveScale(d3.scale.log()).range([3, width/60]);
  rScale.widenDomainOnData(data, linesAddedAccessor);
  var colorScale = new Plottable.ColorScale("Category10");

  function hourAccessor(d) {
    var date = d.date;
    return date.getHours() + date.getMinutes() / 60;
  }

  function dateAccessor(d) {
    return d.date;
  }

  function linesAddedAccessor(d) {
    var added = d.insertions - d.deletions;
    return added > 0 ? added : 1;
  }

  function rAccessor(d) {
    return rScale.scale(linesAddedAccessor(d));
  }

  function colorAccessor(d) {
    return colorScale.scale(d.name);
  }

  var dataset = {data: data, metadata: {"cssClass": "foo"}};
  var renderer = new Plottable.CircleRenderer(dataset, xScale, yScale, dateAccessor, hourAccessor, rAccessor);
  renderer.colorAccessor(colorAccessor);
  var dateFormatter = d3.time.format("%-m/%-d");
  function hourFormatter(hour) {
    if (hour < 12) {
      return hour + "AM";
    } else if (hour === 12) {
      return "12PM";
    } else {
      return (hour - 12) + "PM"
    }
  }
  var group = renderer.merge(new Plottable.Gridlines(xScale, yScale));


  var xAxis = new Plottable.XAxis(xScale, "bottom", dateFormatter);
  var xLabel = new Plottable.AxisLabel("Date of Commit");
  var xAxisT = new Plottable.Table([[xAxis], [xLabel]]);

  var yAxis = new Plottable.YAxis(yScale, "left", hourFormatter);
  var yLabel = new Plottable.AxisLabel("Commit Time", "vertical-left");
  var yAxisT = new Plottable.Table([[yLabel, yAxis]]);
  var table = new Plottable.Table().addComponent(0, 0, yAxisT)
                                   .addComponent(0, 1, group)
                                   .addComponent(1, 1, xAxisT);

  var legend = new Plottable.Legend(colorScale);
  var outer = new Plottable.Table([[table, legend]]);
  var title = new Plottable.TitleLabel("Plottable.js Commit History");
  var full = new Plottable.Table([[title], [outer]]);
  full.renderTo(svg);
  // pzi = new Plottable.PanZoomInteraction(group, xScale, yScale).registerWithComponent();
// xScale.padDomain();
  xScale.domain([new Date(2014, 0, 18), new Date(2014, 2, 25)]);
  yScale.domain([8, 21]);
}
