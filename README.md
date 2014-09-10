Plottable.js [![Builds](https://api.travis-ci.org/repositories/palantir/plottable.png?branch=master)](https://travis-ci.org/palantir/plottable)
============

Plottable.js is a library of chart components for creating flexible, interactive, and performant charts for the web. It is built on top of D3 and provides higher-level pieces, like plots, gridlines, and axes. As such, it's easier to quickly build charts

Plottable is based on a philosophy of "Composition over Configuration". As such, rather than providing whole chart objects with a bunch of API points for modifying them, it provides smaller components like axes, gridlines, plots, and legends. There is a table-based layout engine that allows you to compose these pieces into whatever combination suits your data and intended visualization. If a particular piece doesn't quite suite your needs, you can write a new plugin component rather than forking the library or starting from scratch.

Plottable.js is being developed by Palantir Technologies. It's developed in Typescript, and released in Javascript.

Quick Start
---

- Download [plottable.zip](plottable.zip) or get it via Bower: `bower install --save plottable`
- Read the [docs](http://plottablejs.org/tutorials/) and visit the [website](http://plottablejs.org/)

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
