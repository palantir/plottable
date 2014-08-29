function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

//test for update on data change

function run(div, data, Plottable) {
  "use strict";

    var svg = div.append("svg").attr("height", 500);

    var numPts = 5;

<<<<<<< HEAD
    var dataseries1 = new Plottable.DataSource(data[0].splice(0, 5));

||||||| merged common ancestors
    var dataseries1 = new Plottable.DataSource(data[0].splice(0, 5));
    
=======
    var dataseries1 = new Plottable.Dataset(data[0].splice(0, 5));

>>>>>>> rename-datasource
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");


    var renderArea1 = new Plottable.Plot.VerticalBar(dataseries1, xScale, yScale);
    renderArea1.animate(true);

    var renderArea2 = new Plottable.Plot.Scatter(renderArea1.dataset(), xScale, yScale);
    renderArea2.project("fill", function(){return "purple";});
    renderArea2.animate(true);

    var renderGroup = renderArea1.merge(renderArea2);

    var basicTable = new Plottable.Component.Table()
                .addComponent(2, 0, yAxis)
                .addComponent(2, 1, renderGroup)
                .addComponent(3, 1, xAxis);

    basicTable.renderTo(svg);


    var cb = function(x, y){
        if(numPts === 5){
            dataseries1.data(data[1].slice(0, 10));
            numPts = 10;
        } else {
            dataseries1.data(data[0].slice(0, 5));
            numPts = 5;
        }
<<<<<<< HEAD
    };
||||||| merged common ancestors
    }  
=======
    }
>>>>>>> rename-datasource

    window.xy = new Plottable.Interaction.Click(renderGroup)
        .callback(cb)
        .registerWithComponent();

}
