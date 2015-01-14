$(document).ready(function(){

	var testCode;
	var SmallLin = [{x: 2, y: 9}, {x: 4, y: 18}, {x: 6, y: 27}];
	var SmallCat = [{x: 'A', y: 9}, {x: 'B', y: 18}, {x: 'C', y: 27}];
	var SmallRand = [{x: 2, y: 9}, {x: 40, y: 12}, {x: -7, y: 3}];
	var SmallTime = [{x: 2, y: 9}, {x: 4, y: 18}, {x: 6, y: 27}];


	chooseData = function(){
		var ds_type = $("#dataset option:selected").text();
		var data;

		switch(ds_type) {
		    case "SmallLin":
		        data = SmallLin.slice(0);
		        break;
		    case "SmallCat":
		        data = SmallCat.slice(0);
		        break;
		    case "SmallRand":
		        data = SmallRand.slice(0);
		        break;
		    case "SmallTime":
		        data = SmallTime.slice(0);
		        break;
		    default:
		        return null;
		}	
		testCode = testCode + "\tvar data = " + "**put data here** " + "; \n";
		testCode = testCode + "\tplot.addDataset(data);\n";
		return data;
	}

	choosePlot = function(xScale, yScale){
		var plot_type = $("#plotType option:selected").text();
		testCode = testCode + "\tvar plot = new Plottable.Plot."
		testCode = testCode + plot_type;
		testCode = testCode + "(xScale, yScale); \n";
		
		switch(plot_type) {
		    case "Scatter":
		        return new Plottable.Plot.Scatter(xScale, yScale);
		        break;
		    case "Line":
		        return new Plottable.Plot.Line(xScale, yScale);
		        break;
		    case "Area":
		        return new Plottable.Plot.Area(xScale, yScale);
		        break;   
		    case "Bar":
		        return new Plottable.Plot.Bar(xScale, yScale);
		        break;		         
		    default:
		        return null;
		}	
	}

	make_scale = function(axis){
		var axisType, scaleType;
		var scale;


		if( axis === 'x'){
			axisType = $("#xAxisType option:selected").text();
		}
		else{
			axisType = $("#yAxisType option:selected").text();			
		}

		testCode = testCode + "\tvar " + axis + "Scale = new Plottable.Scale.";

		switch(axisType) {
		    case "Time":
		    	scaleType = "Time";
		        scale = new Plottable.Scale.Time();
		        break;
		    case "Category":
		    	scaleType = "Ordinal";
		        scale = new Plottable.Scale.Ordinal()
		        break;
		    case "Numeric(Linear)":
		    	scaleType = "Linear";
		        scale = new Plottable.Scale.Linear();
		        break;  
			case "Numeric(Log)":
				scaleType = "Linear";
        		scale = new Plottable.Scale.ModifiedLog();
		        break;  	         	         
		    default:
		        return null;
		}	

		testCode = testCode + scaleType + "(); \n";
		return scale;
	}


	make_axis = function(axis, scale, orientation){
		var axisType, axisTypeString, params;
		var axisObj;

		if( axis === 'x'){
			axisType = $("#xAxisType option:selected").text();
			params = "(xScale, 'bottom')";
		}
		else{
			axisType = $("#yAxisType option:selected").text();		
			params = "(yScale, 'left')";
	
		}

		testCode = testCode + "\tvar " + axis + "Axis = new Plottable.Axis." 

		switch(axisType) {
		    case "Time":
		    	axisTypeString = "Time";
		        axisObj = new Plottable.Axis.Time(scale, orientation);
		        break;
		    case "Category":
		    	axisTypeString = "Category";		    
		        axisObj = new Plottable.Axis.Category(scale, orientation);
		        break;
		    case "Numeric(Linear)":
		    	axisTypeString = "Numeric";		    
		        axisObj = new Plottable.Axis.Numeric(scale, orientation);
		        break;  
			case "Numeric(Log)":
		    	axisTypeString = "Numeric";			
		        axisObj = new Plottable.Axis.Numeric(scale, orientation);
		        break;  	         	         
		    default:
		        return null;
		}	
		testCode = testCode + axisTypeString + params + "; \n";		
		return axisObj;
	}

	testCode_init = function(){
		testCode = "window.onload = function() {\n";
	}

	testCode_finish = function(){
		testCode = testCode + "\tplot.project('x', 'x', xScale).project('y', 'y', yScale);\n";
	    testCode = testCode + "\tvar table = new Plottable.Component.Table([[yAxis, plot],\n\t\t\t\t\t\t                                      [null, xAxis]])\n";
	    testCode = testCode + "\ttable.renderTo('#svg');\n}";
	    $("#code").val(testCode);

	}


	createTest = function() {
		testCode_init();
		$("#playground").empty();
	    var xScale = make_scale('x');
	    var yScale = make_scale('y');
	    var xAxis = make_axis('x', xScale, 'bottom');
	    var yAxis = make_axis('y', yScale, 'left');

	    var plot = choosePlot(xScale, yScale);
	    plot.addDataset(chooseData());
	    plot.project("x", "x", xScale).project("y", "y", yScale);

	    var table = new Plottable.Component.Table([[yAxis, plot],
	    											[null, xAxis]]);
	    table.renderTo("#playground");

	    testCode_finish()
	}

	//----------------------------------------------------------------------------------------------
	//---------------------------------visual-------------------------------------------------------
	svg_size = function(){
		var px_w = $("#svg_w").val();
		var px_h = $("#svg_h").val();
		$('#playground').attr("width", px_w);
		$('#playground').attr("height", px_h);
		createTest();
	}


});