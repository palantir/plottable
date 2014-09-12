Plottable.js [![Builds](https://api.travis-ci.org/repositories/palantir/plottable.png?branch=master)](https://travis-ci.org/palantir/plottable)
============

Overview
---

Plottable.js is a library of chart components for creating flexible, custom charts for websites. It is built on top of [D3.js](http://d3js.org/) and provides higher-level pieces, like plots, gridlines, and axes. As such, it's easier to quickly build charts than with D3, and the charts are much
more flexible than standard-template charts provided by charting libraries. You can think of Plottable as a "D3 for Charts" - it is not a charting library but a library of chart components. Check out examples of Plottable on our website's [examples page](http://plottablejs.org/examples/).

Philosophy
---
Plottable's core philosophy is "Composition over Configuration", so a lot of the API flexibility is in choosing which `Components` to use, and how to arrange them in `Tables`, rather than setting high-level properties on the charts. If you find you need a feature that doesn't exist, consider writing a new `Component` that implements it as a plugin. This way, you can get your custom functionality and still benefit from the rest of the library. Drop a line at our [Google group](https://groups.google.com/forum/#!forum/plottablejs) if you want help implementing a plugin.

Plottable.js is being developed by [Palantir Technologies](http://palantir.com/). It's developed in [Typescript](http://typescriptlang.org/), and released in Javascript.

Quick Start
---

- Download [plottable.zip](plottable.zip) or get it via Bower: `bower install --save plottable`
- Check out [examples](http://plottablejs.org/examples/), read the [docs](http://plottablejs.org/tutorials/) and visit the [website](http://plottablejs.org/)

Even Quicker Start
---
If you just want to create a simple LineChart, ScatterPlot, or BarChart without worrying about `Tables` and `Components`, check out our sister library, [Chartographer.js](https://github.com/palantir/chartographer/). It uses Plottable to create simple charts, and exposes all of the Plottable components so you can use it as a starting point and then add more complexity as desired.

We Want To Help!
---
If you run into any problems using Plottable, please let us know. We want Plottable to be easy-to-use, so if you are getting confused, it is our fault, not yours. [Create an issue](https://github.com/palantir/plottable/issues) and we'll be happy to help you out.

API Changes in Progress
---
Please be aware: as of 9/12/2014, there is currently an API change underway. In the near future, plots like `Plot.Scatter` and `Plot.Line` will receive data differently, so that they can maintain multiple datasets instead of being stuck with only one. For more details, [see the API change proposal](https://github.com/palantir/plottable/wiki/Proposed-API-Change:-Multi-dataset-Plots).

Development
---

- Clone the repo
- Install global dependencies `sudo npm install grunt grunt-cli typescript -g`
- Install local dependencies `npm install`
- Run `grunt` and it will spin up a server (pointed at localhost:9999) and begin compiling the typescript code

Contributing
---

- Write your code
- Add tests for new functionality, and please add some quicktests too
- Run `grunt test` and verify it completes with no warnings or failures
- Commit new files, including the updated built files like `plottable.js` and `plottable.d.ts`
- Submit a pull request
