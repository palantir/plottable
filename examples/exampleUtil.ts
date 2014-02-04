function makeRandomData(numPoints, scaleFactor=1): IDataset {
  var data = [];
  for (var i = 0; i < numPoints; i++) {
    var x = Math.random();
    var r = {x: x, y: (x + x * Math.random()) * scaleFactor}
    data.push(r);
  }
  data = _.sortBy(data, (d) => d.x);
  return {"data": data, "seriesName": "random-data"};
}

function makeNormallyDistributedData(n=100, xMean?, yMean?, xStdDev?, yStdDev?) {
  var results = [];
  var x = d3.random.normal(xMean, xStdDev);
  var y = d3.random.normal(yMean, yStdDev);
  for (var i=0; i<n; i++) {
    var r = {x: x(), y: y()};
    results.push(r);
  }
  return results;
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
