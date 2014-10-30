var plottableBranches=[];
var qtestnames = [];
var firstBranch;
var secondBranch;
var first = true; //boolean to set order
var svgWidth;
var svgHeight;

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

function filterQuickTests(category, branchList){
  //filter list of quicktests to list of quicktest names to pass to doSomething
  d3.json("list_of_quicktests.json", function (data){
    data.forEach(function(quicktestobj){
      var path = quicktestobj.path;

      if (-1 !== path.indexOf("list/" + category)){
        var name = path.replace(/.*\/|\.js/g, '');
        qtestnames.push(name);
      }

    });
    loadQuickTestsInCategory(qtestnames, category, branchList[0], branchList[1]);
  });
}

function loadQuickTestsInCategory(quickTestNames, category, firstBranch, secondBranch){

  var div = d3.select("#results");
  quickTestNames.forEach(function(q) { //for each quicktest 
    var name = q;
    d3.text("/quicktests/new/list/" + category + "/" + name + ".js", function(error, text) {
      if (error !== null) {
        console.warn("Tried to load nonexistant quicktest " + name);
        return;
      }
      var x = new Function(text);
      text = "(function(){" + text +
          "\nreturn {makeData: makeData, run: run};" +
               "})();" +
          "\n////# sourceURL=" + name + ".js\n";
      result = eval(text);
      var className = "quicktest " + name;

      var div = d3.select("#results").append("div").attr("class", className);
      div.insert("label").text(name);
      var firstsvg = div.append("div").attr("class", "first").append("svg").attr("width", svgWidth).attr("height", svgHeight);
      var secondsvg = div.append("div").attr("class", "second").append("svg").attr("width", svgWidth).attr("height", svgHeight);
      var data = result.makeData();

      runQuickTest(firstsvg, data, firstBranch);
      runQuickTest(secondsvg, data, secondBranch);
    });
  });//forEach
    
} //loadQuickTestCategory

//METHODS

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
      console.log("errored!")
    }

  });
}

//run a single quicktest
function runQuickTest(svg, data, branch){
  try {
    result.run(svg, data, plottableBranches[branch]);
    setTestBoxDimensions();

  } catch (err) {
    setTimeout(function() {throw err;}, 0);
  }
};

function clearTests(){
  plottableBranches = [];
  qtestnames= [];
  resetDisplayProperties();
  d3.selectAll(".quicktest").remove();
}

function resetDisplayProperties(){
  $(".first, .first svg").css("display", "block");
  $(".second, .second svg").css("display", "block");
  $("#branch1").css("background-color", "white");
  $("#branch2").css("background-color", "white");
}

window.onkeyup = function(e){
  var key = e.keyCode ? e.keyCode : e.which;

  var inputActive = $("#branch1, #branch2, #width, #height").is(':focus');

  if(inputActive){return;}

  var visibleQuickTests = $(".quicktest").toArray();

  if (key === 49) {
    visibleQuickTests.forEach(function(quicktest){
      $(".first", quicktest).css("display", "block");
      $(".second", quicktest).css("display", "none");
      $(".second", quicktest).before($(".first", quicktest));
    });
    $(".quicktest").css("display", "inline-block");
    $("#branch1").css("background-color", "mediumaquamarine");
    $("#branch2").css("background-color", "white");
    
    return;
  }
  //if 2 is pressed
  if (key === 50) {
    visibleQuickTests.forEach(function(quicktest){
      $(".first", quicktest).css("display", "none");
      $(".second", quicktest).css("display", "block");
      $(".first", quicktest).before($(".second", quicktest));
    });
    $(".quicktest").css("display", "inline-block");
    $("#branch1").css("background-color", "white");
    $("#branch2").css("background-color", "mediumaquamarine");
    return;
  }
  //if 3 is pressed
  if (key === 51) {
    visibleQuickTests.forEach(function(quicktest){
      $(".first", quicktest).css("display", "block");
      $(".second", quicktest).css("display", "block");
      $(".first", quicktest).before($(".second", quicktest));
    });
    $(".quicktest").css("display", "inline-block");
    $("#branch1").css("background-color", "mediumaquamarine");
    $("#branch2").css("background-color", "mediumaquamarine");
    return;
  }
  //if 4 is pressed
  if (key === 52) {
    visibleQuickTests.forEach(function(quicktest){
      $(".first", quicktest).css("display", "none");
      $(".second", quicktest).css("display", "none");
      $(".first", quicktest).before($(".second", quicktest));
    });
    $(".quicktest").css("display", "none");
    $("#branch1").css("background-color", "white");
    $("#branch2").css("background-color", "white");
    return;
  }
}

//show svg width & height setting
function showSizeControls(){
  var buttonstatus = $("#expand").val()
  if (buttonstatus == "+"){
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


function setTestBoxDimensions(){
  $(".quicktest").css("width", svgWidth + 20); //20 needed to make up for taken up space for quicktest label
  $(".quicktest").css("height", svgHeight + 20);
}
