

function loadScript(url) {
  console.log("loadScript called with url", url);
  return new Promise(function(resolve, reject) {
    var element = document.createElement("script");
    element.type = "text/javascript";
    element.src = url;
    element.onload = function() {console.log("loaded", url); resolve();};
    document.head.appendChild(element);
  });
}


var Plottables = {};
function loadPlottable(branchName) {
  return new Promise(function (fulfill, reject) {
    if (Plottables[branchName] != null) {
      fulfill();
    }
    var url;
    if (branchName !== "#local") {
      url = "https://rawgithub.com/palantir/plottable/" + branchName + "/plottable.js";
    } else {
      url = "/plottable.js"; //load local version
    }
    loadScript(url).then(function() {
      Plottables[branchName] = Plottable;
      Plottable = null;
      fulfill();
    });
  });
}


var data1 = makeRandomData(50);
var data2 = makeRandomData(50);

function runSingleQuicktest(container, quickTest, data, Plottable) {
  console.log("running single quicktest");
  container.append("p").text(quickTest.name);
  var div = container.append("div");
  quickTest.run(div, data, Plottable);
  console.log("--finished single quicktest");
}

function runQuicktest(tableSelection, quickTest, Plottable1, Plottable2) {
  var tr = tableSelection.append("tr").classed("quicktest-row", true);
  var data = quickTest.makeData();
  runSingleQuicktest(tr.append("td"), quickTest, data, Plottable1);
  tr.append("td");
  runSingleQuicktest(tr.append("td"), quickTest, data, Plottable2);
}

function initializeByLoadingAllQuicktests() {
  return new Promise(function(f, r) {
    if (window.list_of_quicktests == null) {
      loadListOfQuicktests()
        .then(reporter("JSON->LOAD"))
        .then(loadTheQuicktests)
        .then(reporter("load->fulfill"))
        .then(f)
    } else {
      f();
    }
  });
}

function loadListOfQuicktests() {
  return new Promise(function (f, r) {
    d3.json("/quicktests/list_of_quicktests.json", function (error, json) {
      if (json !== undefined) {
        f(json)
      } else {
        console.log("got an error loading quicktests json", error);
        r(error);
      }
    });
  });
}

function loadTheQuicktests(quicktestsJSONArray) {
  window.quicktests = [];
  var numToLoad = quicktestsJSONArray.length;
  var numLoaded = 0;
  return new Promise(function (f, r) {
    quicktestsJSONArray.forEach(function(q) {
      var name = q.name;
      d3.text("/quicktests/quicktests/" + name + ".js", function(error, text) {
        text += ";return {makeData: makeData, run: run};";
        obj = new Function(text)();
        q.makeData = obj.makeData;
        q.run = obj.run;
        window.quicktests.push(q);
        if (++numLoaded === numToLoad) f();
      });
    });
  });

}

function reporter(n, v) {
  return function(x) {
    console.log(n, x, v);
    return x;
  }
}


function main() {
  var table = d3.select("table");
  table.selectAll(".quicktest-row").remove();
  var firstBranch = "master";
  var secondBranch = $('#featureBranch').val();
  if (secondBranch === "") {secondBranch = "#local"};
  var quicktestCategory = $('#filterWord').val();
  initializeByLoadingAllQuicktests()
      .then(reporter("LOAD -> PLOTTABLE1"), Plottables)
      .then(loadPlottable(firstBranch))
      .then(reporter("PLOTTABLE1 -> PLOTTABLE2", Plottables))
      .then(loadPlottable(secondBranch))
      .then(reporter("PLOTTABLE2 -> FILTER", Plottables))
      .then(function () {
        return window.quicktests.filter(function(q) {
          if (quicktestCategory === "" || quicktestCategory === undefined) {
            return true;
          } else {
            return q.categories.indexOf(quicktestCategory) !== -1
          };
        });
      })
      .then(reporter("filtered quicktests"))
      .then(function(qts) {
        console.log(qts);
        qts.forEach(function(q) {
          console.log("iterate", q);
          runQuicktest(table, q, Plottables[firstBranch], Plottables[secondBranch]);
        });
      });
}


var button = document.getElementById('button');
button.onclick = main;

window.onload = main;
