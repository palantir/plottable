

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
    if (branchName != null && branchName !== "") {
      url = "https://rawgithub.com/palantir/plottable/" + branchName + "/plottable.js";
    } else {
      branchName = "#local";
      url = "plottable.js"; //load local version
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

function runSingleQuicktest(container, quickTest, Plottable) {
  console.log("single");
  container.append("p").text(quickTest.name);
  var svg = container.append("svg").attr("height", 500);
  quickTest.function(svg, _.cloneDeep([data1, data2]), Plottable);
}

function runQuicktest(tableSelection, quickTest, Plottable1, Plottable2) {
  console.log("running:", quickTest.name, "on plottables", Plottable1, Plottable2);
  var tr = tableSelection.append("tr").classed("quicktest-row", true);
  runSingleQuicktest(tr.append("td"), quickTest, Plottable1);
  tr.append("td");
  runSingleQuicktest(tr.append("td"), quickTest, Plottable2);
}

function initializeByLoadingAllQuicktests() {
  console.log("started from the bottom now we here")
  return new Promise(function(f, r) {
    console.log("function in promise is executing", window.list_of_quicktests);
    if (window.list_of_quicktests == null) {
      loadListOfQuicktests()
        .then(reporter("JSON->LOAD"))
        .then(loadTheQuicktests)
        .then(reporter("load->fulfill"))
        .then(f)
    } else {
      console.log("quicktests already loaded, resolving");
      f();
    }
  });
}

function loadListOfQuicktests() {
  console.log("loadList called");
  return new Promise(function (f, r) {
    d3.json("quicktests/list_of_quicktests.json", function (error, json) {
      if (json !== undefined) {
        console.log("got the quicktests json", json);
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
  console.log("loadTheQuicktests called with ", quicktestsJSONArray)
  return new Promise(function (f, r) {
    quicktestsJSONArray.forEach(function(q) {
      var name = q.name;
      console.log("attempting to load quicktest", name);
      d3.text("quicktests/quicktests/" + name + ".js", function(error, text) {
        q.function = new Function("svg", "data", "Plottable", text);
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
  console.log("calling main");
  var table = d3.select("table");
  table.selectAll(".quicktest-row").remove();
  var firstBranch = "master";
  var secondBranch = $('#featureBranch').val();
  var quicktestCategory = $('#filterWord').val();
  initializeByLoadingAllQuicktests()
      .then(reporter("LOAD -> PLOTTABLE1"))
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
        qts.forEach(function(q) {
          console.log("iterate - q");
          runQuicktest(table, q, Plottables[firstBranch], Plottables[secondBranch]);
        });
      });
}


var button = document.getElementById('button');
button.onclick = main;

window.onload = main;
