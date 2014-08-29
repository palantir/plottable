
function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];

}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  data = _.cloneDeep(data);

    var boringData = function () {
        return [{x: 0, y: 0}, {x: 0, y: 2}, {x: 1, y: 2}, {x: 1, y: 4}, {x: 2, y: 4}, {x: 2, y: 6}, {x: 30, y: 70}];
    };


    var dataseries1 = new Plottable.Dataset(boringData());
    var dataseries2 = new Plottable.Dataset(boringData());
    var dataseries3 = new Plottable.Dataset(boringData());


    //Axis
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    xScale.domain([0, 3]);
    yScale.domain([0, 8]);
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");
    var xAxis2 = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis2 = new Plottable.Axis.Numeric(yScale, "left");

    //rendering
    var linePlot = new Plottable.Plot.Line(dataseries2, xScale, yScale);
    var scatterPlot = new Plottable.Plot.Scatter(dataseries3, xScale, yScale);

    var autoXLabel = new Plottable.Component.Label("autodomain X");
    var focusXLabel = new Plottable.Component.Label("focus X");
    var autoYLabel = new Plottable.Component.Label("autodomain Y");
    var focusYLabel = new Plottable.Component.Label("focus Y");

    var basicTable = new Plottable.Component.Table()
        .addComponent(2, 0, yAxis2)
        .addComponent(2, 1, linePlot)
        .addComponent(2, 2, yAxis)
        .addComponent(2, 3, scatterPlot)
        .addComponent(3, 3, xAxis)
        .addComponent(3, 1, xAxis2)
        .addComponent(4, 1, autoXLabel)
        .addComponent(5, 1, focusXLabel)
        .addComponent(4, 3, autoYLabel)
        .addComponent(5, 3, focusYLabel);

    basicTable.renderTo(svg);

    function xAuto(){
         xScale.autoDomain();
    }
    function yAuto(){
         yScale.autoDomain();
    }
    function xFocus(){
        xScale.domain([0, 3]);
    }
    function yFocus(){
        yScale.domain([0, 8]);
    }
<<<<<<< HEAD
    var xAutoInteraction = new
||||||| merged common ancestors
    xAutoInteraction = new            
=======
    xAutoInteraction = new
>>>>>>> rename-datasource
        Plottable.Interaction.Click(autoXLabel)
        .callback(xAuto)
        .registerWithComponent();
<<<<<<< HEAD
    var yAutoInteraction = new
||||||| merged common ancestors
    yAutoInteraction = new            
=======
    yAutoInteraction = new
>>>>>>> rename-datasource
        Plottable.Interaction.Click(autoYLabel)
        .callback(yAuto)
        .registerWithComponent();
<<<<<<< HEAD
    var xFocusInteraction = new
||||||| merged common ancestors
    xFocusInteraction = new            
=======
    xFocusInteraction = new
>>>>>>> rename-datasource
        Plottable.Interaction.Click(focusXLabel)
        .callback(xFocus)
        .registerWithComponent();
<<<<<<< HEAD
    var yFocusInteraction = new
||||||| merged common ancestors
    yFocusInteraction = new            
=======
    yFocusInteraction = new
>>>>>>> rename-datasource
        Plottable.Interaction.Click(focusYLabel)
        .callback(yFocus)
        .registerWithComponent();



}
