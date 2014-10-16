(function iife(){

"use strict";

var P = Plottable.Plot;
var singlePlots = [P.VerticalBar];
var singleHorizontalPlots = [P.HorizontalBar];
var multipleDatasetPlots = [P.Line, P.Area, P.Scatter];
var stackedPlots = [P.StackedBar, P.StackedArea, P.ClusteredBar];
var stackedHorizontalPlots = [P.StackedBar, P.ClusteredBar];
var piePlots = [P.Pie];
var otherPlots = [P.Grid];

var plots = singlePlots.concat(singleHorizontalPlots, multipleDatasetPlots, stackedPlots, piePlots);
var div = d3.select(".results");
var plotwidth;
var plotheight;

//functions

function renderPlots(plottablePlots){
  plottablePlots.forEach(function(plot){
    var box = div.append("svg").attr("height", plotheight).attr("width", plotwidth);
    var chart = new Plottable.Component.Table([[plot]]);
    chart.renderTo(box);
  });
}

function addAllDatasets(plot, arr, numOfDatasets){
  if (numOfDatasets === "single") {
    plot.addDataset("d1" , arr[0]);
  }
  if (numOfDatasets === "multiple") {
    arr.forEach(function(dataset){
      plot.addDataset(dataset);
    });
  } 
  return plot;
}

function generatePlots(plots, dataType){
  var plottablePlots = [];
  plots.forEach(function(PlotType){
    var xScale = new Plottable.Scale.Ordinal();
    var yScale = new Plottable.Scale.Linear();
    var colorScale = new Plottable.Scale.Color();
    var plot = new PlotType(xScale, yScale);
      plot.attr("fill", "type", colorScale)
      .animate(true);


    if (singlePlots.indexOf(PlotType) > -1) { //if single dataset plot
      plot = addAllDatasets(plot, dataType[0], "single");
      plottablePlots.push(plot);
    }

    if (singleHorizontalPlots.indexOf(PlotType) > -1) { //if single horizontal plot
      xScale = new Plottable.Scale.Linear();
      yScale = new Plottable.Scale.Ordinal();
      colorScale = new Plottable.Scale.Color();
      plot = new PlotType(xScale, yScale);
      plot.project("x", "y", xScale)
          .project("y", "x", yScale)
          .attr("fill", "type", colorScale)
          .animate(true);
      plot = addAllDatasets(plot, dataType[0], "single");
      plottablePlots.push(plot);
    }

    if (multipleDatasetPlots.indexOf(PlotType) > -1) { //if multiple dataset plot
      plot = addAllDatasets(plot, dataType[1], "multiple");
      plottablePlots.push(plot);
    }

    if (stackedPlots.indexOf(PlotType) > -1) { //if stacked dataset plot
      plot = addAllDatasets(plot, dataType[2], "multiple");
      plottablePlots.push(plot);
    }

    if (stackedHorizontalPlots.indexOf(PlotType) > -1) { //if stacked horizontal dataset plot
      xScale = new Plottable.Scale.Linear();
      yScale = new Plottable.Scale.Ordinal();
      colorScale = new Plottable.Scale.Color();
      plot = new PlotType(xScale, yScale, false);

      plot.project("x", "y", xScale)
          .project("y", "x", yScale)
          .attr("fill", "type", colorScale)
          .animate(true);
      
      plot = addAllDatasets(plot, dataType[2], "multiple");
      plottablePlots.push(plot);
    }

    if (piePlots.indexOf(PlotType) > -1) { //if pie dataset plot
      plot.project("value", "x");
      plot = addAllDatasets(plot, dataType[0], "single");
      plottablePlots.push(plot);
    }
    
  });
  renderPlots(plottablePlots);
}

var orderByX = function(a,b){ 
  return a.x - b.x;
};

function setDatasetType(dataset, setType){
  dataset.forEach(function(datum){
    datum.type = setType;
  });
}

function makeRandomData(numPoints, series, scaleFactor) {
  if (typeof scaleFactor === "undefined") { scaleFactor = 1; }
  var data = [];
  for (var j = 0; j < series; j++){
    var dataset = [];
    for (var i = 0; i < numPoints; i++) {
      var x = Math.random();
      var r = { x: x, y: (x + x * Math.random()) * scaleFactor};
      dataset.push(r);
    }
    dataset.sort(orderByX);
    setDatasetType(dataset, j);
    data.push(dataset);
  }
  return data;
}

function prepareSingleData(data){
  data[0].map(function(element){element.type = ""+ element.x;});
  return data;
}

function prepareMultipleData(data){
  return data;
}

function prepareStackedData(data){
  var stackedData = [];
  var firstDataset = data[0];
  for (var i = 0; i < data.length; i++) {
    var dataset = data[i];
    for (var j = 0; j < dataset.length; j++) {
      dataset[j].x = firstDataset[j].x;
    }
    stackedData.push(dataset);
  }
  return stackedData;
}

function prepareData(seriesNumber){
  var data = [{x: "0", y: 0, type: "0"}];

  var categories = 5; //change this number for more/less data in multiple & stacked dataset
  var series = seriesNumber; //change this number for more/less stack
  var alldata = [];

  var singleData = prepareSingleData(makeRandomData(series, 1));
  var multipleData = prepareMultipleData(makeRandomData(categories, series, 1));
  var stackedData = prepareStackedData(makeRandomData(categories, series, 1));
  alldata.push(singleData, multipleData, stackedData);
  return alldata;
}

function initialize(){
  var seriesNumber = Number(document.getElementById("series").value);
  plotwidth = Number(document.getElementById("width").value);
  plotheight = Number(document.getElementById("height").value);

  d3.selectAll("svg").remove();
  var dataArray = prepareData(seriesNumber);
  generatePlots(plots, dataArray);
}

var button = document.getElementById("render");
button.onclick = initialize;

})();

