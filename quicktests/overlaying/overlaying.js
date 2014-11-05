//show svg width & height setting
function showSizeControls(){

  "use strict";

  var buttonstatus = $("#expand").val();
  if (buttonstatus === "+"){
    $( ".size-controls" ).slideDown( 300, function() {
      $(this).focus();
      $("#expand").val("-");
    }); 
  }
  else{
    $( ".size-controls" ).slideUp( 300, function() {
      $("#expand").val("+");
    });
  }
}

(function iife(){

"use strict";

var plottableBranches=[];
var qtestnames = [];
var firstBranch;
var secondBranch;
var svgWidth;
var svgHeight;

//METHODS

function setTestBoxDimensions(){
  //quicktest class is the black border container div for all svgs
  $(".quicktest").css("width", svgWidth + 20); //20 needed to make up for taken up space for quicktest label
  $(".quicktest").css("height", svgHeight + 20);
}

//run a single quicktest
function runQuickTest(result, svg, data, branch){
  try {
    result.run(svg, data, plottableBranches[branch]);
    setTestBoxDimensions();
  } catch (err) {
    setTimeout(function() {throw err;}, 0);
  }
}

//load each quicktest locally, eval it, then run quicktest
function loadQuickTestsInCategory(quickTestNames, category, firstBranch, secondBranch){

  var div = d3.select("#results");
  quickTestNames.forEach(function(q) { //for each quicktest 
    var name = q;
    d3.text("/quicktests/overlaying/tests/" + category + "/" + name + ".js", function(error, text) {
      if (error !== null) {
        console.warn("Tried to load nonexistant quicktest " + name);
        return;
      }
      var x = new Function(text);
      text = "(function(){" + text +
          "\nreturn {makeData: makeData, run: run};" +
               "})();" +
          "\n////# sourceURL=" + name + ".js\n";
      var result = eval(text);
      var className = "quicktest " + name;

      var div = d3.select("#results").append("div").attr("class", className);
      div.insert("label").text(name);
      var firstsvg = div.append("div").attr("class", "first").append("svg").attr("width", svgWidth).attr("height", svgHeight);
      var secondsvg = div.append("div").attr("class", "second").append("svg").attr("width", svgWidth).attr("height", svgHeight);
      var data = result.makeData();

      runQuickTest(result, firstsvg, data, firstBranch);
      runQuickTest(result, secondsvg, data, secondBranch);
    });
  });//forEach
    
} //loadQuickTestCategory

//filter all quicktests by category from list_of_quicktests.json
function filterQuickTests(category, branchList){
  //filter list of quicktests to list of quicktest names to pass to doSomething
  d3.json("list_of_quicktests.json", function (data){
    data.forEach(function(quicktestobj){
      var path = quicktestobj.path;

      if (-1 !== path.indexOf("tests/" + category)){
        var name = path.replace(/.*\/|\.js/g, '');
        qtestnames.push(name);
      }

    });
    loadQuickTestsInCategory(qtestnames, category, branchList[0], branchList[1]);
  });
}

//retrieve different plottable objects then push to array
function loadPlottableBranches(category, branchList){
  var listOfUrl = [];
  var branchName1 = branchList[0];
  var branchName2 = branchList[1];

  if (plottableBranches[branchName1] != null  && plottableBranches[branchName2] != null ) {
    return;
  }

  branchList.forEach(function(branch){
    if (branch !== "#local") {
      listOfUrl.push("https://rawgit.com/palantir/plottable/" + branch + "/plottable.js");
    } else {
      listOfUrl.push("/plottable.js"); //load local version
    }

  });

  $.getScript(listOfUrl[0], function(data, textStatus) { 
    if(textStatus === "success"){
      plottableBranches[branchName1] =  $.extend(true, {}, Plottable);
      Plottable = null;

      $.getScript(listOfUrl[1], function(data, testStatus){ //load second 
        if(textStatus === "success"){
          plottableBranches[branchName2] = $.extend(true, {}, Plottable);
          Plottable = null;
          filterQuickTests(category, branchList);
        }
      });
    }
    if(textStatus === "error"){
      console.log("errored!");
    }

  });
}

function resetDisplayProperties(){
  $(".first").css("display", "block");
  $(".second").css("display", "block");
  $("#branch1").css("background-color", "white");
  $("#branch2").css("background-color", "white");
}

function clearTests(){
  plottableBranches = [];
  qtestnames= [];
  resetDisplayProperties();
  d3.selectAll(".quicktest").remove();
}

function initialize(){
  var branches = [];
  var dropdown = $("#category")[0];
  var category = dropdown.options[dropdown.selectedIndex].value;

  firstBranch = $("#branch1").val();
  secondBranch = $("#branch2").val();
  svgWidth = Number($("#width").val());
  svgHeight = Number($("#height").val());

  setTestBoxDimensions(svgWidth, svgHeight);

  branches.push(firstBranch, secondBranch);
  clearTests();

  loadPlottableBranches(category, branches);
}

function hotKeyHandler(visibleQuickTests, cssConfig){
  for(var i = 0; i < visibleQuickTests.length; i++){
    var quicktest = visibleQuickTests[i];
    $(".first", quicktest).css("display", cssConfig.firstBranchDisplay);
    $(".second", quicktest).css("display", cssConfig.secondBranchDisplay);
    $(cssConfig.branchClassBehind, quicktest).before($(cssConfig.branchClassFront, quicktest));
  }
    $(".quicktest").css("display", cssConfig.quicktestDisplay);
    $("#branch1").css("background-color", cssConfig.firstBranchInputColor);
    $("#branch2").css("background-color", cssConfig.secondBranchInputColor);
}

// show/hide according to hotkey events
window.onkeyup = function(e){
  var key = e.keyCode ? e.keyCode : e.which;

  var inputActive = $("#branch1, #branch2, #width, #height").is(':focus');
  if(inputActive){return;}

  var visibleQuickTests = $(".quicktest").toArray();
  var onePressed = (key === 49 || key === 97); //regular & numpad keys
  var twoPressed = (key === 50 || key === 98);
  var threePressed = (key === 51 || key === 99);
  var fourPressed = (key === 52 || key === 100);
  var cssConfig = {};
  //if 1 is pressed
  if (onePressed) {
    cssConfig = { firstBranchDisplay: "block",
                  secondBranchDisplay: "none",
                  branchClassBehind: ".second",
                  branchClassFront: ".first",
                  quicktestDisplay: "inline-block",
                  firstBranchInputColor: "mediumaquamarine",
                  secondBranchInputColor: "white" };
    hotKeyHandler(visibleQuickTests, cssConfig);
    return;
  }
  //if 2 is pressed
  if (twoPressed) {
    cssConfig = { firstBranchDisplay: "none",
                  secondBranchDisplay: "block",
                  branchClassBehind: ".first",
                  branchClassFront: ".second",
                  quicktestDisplay: "inline-block",
                  firstBranchInputColor: "white",
                  secondBranchInputColor: "mediumaquamarine" };
    hotKeyHandler(visibleQuickTests, cssConfig);
    return;
  }
  //if 3 is pressed
  if (threePressed) {
    cssConfig = { firstBranchDisplay: "block",
                  secondBranchDisplay: "block",
                  branchClassBehind: ".first",
                  branchClassFront: ".second",
                  quicktestDisplay: "inline-block",
                  firstBranchInputColor: "mediumaquamarine",
                  secondBranchInputColor: "mediumaquamarine" };
    hotKeyHandler(visibleQuickTests, cssConfig);
    return;
  }
  //if 4 is pressed
  if (fourPressed) {
    cssConfig = { firstBranchDisplay: "none",
                  secondBranchDisplay: "none",
                  branchClassBehind: ".second",
                  branchClassFront: ".first",
                  quicktestDisplay: "none",
                  firstBranchInputColor: "white",
                  secondBranchInputColor: "white" };
    hotKeyHandler(visibleQuickTests, cssConfig);
    return;
  }

};

$("#help").hover(function(){
  $("#instructions").fadeIn('fast');
}, function() {
    // Hover out code
    $("#instructions").css("display", "none");
}).mousemove(function(e) {
    var mousex = e.pageX; //Get X coordinates
    var mousey = e.pageY; //Get Y coordinates
    $("#instructions").css({ top: mousey + 20, left: mousex - 330 });
});

var button = document.getElementById("render");
button.onclick = initialize;

})();


