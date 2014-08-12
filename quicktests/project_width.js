
function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
  
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);
  data = _.cloneDeep(data);

     var ds;
        var d = [];
        var alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i",
                       "j", "k", "l", "m", "n", "o", "p", "q", "r", "s",
                       "t", "u", "v", "w", "x", "y", "z"];
    var barRenderer;


      ds = new Plottable.DataSource(d);
      var xScale = new Plottable.Scale.Ordinal();
      var xAxis = new Plottable.Axis.Category(xScale, "bottom");

      var yScale = new Plottable.Scale.Linear();
      var yAxis = new Plottable.Axis.Numeric(yScale, "left");
        
      var gridlines = new Plottable.Component.Gridlines(null, yScale);
      var addLabel = new Plottable.Component.TitleLabel("add bar");
      var removeLabel = new Plottable.Component.TitleLabel("remove bar");
        
        widthPicker = function(){
            var availableSpace = xAxis.width();
            var bars = d.length;
            var w = availableSpace * .7 / bars;         
        }

      barRenderer = new Plottable.Plot.VerticalBar(ds, xScale, yScale)
                      .project("x", "name", xScale)
                      .project("y", "age", yScale)
                      .project("width", widthPicker);
      var chart = new Plottable.Component.Table([
                                  [yAxis, gridlines.merge(barRenderer)],
                                  [null,  xAxis],
                                  [addLabel, removeLabel]
                                ]);
        chart.renderTo(svg);


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