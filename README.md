Plottable.js [![Builds](https://api.travis-ci.org/repositories/palantir/plottable.svg?branch=master)](https://travis-ci.org/palantir/plottable)
============

[![Join the chat at https://gitter.im/palantir/plottable](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/palantir/plottable?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Overview
---

Plottable.js is a library of chart components for creating flexible, custom charts for websites. It is built on top of [D3.js](http://d3js.org/) and provides higher-level pieces, like plots, gridlines, and axes. As such, it's easier to quickly build charts than with D3, and the charts are much
more flexible than standard-template charts provided by charting libraries. You can think of Plottable as a "D3 for Charts" - it is not a charting library but a library of chart components. Check out examples of Plottable on our website's [examples page](http://plottablejs.org/examples/).

Philosophy
---
Plottable's core philosophy is "Composition over Configuration", so a lot of the API flexibility is in choosing which `Components` to use, and how to arrange them in `Tables`, rather than setting high-level properties on the charts. If you find you need a feature that doesn't exist, consider writing a new `Component` that implements the functionality. This way, you can get your custom functionality and still benefit from the rest of the library.

Plottable.js is being developed by [Palantir Technologies](http://palantir.com/). It's developed in [Typescript](http://typescriptlang.org/), and released in Javascript.

Quick Start
---

- Get Plottable:
  - Using Bower: `bower install --save plottable`.
  - Via [cdnjs](https://cdnjs.com/libraries/plottable.js).
  - Downloading [plottable.zip](plottable.zip).
- Check out [examples](http://plottablejs.org/examples/), read the [tutorials](http://plottablejs.org/tutorials/), and visit the [website](http://plottablejs.org/).

Upgrading to 1.0
---

If you are upgrading from a pre-1.0 version of Plottable to v1.0 or later, please use the [Upgrade Guide](https://github.com/palantir/plottable/wiki/Upgrading-to-1.0.0) on the wiki.

We Want To Help!
---
If you run into any problems using Plottable, please let us know. We want Plottable to be easy-to-use, so if you are getting confused, it is our fault, not yours. [Create an issue](https://github.com/palantir/plottable/issues) and we'll be happy to help you out, or drop by our [Gitter room](https://gitter.im/palantir/plottable).

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
- Fill out the [Personal](https://github.com/palantir/plottable/blob/develop/Plottable_Personal_Contributer_License_Agreement.pdf?raw=true) or [Corporate](https://github.com/palantir/plottable/blob/develop/Plottable_Corporate_Contributor_License_Agreement.pdf?raw=true) Contributor License Agreement and send it to [opensource@palantir.com](mailto:opensource@palantir.com)
  - You can do this easily on a Mac by using the Tools - Annotate - Signature feature in Preview.
- Submit a pull request
