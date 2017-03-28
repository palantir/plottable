
function toggleSidebar(){

  "use strict";

  var content = $(".content");
  var sidebar = $(".sidebar");
  var controls = $(".controls");
  var sizeControls = $(".size-controls");
  var windowHeight = window.innerHeight - 50;

  sidebar.css("height", windowHeight);

  if(sidebar.position().left !== 0){
    sidebar.css("visibility", "visible");
    sidebar.animate({
      left: "0%"
    });
    content.animate({
      left: "20%"
    });
    controls.animate({
      width: "80%"
    });
    sizeControls.animate({
      width: "80%"
    });
  }
  else{
    sidebar.animate({
      left: "-20%"
    });
    content.animate({
      left: "0"
    }, function(){
      sidebar.css("visibility", "hidden");
    });
    controls.animate({
      width: "100%"
    });
    sizeControls.animate({
      width: "100%"
    });
  }
}

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

var plottableUrls = [];
var firstBranch;
var secondBranch;
var targetWidth;
var targetHeight;

//METHODS

function togglePlotDisplay(className, checkboxState){
  var classSelector = "." + className;
  var displayStatus = checkboxState ? "inline-block" : "none";
  $(classSelector).css("display", displayStatus);
}

function setCategoryCheckbox(category, populating){
  var categoryListItem = $("#" + category);
  var categoryQuicktestList = categoryListItem.children().filter("li").toArray();
  var categoryChecked = populating ? true : categoryListItem.children()[0].checked;
  categoryQuicktestList.forEach(function(listItem){
    listItem.children[0].checked = categoryChecked;
    var qtName = listItem.textContent.replace(" ", "");
    togglePlotDisplay(qtName, categoryChecked);
  });
  categoryListItem.children()[0].checked = categoryChecked;
}

function setupCheckboxBinding(){
  //sidebar checkbox check handler
  $( "li input[type=checkbox]" ).on( "click", function(){
    var plotName = this.parentNode.textContent;
    var nextState = $(this)[0].checked;
    plotName = plotName.replace(" ", "");
    togglePlotDisplay(plotName, nextState);
  });

  $( "ol .category-checkbox" ).on( "click", function(){
    setCategoryCheckbox(this.parentNode.id, false);
  });
}

function populateTotalSidebarList(paths){
  //IF CATEGORY IS ALL ******
  var testsPaths = paths.map(function(path) {return path.replace(/.*tests\/|\.js/g, ""); });

  //ex. animations/animate_area
  var hash = {};
  testsPaths.forEach(function(test){
    var slashPos = test.indexOf("/");
    var categoryString = test.substr(0, slashPos);
    var quicktestString = test.substr(slashPos + 1, test.length - 1);
    var quicktestArray = [quicktestString];
    if (!hash[categoryString]){
      hash[categoryString] = quicktestArray;
    }
    else{
      hash[categoryString].push(quicktestString);
    }
  });
  // hash = hash of quicktest categories and quicktests

  var allQuickTests = d3.entries(hash);

  allQuickTests.forEach(function(object){
    var categoryName = object.key;
    var startOlString = "<ol class=\"sidebar-quicktest-category\" id=" + categoryName + "> <input class=\"category-checkbox\" type=\"checkbox\">";
    var endOlString = "</ol>";
    var categoryStringHTML = startOlString + categoryName + endOlString;
      $(".sidebar").append(categoryStringHTML);

    object.value.forEach(function(quicktest){
      var singleQuicktestName = quicktest;
      var startLiString = "<li class=\"sidebar-quicktest\"> <input class=\"quicktest-checkbox\" type=\"checkbox\">";
      var endLiString = "</li>";
      var quicktestStringHTML = startLiString + singleQuicktestName + endLiString;
      $("#" + categoryName).append(quicktestStringHTML);
    });
  });

  setupCheckboxBinding();
  $(":checkbox").attr("checked", true);
}

function populateSidebarList(paths, testsInCategory, category){

  var allQuickTests = d3.entries(testsInCategory);
  var categoryName = category;
  var startOlString = "<ol class=\"sidebar-quicktest-category\" id=" + categoryName + "> <input class=\"category-checkbox\" type=\"checkbox\">";
  var endOlString = "</ol>";

  var categoryStringHTML = startOlString + categoryName + endOlString;
    $(".sidebar").append(categoryStringHTML);

    allQuickTests.forEach(function(quicktest){
      var singleQuicktestName = quicktest.value;
      var startLiString = "<li class=\"sidebar-quicktest\"> <input class=\"quicktest-checkbox\" type=\"checkbox\">";
      var endLiString = "</li>";
      var quicktestStringHTML = startLiString + singleQuicktestName + endLiString;
      $("#" + categoryName).append(quicktestStringHTML);
    });
  $(":checkbox").attr("checked", false);
  setupCheckboxBinding();
  setCategoryCheckbox(category, true);
}

//initializing methods
function setupBindings(){

  // show/hide according to hotkey events
  window.onkeyup = function(e){
    var key = e.keyCode || e.which;
    var inputActive = $("#branch1, #branch2, #width, #height").is(":focus");
    if(inputActive){return; }

    var visibleQuickTests = $(".quicktest").filter(":visible").toArray();
    processKeyEvent(key, visibleQuickTests);
  };

  $("#help").hover(function(){
    $("#test-category-descriptions").fadeIn("fast");
  }, function() {
      // Hover out code
      $("#test-category-descriptions").css("display", "none");
  }).mousemove(function() {
      var windowWidth = window.innerWidth;
      var helpY = $("#help").position().top;
      $("#test-category-descriptions").css({ top: helpY + 28, left: windowWidth - 360 });
  });

}//setupBindings

function setTestBoxDimensions(){
  //quicktest class is the black border container div for all divs
  $(".quicktest").css("width", targetWidth + 20); //20 needed to make up for taken up space for quicktest label
  $(".quicktest").css("height", targetHeight + 20);
}

//run a single quicktest
function runQuickTest(result, target, data, branch){
  try {
    result.run(target, data, plottableUrls[branch]);
    setTestBoxDimensions();
  } catch (err) {
    setTimeout(function() {throw err; }, 0);
  }
}

function loadAllQuickTests(quicktestsPaths, firstQTBranch, secondQTBranch){
  quicktestsPaths.forEach(function(path) { //for each quicktest
    var name = path.replace(/\w*\/|\.js/g, "");
    var relativePath = path.replace(/^quicktests\/overlaying\//, "");
    d3.text(relativePath, function(error, text) {
      evalAndRunTest(name, error, text, firstQTBranch, secondQTBranch);
    });
  });
}
//load each quicktest locally, eval it, then run quicktest
function loadQuickTestsInCategory(quickTestNames, category, firstQTBranch, secondQTBranch){
  quickTestNames.forEach(function(q) { //for each quicktest
    var name = q;
    d3.text("/quicktests/overlaying/tests/" + category + "/" + name + ".js", function(error, text) {
      evalAndRunTest(name, error, text, firstQTBranch, secondQTBranch);
    });
  });
}

function evalAndRunTest(name, error, text, firstQTBranch, secondQTBranch) {
  if (error !== null) {
    throw new Error("Tried to load nonexistant quicktest.");
  }
  text = "(function(){" + text +
    "\nreturn {makeData: makeData, run: run};" +
    "})();" +
    "\n////# sourceURL=" + name + ".js\n";
  var result = eval(text);
  var className = "quicktest " + name;
  var div = d3.select("#results").append("div").attr("class", className);
  div.insert("label").text(name);
  var firstTarget = div.append("div").attr("class", "first").append("div").styles({"width": targetWidth + "px", "height": targetHeight + "px"});
  var secondTarget = div.append("div").attr("class", "second").append("div").styles({"width": targetWidth + "px", "height": targetHeight + "px"});
  var data = result.makeData();

  runQuickTest(result, firstTarget, data, firstQTBranch);
  runQuickTest(result, secondTarget, data, secondQTBranch);
}

//filter all quicktests by category from list_of_quicktests.json & also load sidebar
function filterQuickTests(category, urlList){
  //filter list of quicktests to list of quicktest names to pass to doSomething
  d3.json("list_of_quicktests.json", function (data){
    var paths = data.map(function(quickTestObj) {return quickTestObj.path; });
    if (category !== "all"){
      var pathsInCategory = paths.filter(function(path) {return path.indexOf("tests/" + category) !== -1; });
      var testsInCategory = pathsInCategory.map(function(path) {return path.replace(/.*\/|\.js/g, ""); });
      loadQuickTestsInCategory(testsInCategory, category, urlList[0], urlList[1]);
      populateSidebarList(paths, testsInCategory, category);
    }
    else{
      loadAllQuickTests(paths, urlList[0], urlList[1]);
      populateTotalSidebarList(paths);
    }
  });
}

//retrieve different plottable objects then push to array
function loadPlottableBranches(category, urlList){
  var url1 = urlList[0];
  var url2 = urlList[1];

  if (plottableUrls[url1] != null  && plottableUrls[url2] != null ) {
    return;
  }

  $.getScript(url1, function(data, textStatus) {
    if(textStatus === "success") {
      plottableUrls[url1] = $.extend(true, {}, Plottable);
      Plottable = null;

      $.getScript(url2).then(
        function() { //load second
          plottableUrls[url2] = $.extend(true, {}, Plottable);
          Plottable = null;
          filterQuickTests(category, urlList);
        },
        function(request, errName, error) {
          throw error;
        }
      );
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
  plottableUrls = [];
  resetDisplayProperties();
  d3.selectAll(".quicktest, .sidebar-quicktest-category ").remove();
}

function initialize(){
  var branches = [];
  var dropdown = $("#category")[0];
  var category = dropdown.options[dropdown.selectedIndex].value;

  firstBranch = $("#branch1").val();
  secondBranch = $("#branch2").val();
  targetWidth = Number($("#width").val());
  targetHeight = Number($("#height").val());

  setTestBoxDimensions(targetWidth, targetHeight);

  branches.push(firstBranch, secondBranch);
  clearTests();

  loadPlottableBranches(category, branches);
}

function processKeyEvent(key, visibleQuickTests){
  var onePressed = (key === 49 || key === 97); //regular & numpad keys
  var twoPressed = (key === 50 || key === 98);
  var threePressed = (key === 51 || key === 99);

  if(onePressed || twoPressed || threePressed) {
    var firstBranchDisplay = onePressed || threePressed ? "block" : "none";
    var secondBranchDisplay = twoPressed || threePressed ? "block" : "none";
    var branchClassBehind = onePressed ? ".second" : ".first";
    var branchClassFront = onePressed ? ".first" : ".second";
    var firstBranchInputColor = onePressed || threePressed ? "mediumaquamarine" : "white";
    var secondBranchInputColor = twoPressed || threePressed ? "mediumaquamarine" : "white";

    visibleQuickTests.forEach(function(quicktest){
      $(".first", quicktest).css("display", firstBranchDisplay);
      $(".second", quicktest).css("display", secondBranchDisplay);
      $(branchClassBehind, quicktest).before($(branchClassFront, quicktest));
    });

    $("#branch1").css("background-color", firstBranchInputColor);
    $("#branch2").css("background-color", secondBranchInputColor);
  }

  return;
}

setupBindings();

var button = document.getElementById("render");
button.onclick = initialize;

})();
