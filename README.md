# Plottable [![Builds](https://api.travis-ci.org/repositories/palantir/plottable.svg?branch=master)](https://travis-ci.org/palantir/plottable) [![Join the chat at https://gitter.im/palantir/plottable](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/palantir/plottable?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Plottable is a library of chart components for creating flexible, custom charts for websites. It is built on top of [D3.js](http://d3js.org/) and provides higher-level pieces, like plots, gridlines, and axes. As such, it's easier to quickly build charts than with D3, and the charts are much
more flexible than standard-template charts provided by charting libraries. You can think of Plottable as a "D3 for Charts" &mdash; it is not a charting library but rather a library of chart components. Check out examples of Plottable on our website's [examples page](http://plottablejs.org/examples/).

## Philosophy

Plottable's core philosophy is "Composition over Configuration", so a lot of the API flexibility is in choosing which `Components` to use, and how to arrange them in `Tables`, rather than setting high-level properties on the charts. If you find you need a feature that doesn't exist, consider writing a new `Component` that implements the functionality. This way, you can get your custom functionality and still benefit from the rest of the library.

Plottable is used and developed at [Palantir Technologies](http://palantir.com/). It's developed in [TypeScript](http://typescriptlang.org/) and distributed in ES5 JavaScript.

## Quick Start

- Get Plottable:
  - npm: `npm install --save plottable`
  - yarn: `yarn add plottable`
  - Bower (**deprecated**): `bower install --save plottable`
  - [unpkg](https://unpkg.com/plottable/plottable.min.js)
  - [cdnjs URL](https://cdnjs.com/libraries/plottable.js)
  - [Direct download: plottable.zip](plottable.zip)
- [Check out examples](http://plottablejs.org/examples/)
- [Read the tutorials](http://plottablejs.org/tutorials/)
- [Visit the website, plottablejs.org](http://plottablejs.org/)

**As of 3.0, the plottable.js file is no longer accessible through rawgithub. Use npm or unpkg.**

## Upgrading to v1.0.0

If you are upgrading from a pre-v1.0.0 version of Plottable to v1.0.0 or later, please use the [Upgrade Guide](https://github.com/palantir/plottable/wiki/Upgrading-to-1.0.0) on the wiki.

## We Want To Help!

If you run into any problems using Plottable, please let us know. We want Plottable to be easy-to-use, so if you are getting confused, it is our fault, not yours. [Create an issue](https://github.com/palantir/plottable/issues) and we'll be happy to help you out, or drop by our [Gitter room](https://gitter.im/palantir/plottable).

## Development

- Clone the repo
- Install local dependencies `yarn install`
- Run `yarn start` and it will spin up a server (pointed at http://localhost:9999) and begin compiling the typescript code
- If you get an EACCESS error at any point, instead of running command with ``sudo`` try first changing permission to following folders:
  - ``usr/local`` by running ``sudo chown -R "$(whoami)" /usr/local``
  - ``~/.npm/`` by running ``sudo chown -R "$(whoami)" ~/.npm/``
- Navigate to `http://localhost:9999/quicktests/` and choose a directory to view visual tests

## Contributing

- Write your code
- Add tests for new functionality, and please add some quicktests too
- Run `yarn test` and verify it completes with no warnings or failures
- Submit a pull request and sign the CLA when prompted by our bot
