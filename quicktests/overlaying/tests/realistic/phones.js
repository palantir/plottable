
function makeData() {
  "use strict";
  var dataAustralia = [
    {phoneType: "feature",  demographic: "Male",        value: 0.33},
    {phoneType: "feature",  demographic: "Female",      value: 0.29},
    {phoneType: "feature",  demographic: "Ages 16-24",  value: 0.19},
    {phoneType: "feature",  demographic: "Ages 25-34",  value: 0.21},
    {phoneType: "feature",  demographic: "Ages 35-44",  value: 0.28},
    {phoneType: "feature",  demographic: "Ages 45-64",  value: 0.44},
    {phoneType: "smart",    demographic: "Male",        value: 0.64},
    {phoneType: "smart",    demographic: "Female",      value: 0.67},
    {phoneType: "smart",    demographic: "Ages 16-24",  value: 0.77},
    {phoneType: "smart",    demographic: "Ages 25-34",  value: 0.76},
    {phoneType: "smart",    demographic: "Ages 35-44",  value: 0.69},
    {phoneType: "smart",    demographic: "Ages 45-64",  value: 0.51}
  ];

  var dataIndia = [
    {phoneType: "feature",  demographic: "Male",        value: 0.76},
    {phoneType: "feature",  demographic: "Female",      value: 0.85},
    {phoneType: "feature",  demographic: "Ages 16-24",  value: 0.70},
    {phoneType: "feature",  demographic: "Ages 25-34",  value: 0.80},
    {phoneType: "feature",  demographic: "Ages 35-44",  value: 0.86},
    {phoneType: "feature",  demographic: "Ages 45-64",  value: 0.87},
    {phoneType: "smart",    demographic: "Male",        value: 0.13},
    {phoneType: "smart",    demographic: "Female",      value: 0.07},
    {phoneType: "smart",    demographic: "Ages 16-24",  value: 0.14},
    {phoneType: "smart",    demographic: "Ages 25-34",  value: 0.12},
    {phoneType: "smart",    demographic: "Ages 35-44",  value: 0.09},
    {phoneType: "smart",    demographic: "Ages 45-64",  value: 0.06}
  ];

  var dataRoK = [
    {phoneType: "feature",  demographic: "Male",        value: 0.20},
    {phoneType: "feature",  demographic: "Female",      value: 0.25},
    {phoneType: "feature",  demographic: "Ages 16-24",  value: 0.08},
    {phoneType: "feature",  demographic: "Ages 25-34",  value: 0.07},
    {phoneType: "feature",  demographic: "Ages 35-44",  value: 0.21},
    {phoneType: "feature",  demographic: "Ages 45-64",  value: 0.38},
    {phoneType: "smart",    demographic: "Male",        value: 0.68},
    {phoneType: "smart",    demographic: "Female",      value: 0.65},
    {phoneType: "smart",    demographic: "Ages 16-24",  value: 0.86},
    {phoneType: "smart",    demographic: "Ages 25-34",  value: 0.86},
    {phoneType: "smart",    demographic: "Ages 35-44",  value: 0.66},
    {phoneType: "smart",    demographic: "Ages 45-64",  value: 0.49}
  ];

  return {
    australia: dataAustralia,
    india: dataIndia,
    korea: dataRoK
  };
}

function run(div, data, Plottable) {
  "use strict";

  var AusColor = "#ff6969";
  var IndColor = "#662a48";
  var RoKColor = "#cc3300";

  var colorScale = new Plottable.Scales.Color();
  colorScale.domain(["Australia", "India", "South Korea"]);
  colorScale.range([AusColor, IndColor, RoKColor]);

  var legend = new Plottable.Components.Legend(colorScale)
    .maxEntriesPerRow(3)
    .xAlignment("left");

  var AusDataset = new Plottable.Dataset(data.australia);
  var IndDataset = new Plottable.Dataset(data.india);
  var RoKDataset = new Plottable.Dataset(data.korea);

  var xScale = new Plottable.Scales.Linear().domain([0, 1]);
  var xScaleReverse = new Plottable.Scales.Linear().domain([1, 0]);
  var yScale = new Plottable.Scales.Category();

  var AusLabels = new Plottable.Axes.Category(yScale, "left")
    .innerTickLength(0)
    .endTickLength(0);
  var IndLabels = new Plottable.Axes.Category(yScale, "left")
    .innerTickLength(0)
    .endTickLength(0);
  var RoKLabels = new Plottable.Axes.Category(yScale, "left")
    .innerTickLength(0)
    .endTickLength(0);
  var featureLabel = new Plottable.Components.Label("Feature Phones", 0);
  var smartLabel = new Plottable.Components.Label("Smart Phones", 0);

  var filterFeatureX = function(d){
    if(d.phoneType === "feature"){
      return d.value;
    }
  };
  var filterFeatureY = function(d){
    if(d.phoneType === "feature"){
      return d.demographic;
    }
  };
  var filterSmartX = function(d){
    if(d.phoneType === "smart"){
      return d.value;
    }
  };
  var filterSmartY = function(d){
    if(d.phoneType === "smart"){
      return d.demographic;
    }
  };
  var AusFeaturePlot = new Plottable.Plots.Bar("horizontal")
      .addDataset(AusDataset)
      .x(filterFeatureX, xScaleReverse)
      .y(filterFeatureY, yScale)
      .attr("fill", AusColor);

  var AusSmartPlot = new Plottable.Plots.Bar("horizontal")
      .addDataset(AusDataset)
      .x(filterSmartX, xScale)
      .y(filterSmartY, yScale)
      .attr("fill", AusColor);

  var IndFeaturePlot = new Plottable.Plots.Bar("horizontal")
      .addDataset(IndDataset)
      .x(filterFeatureX, xScaleReverse)
      .y(filterFeatureY, yScale)
      .attr("fill", IndColor);

  var IndSmartPlot = new Plottable.Plots.Bar("horizontal")
      .addDataset(IndDataset)
      .x(filterSmartX, xScale)
      .y(filterSmartY, yScale)
      .attr("fill", IndColor);

  var RoKFeaturePlot = new Plottable.Plots.Bar("horizontal")
      .addDataset(RoKDataset)
      .x(filterFeatureX, xScaleReverse)
      .y(filterFeatureY, yScale)
      .attr("fill", RoKColor);

  var RoKSmartPlot = new Plottable.Plots.Bar("horizontal")
      .addDataset(RoKDataset)
      .x(filterSmartX, xScale)
      .y(filterSmartY, yScale)
      .attr("fill", RoKColor);

  var table = new Plottable.Components.Table([[legend,          null,       null],
                                              [featureLabel,    null,       smartLabel],
                                              [AusFeaturePlot,  AusLabels,  AusSmartPlot],
                                              [IndFeaturePlot,  IndLabels,  IndSmartPlot],
                                              [RoKFeaturePlot,  RoKLabels,  RoKSmartPlot]]);
  table.renderTo(div);
}
