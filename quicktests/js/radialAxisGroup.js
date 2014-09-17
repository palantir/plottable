function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var rScale = new Plottable.Scale.Linear();
  var thetaScale = new Plottable.Scale.Ordinal().rangeType("points", 0, 0).domain(["one", "two", "three"]);
  new Plottable.Axis.RadialGroup(rScale, thetaScale).renderTo(svg);
}
