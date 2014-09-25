function renderPlots(){
	var dropdown = $("#category")[0];
	var category = dropdown.options[dropdown.selectedIndex].value;

  loadQuickTestDir(category);

}

function loadQuickTestDir(category){
  //d3.text("/quicktests/new/" + category + "");
  readQuickTests();
}

function readQuickTests(){
  var temp = d3.json("list_of_quicktests.json");
  console.log(temp);
  
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