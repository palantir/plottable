
function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
<<<<<<< HEAD
||||||| merged common ancestors
  
=======

>>>>>>> rename-datasource
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);

  var alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i",
  "j", "k", "l", "m", "n", "o", "p", "q", "r", "s",
  "t", "u", "v", "w", "x", "y", "z"];

  var ds = new Plottable.DataSource();
  var xScale = new Plottable.Scale.Ordinal();
  var xAxis = new Plottable.Axis.Category(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

<<<<<<< HEAD
  var gridlines = new Plottable.Component.Gridlines(null, yScale);
  var addLabel = new Plottable.Component.Label("add bar");
  var removeLabel = new Plottable.Component.Label("remove bar");
||||||| merged common ancestors
      ds = new Plottable.DataSource(d);
      var xScale = new Plottable.Scale.Ordinal();
      var xAxis = new Plottable.Axis.Category(xScale, "bottom");
=======
      ds = new Plottable.Dataset(d);
      var xScale = new Plottable.Scale.Ordinal();
      var xAxis = new Plottable.Axis.Category(xScale, "bottom");
>>>>>>> rename-datasource

<<<<<<< HEAD
  var widthPicker = function(){
    var availableSpace = xAxis.availableWidth;
    var numBars = ds.data().length;
    var w = availableSpace * 0.7 / numBars;
    return w;
  };
||||||| merged common ancestors
      var yScale = new Plottable.Scale.Linear();
      var yAxis = new Plottable.Axis.Numeric(yScale, "left");
        
      var gridlines = new Plottable.Component.Gridlines(null, yScale);
      var addLabel = new Plottable.Component.Label("add bar");
      var removeLabel = new Plottable.Component.Label("remove bar");
        
        widthPicker = function(){
            var availableSpace = xAxis.width();
            var bars = d.length;
            var w = availableSpace * .7 / bars;
            console.log(w);
            return w;
=======
      var yScale = new Plottable.Scale.Linear();
      var yAxis = new Plottable.Axis.Numeric(yScale, "left");

      var gridlines = new Plottable.Component.Gridlines(null, yScale);
      var addLabel = new Plottable.Component.Label("add bar");
      var removeLabel = new Plottable.Component.Label("remove bar");

        widthPicker = function(){
            var availableSpace = xAxis.width();
            var bars = d.length;
            var w = availableSpace * .7 / bars;
            console.log(w);
            return w;
>>>>>>> rename-datasource

<<<<<<< HEAD
  var barRenderer = new Plottable.Plot.VerticalBar(ds, xScale, yScale)
                                 .project("x", "name", xScale)
                                 .project("y", "age", yScale)
                                 .project("width", widthPicker);
  var chart = new Plottable.Component.Table([
                                            [yAxis, gridlines.merge(barRenderer)],
                                            [null,  xAxis],
                                            [addLabel, removeLabel]
  ]).renderTo(svg);
||||||| merged common ancestors
            
        }
=======

        }
>>>>>>> rename-datasource


  function addBar() {
    var data2 = ds.data();
    if(data2.length < alphabet.length) {
      var newBar = { name: alphabet[data2.length], age: data[0][data2.length].y };
      data2.push(newBar);
      console.log(newBar);
    }
    ds.data(data2);
    barRenderer.project("width", widthPicker);
  }

<<<<<<< HEAD
  function removeBar() {
    var data2 = ds.data();
    if(data2.length > 0){  data2.pop();   }
    ds.data(data2);
    barRenderer.project("width", widthPicker);
  }

  var addClick = new Plottable.Interaction.Click(addLabel)
                              .callback(addBar)
                              .registerWithComponent();
  var removeClick = new Plottable.Interaction.Click(removeLabel)
                              .callback(removeBar)
                              .registerWithComponent();
}
||||||| merged common ancestors
        function addBar() {
          var data2 = ds.data();
          if(data2.length < alphabet.length){
              var newBar = { name: alphabet[data2.length], age: data[0][data2.length].y };
              data2.push(newBar);
              console.log(newBar);
          }
          ds.data(data2);
          barRenderer.project("width", widthPicker);
        }
        function removeBar() {
          var data2 = ds.data();
            if(data2.length > 0){  data2.pop();   }
          ds.data(data2);
          barRenderer.project("width", widthPicker);
        }
        addClick = new Plottable.Interaction.Click(addLabel)
        .callback(addBar)
        .registerWithComponent();
        removeClick = new Plottable.Interaction.Click(removeLabel)
        .callback(removeBar)
        .registerWithComponent();
}
=======
        function addBar() {
          var data2 = ds.data();
          if(data2.length < alphabet.length){
              var newBar = { name: alphabet[data2.length], age: data[0][data2.length].y };
              data2.push(newBar);
              console.log(newBar);
          }
          ds.data(data2);
          barRenderer.project("width", widthPicker);
        }
        function removeBar() {
          var data2 = ds.data();
            if(data2.length > 0){  data2.pop();   }
          ds.data(data2);
          barRenderer.project("width", widthPicker);
        }
        addClick = new Plottable.Interaction.Click(addLabel)
        .callback(addBar)
        .registerWithComponent();
        removeClick = new Plottable.Interaction.Click(removeLabel)
        .callback(removeBar)
        .registerWithComponent();
}
>>>>>>> rename-datasource
