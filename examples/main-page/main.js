window.onload = function() {
  d3.json("../examples/data/gitstats.json", function(data) {
    data.forEach(function(d) {
      d.date = new Date(d.date);
      d.name = d.name === "ashwinraman9" ? "aramaswamy" : d.name;
    });
    data.reverse();
    datachart(data);
  });
}



function datachart(data) {
  var svg = d3.select("#intro-chart");
  var width = svg.node().clientWidth;
  var height = width * 0.75;
  svg.attr("height", height);
  var xScale = new Plottable.QuantitiveScale(d3.time.scale());
  xScale.domain([new Date(2013, 12, 1), new Date(2014, 3, 20)]);
  var yScale = new Plottable.LinearScale();
  var rScale = new Plottable.QuantitiveScale(d3.scale.log()).range([3, width/60]);
  rScale.widenDomainOnData(data, linesAddedAccessor);
  var colorScale = new Plottable.ColorScale()
                    .domain(["danmane", "jlan", "aramaswamy", "derekcicerone"])
                    .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728"]);

  function hourAccessor(d) {
    var date = d.date;
    var hour =  date.getHours() + date.getMinutes() / 60;
    hour = hour < 5 ? hour + 24 : hour;
    return hour;
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
  var dateFormatter = d3.time.format("%-m/%-d/%y");
  function hourFormatter(hour) {
    if (hour < 12) {
      return hour + "AM";
    } else if (hour === 12) {
      return "12PM";
    } else if (hour < 24) {
      return (hour - 12) + "PM";
    } else if (hour == 24) {
      return "12AM";
    } else {
      return (hour - 24) + "AM";
    }
  }
  var legend = new Plottable.Legend(colorScale).colMinimum(160).xOffset(-15).yOffset(10);
  var gridlines = new Plottable.Gridlines(xScale, yScale);
  var group = gridlines.merge(renderer).merge(legend);


  var xAxis = new Plottable.XAxis(xScale, "bottom", dateFormatter);
  var xLabel = new Plottable.AxisLabel("Date of Commit");
  var xAxisT = new Plottable.Table([[xAxis], [xLabel]]);

  var yAxis = new Plottable.YAxis(yScale, "left", hourFormatter).showEndTickLabels(true);
  var yLabel = new Plottable.AxisLabel("Commit Time", "vertical-left");
  var yAxisT = new Plottable.Table([[yLabel, yAxis]]);
  var table = new Plottable.Table().addComponent(0, 0, yAxisT)
                                   .addComponent(0, 1, group)
                                   .addComponent(1, 1, xAxisT);

  var outer = new Plottable.Table([[table, legend]]);
  var title = new Plottable.TitleLabel("Plottable.js Commit History");
  var full = new Plottable.Table([[title], [table]]);
  full.renderTo(svg);
  xScale.domain([new Date(2014, 0, 20), new Date(2014, 2, 22)]).nice();
  yScale.domain([8, 26]);
}
