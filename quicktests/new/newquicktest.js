var plottableBranches=[];
var qtestnames = [];
var firstBranch;
var secondBranch;
var first = true; //boolean to set order

function renderPlots(){
  var dropdown = $("#category")[0];
  firstBranch = $("#branch1")[0].value;
  secondBranch = $("#branch2")[0].value;
  var category = dropdown.options[dropdown.selectedIndex].value;
  var branches = [];
  branches.push(firstBranch, secondBranch);
  clearTests();

  pushBranchToArray(category, branches);
}

function loadQuickTests(category, branchList){
  //filter list of quicktests to list of quicktest names to pass to doSomething
  d3.json("list_of_quicktests.json", function (data){
    data.forEach(function(quicktestobj){
      var path = quicktestobj.path;

      if (-1 !== path.indexOf("list/" + category)){
        var name = path.replace(/.*\/|\.js/g, '');
        //quickTestNames.push(name);
        qtestnames.push(name)
      }

    });
    loadQuickTestsInCategory(qtestnames, category, branchList[0], branchList[1]);
  });
}

function loadQuickTestsInCategory(quickTestNames, category, firstBranch, secondBranch){
  //x here is an array of test names

  var div = d3.select("#results");

  // if(order){
  //   //div = $("#result1");
  //   div = d3.select("#result1");
  // }
  // else {
  //   //div = $("#result2");
  //   div = d3.select("#result2");
  // }

  // make all divs here

  //CHECK IF CLASS QUICKTEST QUICKTESTNAME EXISTS. if doesnt, then create, then append. if there is, then just append.
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
      var className = "quicktest " + name;
      //div.append("<div class='" + name + "'> </div>"); //create specific div for a specific quicktest
      var div = d3.select("#results").append("div").attr("class", className);
      var firstdiv = div.append("div").attr("class", "first");
      var seconddiv = div.append("div").attr("class", "second");
      var data = result.makeData();
      runQuickTest(firstdiv, data, firstBranch ); //just runQuickTest twice here with same result
      runQuickTest(seconddiv, data, secondBranch); //just runQuickTest twice here with same result

    });
  });//forEach
    
} //loadQuickTestCategory

//METHODS

function pushBranchToArray(category, branchList){
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

  })

  $.getScript(listOfUrl[0], function(data, textStatus) { 
    if(textStatus === "success"){
      console.log("success!");
      plottableBranches[branchName1] = Plottable;
      $.getScript(listOfUrl[1], function(data, testStatus){ //load second 
        if(textStatus === "success"){
          plottableBranches[branchName2] = Plottable;
          loadQuickTests(category, branchList);
        }
      });
      console.log("success!")
    }
    if(textStatus === "error"){
      console.log("errored!")
    }

  });
}


//run a single quicktest
function runQuickTest(div, data, branch){
  result.run(div, data, plottableBranches[branch])
};


function clearTests(){
  plottableBranches = [];
  qtestnames= [];
  resetDisplayProperties();
  d3.selectAll(".quicktest").remove();
}

function resetDisplayProperties(){
  $("#result1, #result1 svg").css("display", "block");
  $("#result2, #result2 svg").css("display", "block");
  $("#branch1").css("background-color", "white");
  $("#branch2").css("background-color", "white");
}

window.onkeyup = function(e){
  var key = e.keyCode ? e.keyCode : e.which;
  //if 1 is pressed
  if(key == 49){
    $(".first svg").css("display", "block");
    $(".second svg").css("display", "none");
    $("#branch1").css("background-color", "mediumaquamarine");
    $("#branch2").css("background-color", "white");
  }
  //if 2 is pressed
  if(key == 50){
    $(".first svg").css("display", "none");
    $(".second svg").css("display", "block");
    $("#branch1").css("background-color", "white");
    $("#branch2").css("background-color", "mediumaquamarine");

  }
  //if 3 is pressed
  if(key == 51){
    $(".first svg").css("display", "block");
    $(".second svg").css("display", "block");
    $("#branch1").css("background-color", "mediumaquamarine");
    $("#branch2").css("background-color", "mediumaquamarine");

  }
  //if 4 is pressed
  if(key == 52){
    $(".first svg").css("display", "none");
    $(".second svg").css("display", "none");
    $("#branch1").css("background-color", "white");
    $("#branch2").css("background-color", "white");

  }
}















