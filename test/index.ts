declare var require: any;

require("./globalInitialization");

// create a require context hitting the TestSelector plugin
const testsContext = require.context("TestSelector", true, /Test.js$/);
// invoke the context on each included file name (this runs the test).
testsContext.keys().forEach(testsContext);
