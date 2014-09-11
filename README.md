Plottable.js [![Builds](https://api.travis-ci.org/repositories/palantir/plottable.png?branch=master)](https://travis-ci.org/palantir/plottable)
============

Plottable.js is a library of chart components for creating flexible, custom charts for websites. It is built on top of D3 and provides higher-level pieces, like plots, gridlines, and axes. As such, it's easier to quickly build charts than with D3, and the charts are much
more flexible than standard-template charts provided by charting libraries. You can think of Plottable as like a "D3 for Charts" - it is not a charting library so much as a set of tools that can be flexibly used to create charts.

If you're looking for an easy-to-use charting library that provides ready-made charts, check out our sister library, [Chartographer.js](https://github.com/palantir/chartographer/). It uses Plottable to create simple charts, and exposes all of the Plottable components so you can use it as a starting point and then add more complexity as you go.

Check out a bunch of examples of Plottable on our website's [examples page](http://plottablejs.org/examples/). Our core philosophy is "Composition over Configuration", so expect that a lot of the API flexibility is in choosing which `Components` to use, and how to arrange them, rather than setting high-level properties on the charts. If you find you need a feature that doesn't exist, consider writing a new `Component` that implements it as a plugin. This way, you can get your custom functionality and still benefit from the rest of the library. We'll add a tutorial on writing plugins soon - for now, drop a line at our [Google group](https://groups.google.com/forum/#!forum/plottablejs) and we'll help our directly.

Plottable has a powerful and highly flexible approach to dealing with data that is agnostic to the format of your data. Basically, you provide an array of data elements with arbitrary properties, and then provide `accessors` that tell Plottable how to get your data out of the datum objects. You may additionally provide a `Scale` for maintaining a consistent mapping between data-space and visual properties. This avoids [Yak Shaving](http://www.hanselman.com/blog/YakShavingDefinedIllGetThatDoneAsSoonAsIShaveThisYak.aspx) and makes it easy to try visualizing different parts of your data.

If you run into any problems using Plottable, please let us know. We want Plottable to be easy-to-use, so if you are getting confused, it is our fault, not yours. [Create an issue](https://github.com/palantir/plottable/issues) and we'll help you fix things, and fix the bug, or add a more helpful error message, or improve our documentation.

Plottable.js is being developed by Palantir Technologies. It's developed in Typescript, and released in Javascript.

Quick Start
---

- Download [plottable.zip](plottable.zip) or get it via Bower: `bower install --save plottable`
- Check out [examples](http://plottablejs.org/examples/), read the [docs](http://plottablejs.org/tutorials/) and visit the [website](http://plottablejs.org/)

Development
---

- Clone the repo
- Install global dependencies `sudo npm install grunt grunt-cli typescript -g`
- Install local dependencies `npm install`
- Run `grunt` and it will spin up a server (pointed at localhost:9999) and begin compiling the typescript code
- For local experimentation, the source files are individually compiled to their own javascript files, with `plottable_multifile.js` responsible for loading them together when ready

Contributing
---

- Write your code
- Add tests for new functionality
- Run `grunt test` and verify it completes with no warnings or failures
- Commit new files, including the updated built files like `plottable.js` and `plottable.d.ts`
- Submit a pull request
