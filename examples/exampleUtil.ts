function makeRandomData(numPoints, scaleFactor=1): IDataset {
  var data = [];
  for (var i = 0; i < numPoints; i++) {
    var x = Math.random();
    var r = {x: x, y: (x + x * Math.random()) * scaleFactor}
    data.push(r);
  }
  return {"data": data, "seriesName": "random-data"};
}

function makeNormallyDistributedData(n=100, xMean?, xStdDev?, yMean?, yStdDev?) {
  var results = [];
  var x = d3.random.normal(xMean, xStdDev);
  var y = d3.random.normal(yMean, yStdDev);
  for (var i=0; i<n; i++) {
    var r = {x: x(), y: y()};
    results.push(r);
  }
  return results;
}
function makeBinFunction(accessor, range, nBins) {
  return (d) => binByVal(d, accessor, range, nBins);
}

function binByVal(data: any[], accessor: IAccessor, range=[0,100], nBins=10) {
  if (accessor == null) {accessor = (d) => d.x};
  var min = range[0];
  var max = range[1];
  var spread = max-min;
  var binBeginnings = d3.range(nBins).map((n) => min + n * spread / nBins);
  var binEndings = d3.range(nBins)   .map((n) => min + (n+1) * spread / nBins);
  var counts = new Array(nBins);
  d3.range(nBins).forEach((b, i) => counts[i] = 0);
  data.forEach((d) => {
    var v = accessor(d);
    var found = false;
    for (var i=0; i<nBins; i++) {
      if (v <= binEndings[i]) {
        counts[i]++;
        found = true;
        break;
      }
    }
    if (!found) {counts[counts.length-1]++};
  });
  var bins = counts.map((count, i) => {
    var bin: any = {};
    bin.x = binBeginnings[i];
    bin.x2 = binEndings[i];
    bin.y = count;
    return bin;
  })
  return bins;
}
function makeRandomBucketData(numBuckets: number, bucketWidth: number, maxValue = 10): IDataset {
  var data = [];
  for (var i=0; i < numBuckets; i++) {
    data.push({
      x: i * bucketWidth,
      x2: (i+1) * bucketWidth,
      y: Math.round(Math.random() * maxValue)
    });
  }
  return {
    "data": data,
    "seriesName": "random-buckets"
  };
}
