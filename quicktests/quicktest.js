
var Plottables = {};

function loadScript(url, callback) {
  var element = document.createElement("script");
  element.type = "text/javascript";
  element.src = url;
  element.onload = callback;
  document.head.appendChild(element);
}

function loadPlottable(branchName, callback) {
  var url;
  if (branchName != null) {
    url = "https://rawgithub.com/palantir/plottable/" + branchName + "/plottable.js";
  } else {
    branchName = "#local";
    url = "../plottable.js"; //load local version
  }
  var inner = function() {
    console.log("loaded Plottable:" + branchName);
    Plottables[branchName] = Plottable;
    Plottable = null;
    callback();
  }
  loadScript(url, inner);
}


var quicktests = []
function loadQuicktests(qts, callback) {
  var nLoaded = 0;

  var inner = function() {
    if (++nLoaded === qts.length) callback();
  }
  
  var filterword = $('#filterWord').val();
  if(filterword === undefined || filterword ===""){
    qts.forEach(function(q) {
      loadScript("quicktests/" + q.name + ".js", inner);
    });
  }
  else{
    console.log(filterword);
    qts.forEach(function(q) {
      if ( q.categories.indexOf( filterword ) > -1 ){ 
        loadScript("quicktests/" + q.name + ".js", inner); 
        console.log("loaded" + q.name);
      }
    });    
  }
}

function loadAllQuicktests(callback) {
  loadScript("quicktests/list_of_quicktests.js", function() {
    console.log("about to load quicktests", callback);
    loadQuicktests(list_of_quicktests, callback);
  });
}

function loadQuickTestsAndPlottables(otherBranch, callback) {
  var loaded = 0;
  var inner = function() {
    if (++loaded === 3) callback();
  }

  loadPlottable("master", inner);
  loadPlottable(otherBranch, inner);
  console.log("about to load all quicktests", inner);
  loadAllQuicktests(inner);
}

var data1 = makeRandomData(50);
var data2 = makeRandomData(50);

function loadSingleQuicktest(container, quickTest, Plottable) {
  container.append("p").text(quickTest.quicktestName);
  var svg = container.append("svg").attr("height", 500);
  quickTest(svg, _.cloneDeep([data1, data2]), Plottable);
}

function runQuicktest(tableSelection, quickTest, Plottable1, Plottable2) {
  var tr = tableSelection.append("tr");
  loadSingleQuicktest(tr.append("td"), quickTest, Plottable1);
  tr.append("td");
  loadSingleQuicktest(tr.append("td"), quickTest, Plottable2);
}

function makeMainFunctionForGivenBranch(branch) {
  return function () {
    var table = d3.select("table");
    quicktests.forEach(function(q) {
      runQuicktest(table, q, Plottables["master"], Plottables[branch]);
    });
  }
}


var button = document.getElementById('button');
button.onclick = function () {
  var fb = $('#featureBranch').val();
  loadQuickTestsAndPlottables(fb, makeMainFunctionForGivenBranch(fb));
};
