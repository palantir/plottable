//show svg width & height setting

function expandSidebar(){

  "use strict";

  var content = $(".content");
  var sidebar = $(".sidebar");
  var controls = $(".controls");

  if(sidebar.position().left !== 0){
    sidebar.css("visibility", "visible");
    sidebar.animate({
      left: "0%"
    });
    content.animate({
      left: "20%"
    });
    controls.animate({
      width: "80%"
    });
  }
  else{
    sidebar.animate({
      left: "-20%"
    });
    content.animate({
      left: "0"
    }, function(){
      sidebar.css("visibility", "hidden");
    });
    controls.animate({
      width: "100%"
    });
  }
}

(function iife(){

"use strict";
var P = Plottable.Plots;
var singlePlots = [P.Bar];
var singleHorizontalPlots = [function() { return new P.Bar("horizontal"); }];
var multipleDatasetPlots = [P.Line, P.Area, P.Scatter];
var stackedPlots = [P.StackedBar, P.StackedArea, P.ClusteredBar];
var stackedHorizontalPlots = [P.StackedBar, P.ClusteredBar];
var piePlots = [P.Pie];

var plots = singlePlots.concat(singleHorizontalPlots, multipleDatasetPlots, stackedPlots, piePlots);
var div = d3.select(".results");
var plotwidth;
var plotheight;

//functions

function togglePlotDisplay(className){
  var classSelector = "." + className;
  var displayStatus = $(classSelector).css("display") === "none" ? "inline-block" : "none";
  $(classSelector).css("display", displayStatus);
}

function setupBindings(){
  //checkbox check handler
  $( "input[type=checkbox]" ).on( "click", function(){
    var plotName = this.parentNode.textContent;
    plotName = plotName.replace(" ", "");
    togglePlotDisplay(plotName);
  });

  //help button tooltip
  $("#help").hover(function(){
    $("#help-description").fadeIn("fast");
  }, function() {
      // Hover out code
      $("#help-description").css("display", "none");
  }).mousemove(function() {
      var windowWidth = window.innerWidth;
      var helpY = $("#help").position().top;
      $("#help-description").css({ top: helpY + 28, left: windowWidth - 360 });
  });
}

function populatePlotList(){
  plots.forEach(function(plot){
    div.append("div").attr("class", "single-plot " + plot.name);
  });
}

function populateSidebarList(){
  var startString = "<div class=\"sidebar-quicktest\"> <input class=\"quicktest-checkbox\" type=\"checkbox\">";
  var endString = "</div>";
  plots.forEach(function(plot){
    var finalstring = startString + plot.name + endString;
    $(".sidebar").append(finalstring);
  });
  $(".quicktest-checkbox").attr("checked", true);
}

function renderPlots(plottablePlots){
  plottablePlots.forEach(function(plot){
    var plotDivName = "." + plot.constructor.name;
    var plotDiv = d3.select(plotDivName);
    var box = plotDiv.append("div").style("height", `${plotheight}px`).style("width", `${plotwidth}px`);
    var chart = new Plottable.Components.Table([[plot]]);
    chart.renderTo(box.node());
  });
}

function addAllDatasets(plot, arr, numOfDatasets){
  if (numOfDatasets === "single") {
    plot.addDataset(new Plottable.Dataset(arr[0]));
  }
  if (numOfDatasets === "multiple") {
    arr.forEach(function(dataset){
      plot.addDataset(new Plottable.Dataset(dataset));
    });
  }
}

function generatePlots(dataType){
  var plottablePlots = [];
  plots.forEach(function(PlotType){
    var xScale = new Plottable.Scales.Category();
    var yScale = new Plottable.Scales.Linear();
    var colorScale = new Plottable.Scales.Color();
    var xFunc = function(d) { return d.x; };
    var yFunc = function(d) { return d.y; };
    var typeFunc = function(d) { return d.type; };

    var plot = new PlotType()
        .attr("fill", typeFunc, colorScale)
        .animated(true);

    if(piePlots.indexOf(PlotType) === -1) {
        plot.x(xFunc, xScale).y(yFunc, yScale);
    }

    if (singlePlots.indexOf(PlotType) > -1) { //if single dataset plot
      addAllDatasets(plot, dataType[0], "single");
      plottablePlots.push(plot);
    }

    if (singleHorizontalPlots.indexOf(PlotType) > -1) { //if single horizontal plot
      xScale = new Plottable.Scales.Linear();
      yScale = new Plottable.Scales.Category();
      colorScale = new Plottable.Scales.Color();
      plot = new PlotType();
      plot.x(yFunc, xScale)
          .y(xFunc, yScale)
          .attr("fill", typeFunc, colorScale)
          .animated(true);
      addAllDatasets(plot, dataType[0], "single");
      plottablePlots.push(plot);
    }

    if (multipleDatasetPlots.indexOf(PlotType) > -1) { //if multiple dataset plot
      addAllDatasets(plot, dataType[1], "multiple");
      plottablePlots.push(plot);
    }

    if (stackedPlots.indexOf(PlotType) > -1) { //if stacked dataset plot
      addAllDatasets(plot, dataType[2], "multiple");
      plottablePlots.push(plot);
    }

    if (stackedHorizontalPlots.indexOf(PlotType) > -1) { //if stacked horizontal dataset plot
      xScale = new Plottable.Scales.Linear();
      yScale = new Plottable.Scales.Category();
      colorScale = new Plottable.Scales.Color();
      plot = new PlotType();

      plot.x(yFunc, xScale)
          .y(xFunc, yScale)
          .attr("fill", typeFunc, colorScale)
          .animated(true);

      addAllDatasets(plot, dataType[2], "multiple");
      plottablePlots.push(plot);
    }

    if (piePlots.indexOf(PlotType) > -1) { //if pie dataset plot
      plot.sectorValue(xFunc);
      addAllDatasets(plot, dataType[0], "single");
      plottablePlots.push(plot);
    }

  });
  renderPlots(plottablePlots);
}

var orderByX = function(a, b){
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
  data[0].map(function(element){ element.type = "" + element.x; });
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
  var seriesNumber = Number(d3.select("#series").node().value);
  plotwidth = Number(d3.select("#width").node().value);
  plotheight = Number(d3.select("#height").node().value);

  d3.selectAll(".single-plot div").remove();
  var dataArray = prepareData(seriesNumber);
  generatePlots(dataArray);
}

//setup page
populateSidebarList();
populatePlotList();
setupBindings();

//render button click triggers initialize
var button = document.getElementById("render");
button.onclick = initialize;

})();

