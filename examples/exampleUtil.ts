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
