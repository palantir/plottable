function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var rScale = new Plottable.Scale.Linear();
  new Plottable.Axis.Radial(rScale, Math.PI / 3).renderTo(svg);
}
