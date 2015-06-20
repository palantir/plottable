(function iife(){
"use strict";
var quicktests = {};

function loadScript(url) {
  return new Promise(function(resolve, reject) {
    var element = document.createElement("script");
    element.type = "text/javascript";
    element.src = url;
    element.onload = resolve;
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
    return loadScript(url).then(function() {
      Plottables[branchName] = Plottable;
      Plottable = null;
      fulfill();
    });
  });
}

function runSingleQuicktest(container, quickTest, data, Plottable) {
  container.append("p").text(quickTest.name);
  var div = container.append("div");
  try {
    quickTest.run(div, data, Plottable);
  } catch (err) {
    setTimeout(function() {throw err;}, 0);
  }
}

function runQuicktest(tableSelection, quickTest, Plottable1, Plottable2) {
  var tr = tableSelection.append("tr").classed("quicktest-row", true);
  var data = quickTest.makeData();
  runSingleQuicktest(tr.append("td"), quickTest, data, Plottable1);
  tr.append("td");
  runSingleQuicktest(tr.append("td"), quickTest, data, Plottable2);
}
function loadTheQuicktests(quicktestsJSONArray) {
  window.quicktests = [];
  var numToLoad = quicktestsJSONArray.length;
  var numLoaded = 0;
  return new Promise(function (f, r) {
    quicktestsJSONArray.forEach(function(q) {
      var name = q.name;
      d3.text("/quicktests/js/" + name + ".js", function(error, text) {
        if (error !== null) {
          console.warn("Tried to load nonexistant quicktest " + name);
          if (++numLoaded === numToLoad) {
            f();
          }
          return;
        }
        text = "(function(){" + text +
          "\nreturn {makeData: makeData, run: run};" +
               "})();" +
          "\n////# sourceURL=" + name + ".js\n";

        var result = eval(text);
        q.makeData = result.makeData;
        q.run = result.run;
        window.quicktests.push(q);
        if (++numLoaded === numToLoad) {
          f();
        }
      });
    });
  });
}

function loadListOfQuicktests() {
  return new Promise(function (f, r) {
    d3.json("/quicktests/list_of_quicktests.json", function (error, json) {
      if (json !== undefined) {
        f(json);
      } else {
        console.log("got an error loading quicktests json", error);
        r(error);
      }
    });
  });
}

function initializeByLoadingAllQuicktests() {
  return new Promise(function(f, r) {
    if (window.list_of_quicktests == null) {
      loadListOfQuicktests()
        .then(loadTheQuicktests)
        .then(f);
    } else {
      f();
    }
  });
}

function populateDropdown(dropDown, vals, initialVal) {
  dropDown.empty();
  vals.forEach(function(v) {
    dropDown.append($('<option></option>').val(v).html(v));
  });
  if (initialVal != null) {
    dropDown.val(initialVal);
  }
  return dropDown;
}

function setup() {
  //load keyword dropdown
  var keywordList = {};
  d3.json("/quicktests/list_of_quicktests.json", function(data) {
    var categories = d3.set();
    data.forEach(function(d) {
      d.categories.forEach(function(c) {
        categories.add(c);
      });
    });
    categories = categories.values();
    categories.push("#all");
    categories.sort();
    console.log(keywordList);
    var keywordDropdown = $('#filterWord');
    populateDropdown(keywordDropdown, categories, "#all");
  });

  d3.text("/quicktests/github_token.txt", function (err, data) {
    var auth = "";
    if (err != null) {
      console.log("Something went wrong acquiring the Github token. Using unauthenticated requests for feature branches");
      console.log("The site will still work fine, but if you use it a lot you may hit an API rate limit.");
      console.log("To acquire a github token, go here: https://github.com/settings/applications#personal-access-tokens");
      console.log("Make a new token (it needs no permissions) and then save it as quicktests/github_token.txt");
    } else {
      auth = "?access_token=" + data.substring(0,40);
    }
    //load github branch dropdown
    var branchOptions = {};
    $.get("https://api.github.com/repos/palantir/plottable/branches" + auth, function(){
      for(var i = 0; i < data.length; i++){
        branchOptions["val" + i] = data[i].name;
      }
      var names = data.map(function(x) {return x.name;});
      names.push("#local");
      populateDropdown($('#leftBranch'), names, "develop");
      populateDropdown($('#rightBranch'), names, "#local");
    });
  });
}

function go() {
  var table = d3.select("table");
  table.selectAll(".quicktest-row").remove();
  var firstBranch = $('#leftBranch').val();
  var secondBranch = $('#rightBranch').val();
  var quicktestCategory = $('#filterWord').val();
  if (quicktestCategory == null || quicktestCategory === "") {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    vars.forEach(function(v) {
      v = v.split("=");
      if (v[0] === "filterWord") {
        quicktestCategory = v[1];
      }
    });
  }
  console.log(quicktestCategory);
  initializeByLoadingAllQuicktests().then(function() {
    return loadPlottable(firstBranch);
  }).then(function() {
    return loadPlottable(secondBranch);
  }).then(function () {
    return window.quicktests.filter(function(q) {
      if (quicktestCategory === "#all" || quicktestCategory === undefined) {
        return true;
      } else {
        return q.categories.map(function(s) {return s.toLowerCase();}).indexOf(quicktestCategory.toLowerCase()) !== -1;
      }
    });
  }).then(function(qts) {
    return Promise.all(qts.map(function(q) {
      return new Promise(function() {
        runQuicktest(table, q, Plottables[firstBranch], Plottables[secondBranch]);
      });
    }));
  }).catch(function(error) {
    // errors in Promises are swallowed into the abyss by default, we must
    // throw the error in a non-promise callback to get a stack trace
    setTimeout(function() {
      throw error;
    }, 0);
  });
}

var button = document.getElementById('button');
button.onclick = go;

window.onload = setup;
})();
