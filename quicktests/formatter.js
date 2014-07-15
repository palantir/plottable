function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);

    var large_x = function(d){
         d.x = d.x*100000000;   
    }
    
    var custFormatter = new Plottable.Formatter.Custom(function(d) {
        if(parseInt(d) < 1){
             d = "less than 1";   
        }
        return d; 
    }, 0) ;
    

    var big_numbers = data[0].slice(0, 5);
    big_numbers.forEach(large_x);
    var dataseries1 = new Plottable.DataSource(big_numbers);

    //Axis
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");
        
    var plot = new Plottable.Plot.Line(dataseries1, xScale, yScale);
    var IdTitle = new Plottable.Component.Label("Identity");
    var GenTitle = new Plottable.Component.Label("General");
    var FixTitle = new Plottable.Component.Label("Fixed");
    var CurrTitle = new Plottable.Component.Label("Currency");
    var PerTitle = new Plottable.Component.Label("Percentage");
    var SITitle = new Plottable.Component.Label("SI");
    var CustTitle = new Plottable.Component.Label("Custom");
        
    var basicTable = new Plottable.Component.Table([[yAxis, plot], [null, xAxis]])
	var formatChoices = new Plottable.Component.Table([[IdTitle, GenTitle, FixTitle],[CurrTitle, null, PerTitle], [SITitle, null, CustTitle]]);                
    var bigTable = new Plottable.Component.Table([[basicTable],[formatChoices]]);
    formatChoices.xAlign("center");
    bigTable.renderTo(svg);
    


function identity_frmt(){
  xAxis.formatter(new Plottable.Formatter.Identity());  
  yAxis.formatter(new Plottable.Formatter.Identity());    
}
function general_frmt(){
  xAxis.formatter(new Plottable.Formatter.General(2));  
  yAxis.formatter(new Plottable.Formatter.General(2));      
}
function fixed_frmt(){
  xAxis.formatter(new Plottable.Formatter.Fixed(2));  
  yAxis.formatter(new Plottable.Formatter.Fixed(2));    
}
function currency_frmt(){
  xAxis.formatter(new Plottable.Formatter.Currency(2, '$', true));  
  yAxis.formatter(new Plottable.Formatter.Currency(2, '$', true));   
}
function percentage_frmt(){
  xAxis.formatter(new Plottable.Formatter.Percentage(2));  
  yAxis.formatter(new Plottable.Formatter.Percentage(2));   
}
function SI_frmt(){
   xAxis.formatter(new Plottable.Formatter.SISuffix(2)); 
   yAxis.formatter(new Plottable.Formatter.SISuffix(2));   
}
function custom_frmt(){
   xAxis.formatter(custFormatter);   
   yAxis.formatter(custFormatter);      
}
  window.xy = new Plottable.Interaction.Click(IdTitle)
    .callback(identity_frmt)
    .registerWithComponent();
  window.xy = new Plottable.Interaction.Click(GenTitle)
    .callback(general_frmt)
    .registerWithComponent();
  window.xy = new Plottable.Interaction.Click(FixTitle)
    .callback(fixed_frmt)
    .registerWithComponent();
  window.xy = new Plottable.Interaction.Click(CurrTitle)
    .callback(currency_frmt)
    .registerWithComponent();
  window.xy = new Plottable.Interaction.Click(PerTitle)
    .callback(percentage_frmt)
    .registerWithComponent();
  window.xy = new Plottable.Interaction.Click(SITitle)
    .callback(SI_frmt)
    .registerWithComponent();  
  window.xy = new Plottable.Interaction.Click(CustTitle)
    .callback(custom_frmt)
    .registerWithComponent();


}