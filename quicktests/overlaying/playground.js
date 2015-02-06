
	var testCode;
	var rg;
	var group;
	var ord;

	var numXnumY = [{x: 2, y: 9}, {x: 3, y: 13.5}, {x: 4, y: 18}, {x: 5, y: 22.5}, {x: 6, y: 27} ];
	var catXnumY = [{x: 'A', y: 9}, {x: 'B', y: 5}, {x: 'C', y: 12}, {x: 'D', y: 2}];
	var timeXnumY = [{x: "5/2/2014", y: 9}, {x: "6/3/2014", y: 13}, {x: "8/3/2014", y: 1}];
	var numXcatY = [{x: 2, y: 'tiger'}, {x: 3, y: 'lion'}, {x: 4, y: 'tabby'}, {x: 5, y: 'housecat'}, {x: 6, y: 'leopard'} ];
	var catXcatY = [{x: 'A', y: 'Shire'}, {x: 'B', y: 'Gotham'}, {x: 'C', y: 'Grey Havens'}, {x: 'D', y: 'Gondor'}];
	var timeXcatY = [{x: "5/2/2014", y: 'ducks'}, {x: "6/3/2014", y: 'swans'}, {x: "8/3/2014", y: 'sparrows'}];

	chooseData = function(){
		"use strict";
		var xAxisType = $("#xAxisType option:selected").text();
		var yAxisType = $("#yAxisType option:selected").text();		
		var data;
		var pts;

		if(yAxisType === "Category" || xAxisType === "Category"){
			ord = true;
		}

		switch(xAxisType) {
		    case "Numeric(Linear)":
		    case "Numeric(Log)":
		    	if(yAxisType === "Category"){
					data = numXcatY.slice(0);
			        pts = "[{x: 2, y: 'tiger'}, {x: 3, y: 'lion'}, {x: 4, y: 'tabby'}, {x: 5, y: 'housecat'}, {x: 6, y: 'leopard'} ]";
		    	}
		    	else{
			    	data = numXnumY.slice(0);
			        pts = "[{x: 2, y: 9}, {x: 3, y: 13.5}, {x: 4, y: 18}, {x: 5, y: 22.5}, {x: 6, y: 27}]";
		    	}
		       break;
		    case "Category":
		    	if(yAxisType === "Category"){
					data = catXcatY.slice(0);
			        pts = "[{x: 'A', y: 'Shire'}, {x: 'B', y: 'Gotham'}, {x: 'C', y: 'Grey Havens'}, {x: 'D', y: 'Gondor'}]";
		    	}
		    	else{
			    	data = catXnumY.slice(0);
			        pts = "[{x: 'A', y: 9}, {x: 'B', y: 5}, {x: 'C', y: 12}, {x: 'D', y: 2}]";
		    	}
		        break;
		    case "Time":
		        if(yAxisType === "Category"){
					data = timeXcatY.slice(0);
			        pts = "[{x: '5/2/2014', y: 'ducks'}, {x: '6/3/2014', y: 'swans'}, {x: '8/3/2014', y: 'sparrows'}]";
		    	}
		    	else{
			    	data = timeXnumY.slice(0);
			        pts = "[{x: '5/2/2014', y: 9}, {x: '6/3/2014', y: 13}, {x: '8/3/2014', y: 1}]";
		    	}
		        break;
		    default:
		        return null;
		}	
		testCode = testCode + "\tvar data = " + pts + "; \n";
		testCode = testCode + "\tplot.addDataset(data);\n";
		return data;
	};

	choosePlot = function(xScale, yScale){
		"use strict";
		var plot_type = $("#plotType option:selected").text();
		testCode = testCode + "\tvar plot = new Plottable.Plot.";
		testCode = testCode + plot_type;
		testCode = testCode + "(xScale, yScale); \n";
		
		switch(plot_type) {
		    case "Scatter":
		        return new Plottable.Plot.Scatter(xScale, yScale);
		    case "Line":
		        return new Plottable.Plot.Line(xScale, yScale);
		    case "Area":
		        return new Plottable.Plot.Area(xScale, yScale);
		    case "Bar":
		        return new Plottable.Plot.Bar(xScale, yScale);
		    default:
		        return null;
		}	
	};

	make_scale = function(axis){
		"use strict";
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
		        scale = new Plottable.Scale.Ordinal();
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
	};


	make_axis = function(axis, scale, orientation){
		"use strict";
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

		testCode = testCode + "\tvar " + axis + "Axis = new Plottable.Axis.";

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
	};

	testCode_init = function(){
		"use strict";
		testCode = "window.onload = function() {\n";
	};

	testCode_finish = function(){
		"use strict";
	    testCode = testCode + "\tvar table = new Plottable.Component.Table([[yAxis, plot],\n\t\t\t\t\t\t                                      [null, xAxis]])\n";
	    testCode = testCode + "\ttable.renderTo('#svg');\n}";
	    $("#code").val(testCode);

	};

	testCode_red = function(){
		"use strict";
		testCode = testCode + "\tplot.attr('fill', function() { return '#ff6666'; })\n";
	};

	testCode_gridlines = function(){
		"use strict";
		testCode = testCode + "\tvar gridlines = new Plottable.Component.Gridlines(xScale, yScale);\n\tplot = new Plottable.Component.Group([plot, gridlines]);\n";
	};
	
	testCode_project = function(time){
		"use strict";
		if(time){
			testCode = testCode + "\tplot.project('x',  function (d) { return d3.time.format('%x').parse(d.x); }, xScale)\n\t\t.project('y', 'y', yScale);\n";
		}
		else{
			testCode = testCode + "\tplot.project('x', 'x', xScale).project('y', 'y', yScale);\n";
		}
	};

	createTest = function() {
		"use strict";
		testCode_init();
		$("#playground").empty();
		ord = false;
	    var xScale = make_scale('x');
	    var yScale = make_scale('y');
	    var xAxis = make_axis('x', xScale, 'bottom');
	    var yAxis = make_axis('y', yScale, 'left');

	    var plot = choosePlot(xScale, yScale);
	    plot.addDataset(chooseData());
	    if($("#xAxisType option:selected").text() === 'Time'){
	    	plot.project('x',  function (d) { return d3.time.format("%x").parse(d.x); }, xScale)
	    		.project('y', 'y', yScale);	
	    	testCode_project(true);	
	    }
	    else{
	    	plot.project("x", "x", xScale).project("y", "y", yScale);
	    	testCode_project(false);	    	
	    }

	    if($('#red').is(':checked')){
	    	plot.attr("fill", function() { return "#ff6666"; });
	    	plot.attr("stroke", function() { return "#ff6666"; });
	    	testCode_red();
	    }
	    if($('#gridlines').is(':checked')){
	    	if (ord === true){
	    		alert("Gridlines are not yet supported on Ordinal Scales");

	    	}
	    	var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
	    	plot = new Plottable.Component.Group([plot, gridlines]);
	    	testCode_gridlines();
	    }

	    var table = new Plottable.Component.Table([[yAxis, plot],
	    											[null, xAxis]]);
	    table.renderTo("#playground");

	    testCode_finish();
	};

	//----------------------------------------------------------------------------------------------
	//---------------------------------visual-------------------------------------------------------
	svg_size = function(){
		"use strict";
		var px_w = $("#svg_w").val();
		var px_h = $("#svg_h").val();
		$('#playground').attr("width", px_w);
		$('#playground').attr("height", px_h);
		createTest();
	};

$(document).ready(function(){
	"use strict";
	createTest();

});