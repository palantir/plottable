function renderPlots(){
	var dropdown = $("#category")[0];
  var branch1 = $("#branch1")[0].value;
  var branch2 = $("#branch2")[0].value;
	var category = dropdown.options[dropdown.selectedIndex].value;
  loadQuickTests(category, branch1, branch2);
}

function loadQuickTests(category, branch1, branch2){
  var first = "first";
  var second = "second";
  var qtestnames = []; //array of quicktest names
  //filter list of quicktests to list of quicktest names to pass to doSomething
  d3.json("list_of_quicktests.json", function (data){
    var quickTestNames = [];
    data.forEach(function(quicktestobj){
      var path = quicktestobj.path;

      if (-1 !== path.indexOf(category)){
        var name = path.replace(/.*\/|\.js/g, '');
        quickTestNames.push(name);
      }

    });
    loadQuickTestsInCategory(quickTestNames, category, branch1, first);
    loadQuickTestsInCategory(quickTestNames, category, branch2, second);
  });
}

function loadQuickTestsInCategory(quickTestNames, category, branchName, order){
  //x here is an array of test names

  var plottableBranches=[];
  var branchName = branchName; //this needs to be retrieved from before
  var div;

  if(order === "first"){
    div = d3.select("#result1");
  }
  else {
    div = d3.select("#result2");
  }

  quickTestNames.forEach(function(q) { //for each quicktest 
    var name = q;
    d3.text("/quicktests/new/list/" + category + "/" + name + ".js", function(error, text) {
      if (error !== null) {
        console.warn("Tried to load nonexistant quicktest " + name);
        return;
      }        
      text = "(function(){" + text +
          "\nreturn {makeData: makeData, run: run};" +
               "})();" +
          "\n////# sourceURL=" + name + ".js\n";

      result = eval(text);
      console.log(text)
      prepareQuickTest(div, result, branchName, plottableBranches);

    });
  });//forEach
    
} //loadQuickTestCategory

//METHODS

//retrieves the plottable object according to branch, then run
function prepareQuickTest(div, result, branchName, plottableBranches) {
  if (plottableBranches[branchName] != null) {
    return;
  }

  if (branchName !== "#local") {
    url = "https://rawgit.com/palantir/plottable/" + branchName + "/plottable.js";
  } else {
    url = "/plottable.js"; //load local version
  }

  $.getScript(url, function(data, textStatus) { 
    if(textStatus === "success"){
      console.log("success!")
      plottableBranches[branchName] = Plottable;
      runQuickTest(div, result, branchName, plottableBranches); //run the quicktest once the plottable object is retrieved
    }
    if(textStatus === "error"){
      console.log("errored!")
    }

  });
}//appendQuickTestBranch

//run a single quicktest
function runQuickTest(div, result, branch, plottableBranches){
  result.run(div, result.makeData(), plottableBranches[branch])
};


window.onkeyup = function(e){
  var key = e.keyCode ? e.keyCode : e.which;
  //if 1 is pressed
  if(key == 49){
    $("#result1 svg").css("display", "block");
    $("#result2 svg").css("display", "none");
  }
  //if 2 is pressed
  if(key == 50){
    $("#result1 svg").css("display", "none");
    $("#result2 svg").css("display", "block");
  }
  //if 3 is pressed
  if(key == 51){
    $("#result1 svg").css("display", "block");
    $("#result2 svg").css("display", "block");
  }
    //if 3 is pressed
  if(key == 52){
    $("#result1 svg").css("display", "none");
    $("#result2 svg").css("display", "none");
  }
}















