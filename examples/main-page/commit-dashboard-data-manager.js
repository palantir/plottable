function makeCommitDataManager(data) {
  /* data: an array of commits, in time order
     a commit:
       date: dateTime
       byDirectory: [{directory: string, additions: num, deletions: num, lines: num}]
       changes: [{fileName: string, directory: string, additions, deletions, lines}]
  returns:
  commits            : an array of commit objects: [name: name, date: date, lines: lines] - FILTER BY DIRECTORY ONLY
  directoryTimeSeries: object mapping from directory name to a DirectoryTimeSeries which is an array of [date, cumulativeLines] objects, filtered by person selector - FILTER BY PERSON ONLY
  linesByContributor : an array of [contributor, lines] lists which have been filtered to the directory selector - FILTER BY DIRECTORY ONLY
  linesByDirectory   : an array of [directory, lines] pairs, filtered by the person selector (if appropriate) - FILTER BY PERSON ONLY

  */
  var contributors = function() {
    var cfound = {};
    var out = [];
    data.forEach(function(c) {
      if (cfound[c.name] == null) {
        cfound[c.name] = true;
        out.push(c.name);
      }
    });
    return out;
  }();
  var directories = ["/", "lib", "src", "examples", "typings", "test"];

  var f = function(selector) {
    var isContributorSelector = contributors.indexOf(selector) !== -1;
    var isDirectorySelector   = directories .indexOf(selector) !== -1;

    function personFilter(c) {
      if (isContributorSelector) {
        return c.name === selector;
      }
      return true;
    }

    processedCommits = [];
    directoryTimeSeries = {"/": [], "src": [], "lib": [], "examples": [], "typings": [], "test": []};
    linesByContributorObj = {};
    linesByDirectoryObj = {"/": 0, "src": 0, "lib": 0, "examples": 0, "typings": 0, "test": 0};

    data.forEach(function(c) {
      var date = c.date;
      directories.forEach(function(d) {
        directoryTimeSeries[d].push([new Date(date - 1), linesByDirectoryObj[d]]);
      });
      if (personFilter(c)) {
        directories.forEach(function(d) {
          if (c.byDirectory[d] != null) {
            linesByDirectoryObj[d] += c.byDirectory[d].lines;
          }
        });
      }
      directories.forEach(function(d) {
        directoryTimeSeries[d].push([date, linesByDirectoryObj[d]]);
      });

      var directoriesToIterateOver = isDirectorySelector ? [selector] : directories;
      var lines = 0;
      directoriesToIterateOver.forEach(function(d) {
        l = c.byDirectory[d];
        l = (l == null) ? 0 : l.lines;
        lines += l;
      });
      if (personFilter(c) && lines > 0) {
        processedCommits.push({name: c.name, date: date, lines: lines});
      }
      if (linesByContributorObj[c.name] == null) {
        linesByContributorObj[c.name] = 0;
      }
      linesByContributorObj[c.name] += lines;
    });

    var linesByDirectory = [];
    var linesByContributor = [];
    directories.forEach(function(d) {
      linesByDirectory.push({directory: d, lines: linesByDirectoryObj[d]})
    });
    contributors.forEach(function(d) {
      linesByContributor.push({name: d, lines: linesByContributorObj[d]})
    });

    return {"commits": processedCommits, "linesByContributor": linesByContributor, "directoryTimeSeries": directoryTimeSeries, "linesByDirectory": linesByDirectory}
  }
  f.contributors = contributors;
  f.directories = directories;
  return f;
}
