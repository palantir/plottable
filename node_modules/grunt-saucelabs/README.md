grunt-saucelabs
---------------------

[![Build Status](https://api.travis-ci.org/axemclion/grunt-saucelabs.png?branch=master)](https://travis-ci.org/axemclion/grunt-saucelabs)
[![Selenium Test Status](https://saucelabs.com/buildstatus/grunt-sauce)](https://saucelabs.com/u/grunt-sauce)

[![Selenium Test Status](https://saucelabs.com/browser-matrix/grunt-sauce.svg)](https://saucelabs.com/u/grunt-sauce)

[![Dependency Status](https://david-dm.org/axemclion/grunt-saucelabs.png)](https://david-dm.org/axemclion/grunt-saucelabs) [![devDependency Status](https://david-dm.org/axemclion/grunt-saucelabs/dev-status.png)](https://david-dm.org/axemclion/grunt-saucelabs#info=devDependencies)

A Grunt task for running QUnit, Jasmine, Mocha, YUI tests, or any framework using Sauce Labs' Cloudified Browsers.

[Grunt](http://gruntjs.com/) is a task-based command line build tool for JavaScript projects, based on nodejs.
[QUnit](http://qunitjs.com/) is a powerful, easy-to-use JavaScript unit test suite used by the jQuery, jQuery UI and jQuery Mobile projects and is capable of testing any generic JavaScript code, including itself!
[Jasmine](http://jasmine.github.io/) is a behavior-driven development framework for testing JavaScript code.
[Mocha](https://github.com/mochajs/mocha) is a JavaScript test framework for running serial asynchronous tests.
[YUI Test](http://developer.yahoo.com/yui/yuitest/) is a browser-based testing framework from Yahoo!.
[Sauce Labs](https://saucelabs.com/) offers browser environments on the cloud for testing code.

About the tool
--------------
The [grunt-contrib-qunit](https://github.com/gruntjs/grunt-contrib-qunit) task runs QUnit based test suites on [PhantomJS](http://phantomjs.org/).
The `saucelabs-qunit` task is very similar but runs the test suites on the cloudified browser environment provided by Sauce Labs. This ensures that subject of the test runs across different browser environment.
The task also uses [Sauce Connect](https://saucelabs.com/docs/connect) to establish a tunnel between Sauce Labs browsers and the machine running Grunt to load local pages. This is typically useful for testing pages on localhost that are not publicly accessible on the internet.
The `saucelabs-jasmine` runs [Jasmine](http://pivotal.github.io/jasmine/) tests in the Sauce Labs browser. The `saucelabs-jasmine` task requires `jasmine-1.3.0`. There are also `saucelabs-mocha` and `saucelabs-yui` tasks that let you run your Mocha and YUI tests on Sauce Labs cloudified browser environment.

Usage
------
This task is available as a [node package](https://npmjs.org/package/grunt-saucelabs) and can be installed as `npm install grunt-saucelabs`. It can also be included as a devDependency in package.json in your node project.

To use the task in `grunt.js`, load the npmTask.


```javascript
grunt.loadNpmTasks('grunt-saucelabs');

```

In the `grunt.initConfig`, add the configuration that looks like the following

```javascript
var request = require('request');
...
'saucelabs-qunit': {
  all: {
    options: {
      username: 'saucelabs-user-name', // if not provided it'll default to ENV SAUCE_USERNAME (if applicable)
      key: 'saucelabs-key', // if not provided it'll default to ENV SAUCE_ACCESS_KEY (if applicable)
      urls: ['www.example.com/qunitTests', 'www.example.com/mochaTests'],
      build: process.env.CI_BUILD_NUMBER,
      testname: 'Sauce Unit Test for example.com',
      browsers: [{
        browserName: 'firefox',
        version: '19',
        platform: 'XP'
      }]
      // optionally, he `browsers` param can be a flattened array:
      // [["XP", "firefox", 19], ["XP", "chrome", 31]]
    }
  }
}

```

The configuration of `saucelabs-jasmine`, `saucelabs-mocha`, `saucelabs-yui`, and `saucelabs-custom` are exactly the same.
Note the options object inside a grunt target. This was introduced in grunt-saucelabs-* version 4.0.0 to be compatible with grunt@0.4.0


Full list of parameters which can be added to a saucelabs-* task:

* __username__ : The Sauce Labs username that will be used to connect to the servers. If not provided, uses the value of SAUCE_USERNAME environment variable. _Optional_
* __key__ : The Sauce Labs secret key. Since this is a secret, this should not be checked into the source code and may be available as an environment variable. Grunt can access this using `process.env.saucekey`. Will also default to SAUCE_ACCESS_KEY environment variable. _Optional_
* __urls__: An array or URLs that will be loaded in the browsers, one after another. Since SauceConnect is used, these URLs can also be localhost URLs that are available using the `server` task from grunt. _Required_
* __build__: The build number for this test. _Optional_
* __testname__: The name of this test, displayed on the Sauce Labs dashboard. _Optional_
* __tags__: An array of strings, to be added as tags to the test on Sauce Labs. _Optional_
* __tunneled__: Defaults to true; Won't launch a Sauce Connect tunnel if set to false. _Optional_
* __tunnelArgs__: Array of optional arguments to be passed to the Sauce Connect tunnel. example: `['--debug', '--direct-domains', 'google.com']`. See [here](https://saucelabs.com/docs/connect) for further documentation.
* __sauceConfig__: Map of extra parameters to be passed to sauce labs. example: `{'video-upload-on-pass': false, 'idle-timeout': 60}`. See [here](https://saucelabs.com/docs/additional-config) for further documentation.
* __pollInterval__: Number of milliseconds between each retry to see if a test is completed or not (default: 2000). _Optional_
* __statusCheckAttempts__: Number of times to attempt to see if a test is completed or not (default: 90).  Effectively, your tests have `statusCheckAttempts * pollInterval` seconds to complete (Thus, 180s by default).  Set to `-1` to try forever.
* __throttled__: Maximum number of unit test pages which will be sent to Sauce Labs concurrently.  Exceeding your Sauce Labs' allowed concurrency can lead to test failures if you have a lot of unit test pages. _Optional_
* __max-duration__: Maximum duration of a test, this is actually a Selenium Capability. Sauce Labs defaults to 180 seconds for js unit tests. _Optional_
* __browsers__: An array of objects representing the [various browsers](https://saucelabs.com/docs/platforms) on which this test should run. _Optional_
* __onTestComplete__: A callback that is called every time a unit test for a page is complete. Runs per page, per browser configuration. Receives two arguments `(result, callback)`. `result` is the javascript object exposed to sauce labs as the results of the test. `callback` must be called, node-style (having arguments `err`, `result` where result is a true/false boolean which sets the test result reported to the command line). See [example below](#ontestcomplete-callback) _Optional_
* __maxRetries__: Specifies how many times the timed out tests should be retried (default: 0). _Optional_

A typical `test` task running from Grunt could look like `grunt.registerTask('test', ['server', 'qunit', 'saucelabs-qunit']);` This starts a server and then runs the QUnit tests first on PhantomJS and then using the Sauce Labs browsers.

Exposing Test Results to the Sauce Labs API
-------------------------------------------
Since this project uses the Sauce Labs js unit test API, the servers at Sauce Labs need a way to get the results of your test. Follow the instructions below to assure that the results of your tests are delivered properly.

### Test result details with Jasmine ###

You can make Job Details pages more informative on Sauce by providing more data with each test. You will get info about each test run inside your suite directly on Sauce pages.

[![Jasmine detailed results](https://saucelabs.com/images/front-tests/jasmine.png)](https://saucelabs.com/docs/javascript-unit-tests-integration)

You can do that by using [Jasmine JS Reporter](https://github.com/detro/jasmine-jsreporter) that will let `saucelabs-jasmine` task provide in-depth data about each test as a JSON object.

All you need to do is to include the new jasmine-jsreporter reporter to the page running Jasmine tests by adding new script in header:
```html
<script src="path/to/jasmine-jsreporter.js" type="text/javascript"></script>
```
and telling Jasmine to use it:
```javascript
jasmineEnv.addReporter(new jasmine.JSReporter());
````

### Test result details with QUnit ###

Add the following to your QUnit test specification
```javascript
var log = [];
var testName;

QUnit.done(function (test_results) {
  var tests = [];
  for(var i = 0, len = log.length; i < len; i++) {
    var details = log[i];
    tests.push({
      name: details.name,
      result: details.result,
      expected: details.expected,
      actual: details.actual,
      source: details.source
    });
  }
  test_results.tests = tests;

  window.global_test_results = test_results;
});
QUnit.testStart(function(testDetails){
  QUnit.log(function(details){
    if (!details.result) {
      details.name = testDetails.name;
      log.push(details);
    }
  });
});
```

### Test result details with mocha ###

Add the following to the mocha test page html. Make sure you remove any calls to ```mocha.checkLeaks()``` or add ```mochaResults``` to the list of globals.
```html
<script>
  onload = function(){
    //mocha.checkLeaks();
    //mocha.globals(['foo']);
    var runner = mocha.run();

    var failedTests = [];
    runner.on('end', function(){
      window.mochaResults = runner.stats;
      window.mochaResults.reports = failedTests;
    });

    runner.on('fail', logFailure);

    function logFailure(test, err){

      var flattenTitles = function(test){
        var titles = [];
        while (test.parent.title){
          titles.push(test.parent.title);
          test = test.parent;
        }
        return titles.reverse();
      };

      failedTests.push({name: test.title, result: false, message: err.message, stack: err.stack, titles: flattenTitles(test) });
    };
  };
</script>
```

### Test result details with YUI Test ###

There's nothing you have to do for YUI Tests! The js library already exposes ```window.YUITest.TestRunner.getResults()```

### Test result details with a custom framework ###

When you tests are finished, expose your tests results on `window.global_test_results` as explained in [SauceLab's JS Unit Testing REST API Documentation](https://saucelabs.com/docs/rest#jsunit)

OnTestComplete callback
-----------------------
An optional parameter to the grunt task is `OnTestComplete`, a callback which is called at the end of every test, before results are logged to the console.
You can use this callback to intercept results from SauceLabs and re-report the results (or use the information for your own purposes)

Receives two arguments `(result, callback)`. `result` is the javascript object exposed to sauce labs as the results of the test. `callback` must be called, node-style (having arguments `err`, `result` where result is a true/false boolean which sets the test result reported to the command line)

When running the tests for this project, we need to test the case where a test *fails* on Sauce. In this case, we want to record a test Failure as a Success for us.

```
'saucelabs-qunit': {
  all: {
    options: {
      username: 'saucelabs-user-name', // if not provided it'll default to ENV SAUCE_USERNAME (if applicable)
      key: 'saucelabs-key', // if not provided it'll default to ENV SAUCE_ACCESS_KEY (if applicable)
      urls: ['www.example.com/qunitTests', 'www.example.com/mochaTests'],
      build: process.env.CI_BUILD_NUMBER,
      testname: 'Sauce Unit Test for example.com',
      browsers: [{
        browserName: 'firefox',
        version: '19',
        platform: 'XP'
      }],
      onTestComplete: function(result, callback) {
        // Called after a unit test is done, per page, per browser
        // 'result' param is the object returned by the test framework's reporter
        // 'callback' is a Node.js style callback function. You must invoke it after you
        // finish your work.
        // Pass a non-null value as the callback's first parameter if you want to throw an
        // exception. If your function is synchronous you can also throw exceptions
        // directly.
        // Passing true or false as the callback's second parameter passes or fails the
        // test. Passing undefined does not alter the test result. Please note that this
        // only affects the grunt task's result. You have to explicitly update the Sauce
        // Labs job's status via its REST API, if you want so.

        // The example below negates the result, and also updates the Sauce Labs job's status
        var user = process.env.SAUCE_USERNAME;
        var pass = process.env.SAUCE_ACCESS_KEY;
        request.put({
            url: ['https://saucelabs.com/rest/v1', user, 'jobs', result.job_id].join('/'),
            auth: { user: user, pass: pass },
            json: { passed: !result.passed }
        }, function (error, response, body) {
          if (error) {
            callback(error);
          } else if (response.statusCode !== 200) {
            callback(new Error('Unexpected response status'));
          } else {
            callback(null, !result.passed);
          }
        });
      }
    }
  }
}
```

Examples
--------
Some projects that use this task are as follows. You can take a look at their GruntFile.js for sample code

* [This project](https://github.com/axemclion/grunt-saucelabs/blob/master/Gruntfile.js)
* [WinJS](http://try.buildwinjs.com/#status)
* [Jquery-IndexedDB](https://github.com/axemclion/jquery-indexeddb/blob/master/GruntFile.js)
* [IndexedDBShim](https://github.com/axemclion/IndexedDBShim/blob/master/Gruntfile.js)

If you have a project that uses this plugin, please add it to this list and send a pull request.


Integration with a CI system
----------------------------
Grunt tasks are usually run alongside a continuous integration system. For example, when using [Travis](https://travis-ci.org), adding the following lines in the package.json ensures that the task is installed with `npm install` is run. Registering Sauce Labs in test task using `grunt.registerTask('test', ['server', 'saucelabs-qunit']);` ensures that the CI environment runs the tests using `npm test`.
To secure the Sauce Key, the CI environment can be configured to provide the key as an environment variable instead of specifying it file. CI Environments like Travis provide [ways](http://about.travis-ci.org/docs/user/build-configuration/#Secure-environment-variables) to add secure variables in the initial configuration.
The [IndexedDBShim](http://github.com/axemclion/IndexedDBShim) is a project that uses this plugin in a CI environment. Look at the [.travis.yml](https://github.com/axemclion/IndexedDBShim/blob/master/.travis.yml) and the [grunt.js](https://github.com/axemclion/IndexedDBShim/blob/master/Gruntfile.js) for usage example.

Changelog
---------
####8.6.0####
* check job completion a maximum number of times
* added a config setting, `statusCheckAttempts` which defaults to 90
* updated to Sauce Connect v4.3.6
* update dependencies

####8.5.0####
* fix ECONNRESET errors caused by network connectivity issues
* better error logging

####8.4.1####
* updated sauce-tunnel to v2.1.1 (and therefore Sauce Connect to v4.3.5)

####8.4.0####
* polling a job for its status now retries
* add `maxPollRetries` parameter, which specifies the number of status-requests to make before giving up on a job

####8.3.3####
* improvements to README
* add a 'tags' parameter to the config, to allow setting tags on tests
* optionally, you can set "name" and "tags" onto the "browser" object and they'll be applied to the corresponding job

####8.3.2####
* fixed a bug where DELETE commands which errored on the Sauce side caused test execution to halt

####8.3.0####
* add `testPageUrl` to `result` object. Indicates the url which was the target of the test.

####8.2.2####
* `browsers` param can optionally be an array identical to the one used by the Sauce API. ex: `["XP", "firefox", "19"]`

####8.2.1####
* update dependencies

####8.2.0####
* upgrade to sauce-tunnel 2.1 (SC 3.4)

####8.1.1####
* better detection and handling or errors which happen on Sauce Labs

####8.1.0####
* added retry logic, thanks again to @gvas, now you can use `maxRetries` parameter to automatically retry tests which fail

####8.0.3####
* fixed bug, sauce job urls displayed in log properly again

####8.0.2####
* fixed bug, `testname` option not working

####8.0.1####
* Major refactor, thanks to all the work done by @gvas
* async `onTestComplete` callback fixed. Now the callback is passed two args: result, callback. `callback` is a node style callback (err, result);
* `/examples` directory added, while the actual tests and Gruntfile are now more complicated (and useful)

####7.0.0####
* `throttled` parameter now represents the max number of jobs sent concurrently. Previously was `throttled * browsers.length`

####6.0.0####
* default `testInterval` changed to 2000ms
* added `max-duration`, sauceConfig, and sauceTunnel params

####5.1.3####
* update to sauce-tunnel 2.0.6, which uses Sauce Connect 4.2
* queued job throttling added

####5.1.2####
* use sauce-tunnel-sc3-1 to protect against heartbleed bug

####5.1.1####
* Qunit reporting code made ecma3 compatible
* Qunit reporting code doesn't clober the `.done()` callback
* Updated dependencies

####5.1.0####
* Added `custom` framework
* Updated the test reporting on example pages to provide details when tests fail
