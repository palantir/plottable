
function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
  
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var scatterPlot = new Plottable.Plot.Scatter(data[0].slice(0, 20), xScale, yScale);
  var initialDomains = {
    x: xScale.domain(),
    y: yScale.domain()
  }
  var explanation = new Plottable.Component.TitleLabel("Press 'a' to reset domain");

  var basicTable = new Plottable.Component.Table([[null, explanation],
    [yAxis, scatterPlot],
    [null, xAxis]])

  basicTable.renderTo(svg);

  var pzi = new Plottable.Interaction.PanZoom(scatterPlot, xScale, yScale).registerWithComponent();

  var ki = new Plottable.Interaction.Key(scatterPlot, 65);
  ki.callback(function() {
    xScale.domain(initialDomains.x);
    yScale.domain(initialDomains.y);
  });
  ki.registerWithComponent();

}