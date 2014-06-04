
var Plottables = {};

function loadPlottable(branchName, callback) {
  var url;
  if (branchName != null) {
    url = "https://rawgithub.com/palantir/plottable/" + branchName + "/plottable.js";
  } else {
    branchName = "#local";
    url = "../plottable.js"; //load local version
  }

  var element = document.createElement("script");
  element.type = "text/javascript";
  element.src = url;
  element.id = branchName;
  element.onload = function() {
    console.log("loaded Plottable:" + branchName);
    Plottables[branchName] = Plottable;
    Plottable = null;
    if (callback != null) callback()
  }
  document.head.appendChild(element);
}

