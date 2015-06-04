
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

  return [dataAustralia, dataIndia];
}

function run(svg, data, Plottable) {
  "use strict";

  var AusColor = "#ff6969";
  var IndColor = "#662a48";
  var AusDataset = new Plottable.Components.Dataset(data[0]);
  var IndDataset = new Plottable.Components.Dataset(data[1]);

  var xScale = new Plottable.Scales.Linear().domain([0, 1]);
  var xScale_reverse = new Plottable.Scales.Linear().domain([1, 0]);
  var yScale = new Plottable.Scales.Category();

  var AusLabels = new Plottable.Axes.Category(yScale, "left");
  var IndLabels = new Plottable.Axes.Category(yScale, "left");

  var filterFeatureX = function(d){
    if(d.phoneType === "feature"){
      return d.value;
    }
  }
  var filterFeatureY = function(d){
    if(d.phoneType === "feature"){
      return d.demographic;
    }
  }  
  var filterSmartX = function(d){
    if(d.phoneType === "smart"){
      return d.value;
    }
  }
  var filterSmartY = function(d){
    if(d.phoneType === "smart"){
      return d.demographic;
    }
  }  
  var AusFeaturePlot = new Plottable.Plots.Bar("horizontal")
      .dataset(AusDataset)
      .x(filterFeatureX, xScale_reverse)
      .y(filterFeatureY, yScale)
      .attr("fill", AusColor);

  var AusSmartPlot = new Plottable.Plots.Bar("horizontal")
      .dataset(AusDataset)
      .x(filterFeatureX, xScale)
      .y(filterFeatureY, yScale)
      .attr("fill", AusColor);

  var IndFeaturePlot = new Plottable.Plots.Bar("horizontal")
      .dataset(IndDataset)
      .x(filterFeatureX, xScale_reverse)
      .y(filterFeatureY, yScale)
      .attr("fill", IndColor);   

  var IndSmartPlot = new Plottable.Plots.Bar("horizontal")
      .dataset(IndDataset)
      .x(filterSmartX, xScale)
      .y(filterSmartY, yScale)
      .attr("fill", IndColor);          
  
  var table = new Plottable.Components.Table([[featureLabel,    null,       smartLabel],
                                              [AusFeaturePlot,  AusLabels,  AusSmartPlot],
                                              [IndFeaturePlot,  IndLabels,  IndSmartPlot]]);
}
