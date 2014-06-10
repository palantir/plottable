
var Plottables = {};

function loadScript(url) {
  return new Promise(function(resolve, reject) {
    var element = document.createElement("script");
    element.type = "text/javascript";
    element.src = url;
    element.onload = function() {console.log("loaded", url); resolve();};
    document.head.appendChild(element);
  });
}


function loadPlottable(branchName) {
  Plottables = Plottables || {};
  return new Promise(function (fulfill, reject) {
    if (Plottables[branchName] != null) {
      fulfill();
    }
    var url;
    if (branchName != null) {
      url = "https://rawgithub.com/palantir/plottable/" + branchName + "/plottable.js";
    } else {
      branchName = "#local";
      url = "../plottable.js"; //load local version
    }
    loadScript(url, branchName, inner).then(function() {
      Plottables[branchName] = Plottable;
      Plottable = null;
      fulfill();
    });
  });
}


var data1 = makeRandomData(50);
var data2 = makeRandomData(50);

function loadSingleQuicktest(container, quickTest, Plottable) {
  container.append("p").text(quickTest.quicktestName);
  var svg = container.append("svg").attr("height", 500);
  quickTest(svg, _.cloneDeep([data1, data2]), Plottable);
}

function runQuicktest(tableSelection, quickTest, Plottable1, Plottable2) {
  var tr = tableSelection.append("tr").classed("quicktest-row", true);
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

function initializeByLoadingAllQuicktests() {
  console.log("started from the bottom now we here")
  return new Promise(function(f, r) {
    console.log("function in promise is executing", window.list_of_quicktests);
    if (window.list_of_quicktests == null) {
      window.list_of_quicktests = [];
      console.log("loading quicktests");
      loadScript("quicktests/list_of_quicktests.js").then(f);
    } else {
      console.log("quicktests already loaded, resolving");
      f();
    }
  });
}

function reporter(n) {
  return function(x) {
    console.log(n, x);
    return x;
  }
}


function main() {
  console.log("calling main");
  var table = d3.select("table");
  table.selectAll(".quicktest-row").remove();
  var firstBranch = "master";
  var secondBranch = $('#featureBranch').val() || "#local";
  var quicktestCategory = $('#filterWord').val();
  initializeByLoadingAllQuicktests()
      .then(reporter("LOADED QUICKTESTS"))
      .then(loadPlottable(firstBranch))
      .then(reporter("LOADED PLOTTABLE1"))
      .then(loadPlottable(secondBranch))
      .then(reporter("LOADED PLOTTABLE2"))
      .then(function() {console.log(window.list_of_quicktests)})
      .then(function () {
        return window.list_of_quicktests.filter(function(q) {
          console.log(q.categories);
          if (quicktestCategory === "" || quicktestCategory === undefined) {
            return true;
          } else {
            return q.categories.indexOf(quicktestCategory) !== -1
          };
        });
      })
      .then(reporter("filtered quicktests"))
      .then(function(qts) {
        qts.forEach(function(q) {
          runQuicktest(table, q, Plottables[firstBranch], Plottables[secondBranch]);
        });
      });
}


var button = document.getElementById('button');
button.onclick = main;

window.onload = main;
