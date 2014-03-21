function lineChart(svg, dataset) {
  var xScale = new Plottable.QuantitiveScale(d3.time.scale())
              .domain([new Date(2014, 0, 20), new Date(2014, 2, 23)]).nice();
  var yScale = new Plottable.LinearScale();

  function x(d) { return d.date; }

  var total = 0;
  dataset.data.forEach(function(d) {
    total += d.insertions;
    total -= d.deletions;
    d.total = total;
  });
  function y(d) { return d.total; }

  var renderer = new Plottable.LineRenderer(dataset, xScale, yScale, x, y);
  var gridlines = new Plottable.Gridlines(xScale, yScale);
  var group = gridlines.merge(renderer);

  var dateFormatter = d3.time.format("%-m/%-d/%y");
  var xAxis  = new Plottable.XAxis(xScale, "bottom", dateFormatter);

  var yAxis  = new Plottable.YAxis(yScale, "left").showEndTickLabels(true);

  var table  = new Plottable.Table().addComponent(0, 0, yAxis)
                                    .addComponent(0, 1, group)
                                    .addComponent(1, 1, xAxis);

  var title = new Plottable.TitleLabel("Lines of Code over Time");
  var full  = new Plottable.Table([[title], [table]]);
  full.renderTo(svg);
  var ci = new Plottable.CrosshairsInteraction(renderer).registerWithComponent();
  var pzi = new Plottable.PanZoomInteraction(renderer, xScale, yScale).registerWithComponent();
}


function loadChart() {
  d3.json("http://rawgithub.com/palantir/plottable/master/examples/data/gitstats.json", function(data) {
    data.forEach(function(d) {
      d.date = new Date(d.date);
      d.name = d.name === "ashwinraman9" ? "aramaswamy" : d.name;
    });
    var dataset = {data: data, metadata: {}};
  var svg = d3.select("svg");
  lineChart(svg, dataset);
  });
}
window.onload = loadChart;
