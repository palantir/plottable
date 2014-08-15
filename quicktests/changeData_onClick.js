function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
}

//test for update on data change

function run(div, data, Plottable) {
    var svg = div.append("svg").attr("height", 500);

    var numPts = 5;
    var toggler = false;

    var dataseries1 = new Plottable.DataSource(data[0].splice(0, 5));
    
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");

    domainer_y = new Plottable.Domainer()
    .addIncludedValue(1.3)
    .pad();
    domainer_x = new Plottable.Domainer()
    .pad(.1)
    .addIncludedValue(0)
    .addPaddingException(0);

    xScale.domainer(domainer_x);
    yScale.domainer(domainer_y);


    var barPlot = new Plottable.Plot.VerticalBar(dataseries1, xScale, yScale)
    .animate(true)
    .baseline(1.3); 

    var toggle2 = new Plottable.Component.TitleLabel("Include 2");
    
    
    var basicTable = new Plottable.Component.Table()
    .addComponent(2, 0, yAxis)
    .addComponent(2, 1, barPlot)
    .addComponent(3, 1, xAxis)
    .addComponent(4, 1, toggle2);

    basicTable.renderTo(svg);


    cb = function(x, y){
        if(numPts === 5){
            dataseries1.data(data[1].slice(0, 10));
            numPts = 10;
        } else {
            dataseries1.data(data[0].slice(0, 5));
            numPts = 5;
        }
    }  
    function toggleinclude() {
        console.log(toggler);
        toggler?domainer_y.removeIncludedValue(2):domainer_y.addIncludedValue(2);   
        toggler = !toggler;
    }


    clickInteraction = new Plottable.Interaction.Click(barPlot)
    .callback(cb)
    .registerWithComponent();
    toggleInteraction = new Plottable.Interaction.Click(toggle2)
    .callback(toggleinclude)
    .registerWithComponent();

}