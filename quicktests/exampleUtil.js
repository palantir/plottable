function makeRandomData(numPoints, scaleFactor) {
  "use strict";
  if (typeof scaleFactor === "undefined") { scaleFactor = 1; }
  var data = [];
  for (var i = 0; i < numPoints; i++) {
    var x = Math.random();
    var r = { x: x, y: (x + x * Math.random()) * scaleFactor };
    data.push(r);
  }
  data.sort(function (a, b) {
    return a.x - b.x;
  });
  return data;
}

function makeSinusoidalData(min, max, delta) {
  "use strict";
  if (typeof min === "undefined") { min = 0; }
  if (typeof max === "undefined") { max = Math.PI; }
  if (typeof delta === "undefined") { delta = 0.1; }
  var results = [];
  for (var i = 0; i < max; i += delta) {
    results.push({ x: i, y: Math.sin(i) });
  }
  return results;
}

function makeNormallyDistributedData(n, xMean, xStdDev, yMean, yStdDev) {
  "use strict";
  if (typeof n === "undefined") { n = 100; }
  var results = [];
  var x = d3.random.normal(xMean, xStdDev);
  var y = d3.random.normal(yMean, yStdDev);
  for (var i = 0; i < n; i++) {
    var r = { x: x(), y: y() };
    results.push(r);
  }
  return results;
}

function binByVal(data, accessor, range, nBins) {
  "use strict";
  if (typeof range === "undefined") { range = [0, 100]; }
  if (typeof nBins === "undefined") { nBins = 10; }
  if (accessor == null) {
    accessor = function (d) {
      return d.x;
    };
  }
  var min = range[0];
  var max = range[1];
  var spread = max - min;
  var binBeginnings = d3.range(nBins).map(function (n) {
    return min + n * spread / nBins;
  });
  var binEndings = d3.range(nBins).map(function (n) {
    return min + (n + 1) * spread / nBins;
  });
  var counts = new Array(nBins);
  d3.range(nBins).forEach(function (b, i) {
    counts[i] = 0;
  });
  data.forEach(function (d) {
    var v = accessor(d);
    var found = false;
    for (var i = 0; i < nBins; i++) {
      if (v <= binEndings[i]) {
        counts[i]++;
        found = true;
        break;
      }
    }
    if (!found) {
      counts[counts.length - 1]++;
    }
  });
  var bins = counts.map(function (count, i) {
    var bin = {};
    bin.x = binBeginnings[i];
    bin.dx = spread / nBins;
    bin.y = count;
    return bin;
  });
  return bins;
}

function makeBinFunction(accessor, range, nBins) {
  "use strict";
  return function (d) {
    return binByVal(d, accessor, range, nBins);
  };
}

function makeRandomBucketData(numBuckets, bucketWidth, maxValue) {
  "use strict";
  if (typeof maxValue === "undefined") { maxValue = 10; }
  var data = [];
  for (var i = 0; i < numBuckets; i++) {
    data.push({
      x: i * bucketWidth,
      dx: bucketWidth,
      y: Math.round(Math.random() * maxValue)
    });
  }
  return data;
}

function generateHeightWeightData(n) {
  "use strict";
  var data = [];
  var heightGen = d3.random.normal(180, 2.5);
  var weightGen = d3.random.normal(170, 30);
  for (var i = 0; i < n; i++) {
    data.push({
      age: Math.random() * 50 + 20,
      gender: Math.random() > 0.5 ? "female" : "male",
      height: heightGen(),
      weight: weightGen()
    });
  }

  return data;
}

function deepCopy(from, to){
  "use strict";
  var deepCopyXY = function(d) {
    to.push({ "x": d.x, "y": d.y });
  };
  from.forEach(deepCopyXY);
}
