function renderPlots(){
	var dropdown = $("#category")[0];
  var branch1 = $("#branch1")[0];
  var branch2 = $("#branch2")[0];
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
  console.log("quicktests retrieved are: " + quickTestNames); 

  debugger;
  var plottableBranches=[];
  var result;
  var branchName = branchName; //this needs to be retrieved from before

  if(order === "first"){
    var div = d3.select("#result1");
  }
  else {
    var div = d3.select("#result2");
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
    url = "https://rawgithub.com/palantir/plottable/" + branchName + "/plottable.js";
  } else {
    url = "/plottable.js"; //load local version
  }

  debugger;

  $.getScript(url, function(data, textStatus) { 

    if(textStatus === "success"){
      plottableBranches[branchName] = Plottable;
      runQuickTest(div, result, branchName, plottableBranches); //run the quicktest once the plottable object is retrieved
    }

  });
}//appendQuickTestBranch

//run a single quicktest
function runQuickTest(div, result, branch, plottableBranches){
  result.run(div, result.makeData(), plottableBranches[branch])
}

