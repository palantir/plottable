
var singlePlots = ["VerticalBar"];
var singleHorizontalPlots = ["HorizontalBar"];
var multipleDatasetPlots = ["Line", "Area", "Scatter"];
var stackedPlots = ["StackedBar", "StackedArea", "ClusteredBar"];
var stackedHorizontalPlots = ["StackedBar", "ClusteredBar"]
var piePlots = ["Pie"]
var otherPlots = ["Grid"];

var plots = singlePlots.concat(singleHorizontalPlots, multipleDatasetPlots, stackedPlots, piePlots);
var div = d3.select(".results");
var plotwidth;
var plotheight;

//functions

function initialize(){
  var seriesNumber = Number($("#series")[0].value);
  plotwidth = Number($("#width")[0].value);
  plotheight = Number($("#height")[0].value);

  d3.selectAll("svg").remove();
  var dataArray = prepareData(seriesNumber);
  generatePlots(plots, dataArray);
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

//dataType[0] = singleData
//dataType[1] = multipleData
//dataType[2] = stackedData

function generatePlots(plots, dataType){
  var plottablePlots = [];
  for(i = 0; i < plots.length; i++){

    var plotType = plots[i];
    var xScale = new Plottable.Scale.Ordinal();
    var yScale = new Plottable.Scale.Linear();
    var colorScale = new Plottable.Scale.Color();
    var string = "new Plottable.Plot." + plotType + "(xScale, yScale)";
    var plot = eval(string);
    plot.project("fill", "type", colorScale)
        .animate(true)


    if(singlePlots.indexOf(plotType) > -1){ //if single dataset plot
      plot = addAllDatasets(plot, dataType[0], "single");
      plottablePlots.push(plot);
    }

    if(singleHorizontalPlots.indexOf(plotType) > -1){ //if single horizontal plot
      xScale = new Plottable.Scale.Linear();
      yScale = new Plottable.Scale.Ordinal();
      colorScale = new Plottable.Scale.Color();
      string = "new Plottable.Plot." + plotType + "(xScale, yScale)";
      plot = eval(string);

      plot.project("x", "y", xScale)
          .project("y", "x", yScale)
          .project("fill", "type", colorScale)
          .animate(true)
      
      plot = addAllDatasets(plot, dataType[0], "single");
      plottablePlots.push(plot);
    }


    if(multipleDatasetPlots.indexOf(plotType) > -1){ //if multiple dataset plot
      plot = addAllDatasets(plot, dataType[1], "multiple");
      plottablePlots.push(plot);
    }

    if(stackedPlots.indexOf(plotType) > -1){ //if stacked dataset plot
      plot = addAllDatasets(plot, dataType[2], "stacked");
      plottablePlots.push(plot);
    }

    if(stackedHorizontalPlots.indexOf(plotType) > -1){ //if stacked horizontal dataset plot
      xScale = new Plottable.Scale.Linear();
      yScale = new Plottable.Scale.Ordinal();
      colorScale = new Plottable.Scale.Color();
      string = "new Plottable.Plot." + plotType + "(xScale, yScale, false)";
      plot = eval(string);

      plot.project("x", "y", xScale)
          .project("y", "x", yScale)
          .project("fill", "type", colorScale)
          .animate(true)
      
      plot = addAllDatasets(plot, dataType[2], "stacked");
      plottablePlots.push(plot);
    }

    if(piePlots.indexOf(plotType) > -1){ //if pie dataset plot
      plot.project("value", "x");
      plot = addAllDatasets(plot, dataType[0], "single");
      plottablePlots.push(plot);
    }
  }
  renderPlots(plottablePlots);
}

function addAllDatasets(plot, arr, type){
  if(type === "single"){
    plot.addDataset("d1" , arr[0]);
  }
  if(type === "multiple"){
    arr.forEach(function(dataset){
      plot.addDataset(dataset);
    });
  }
  if(type === "stacked"){
    arr.forEach(function(dataset){
      plot.addDataset(dataset);
    });
  }
  return plot;
}

function renderPlots(plottablePlots){
  plottablePlots.forEach(function(plot){
    box = div.append("svg").attr("height", plotheight).attr("width", plotwidth);
    chart = new Plottable.Component.Table([[plot]]);
    chart.renderTo(box);
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
    dataset.sort(function (a, b) {
      return a.x - b.x;
    });
    dataset.map(function(element){element.type = j})
    data.push(dataset)
  }
  return data;
}

function prepareSingleData(data){
  data[0].map(function(element){element.type = ""+ element.x});
  return data;
}

function prepareMultipleData(data){
  return data;
}

function prepareStackedData(data){
  var stackedData = [];
  var firstDataset = data[0]
  for (var i = 0; i < data.length; i++){
    var dataset = data[i];
    for(var j = 0; j < dataset.length; j++){
      dataset[j].x = firstDataset[j].x
    }
    stackedData.push(dataset);
  }
  return stackedData;
}
