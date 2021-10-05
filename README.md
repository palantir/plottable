# Plottable [![CircleCI](https://circleci.com/gh/palantir/plottable/tree/develop.svg?style=shield)](https://circleci.com/gh/palantir/plottable/tree/develop) [![Join the chat at https://gitter.im/palantir/plottable](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/palantir/plottable?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Plottable is a library of chart components for creating flexible, custom charts for websites. It is built on top of [D3.js](http://d3js.org/) and provides higher-level pieces, like plots, gridlines, and axes. As such, it's easier to quickly build charts than with D3, and the charts are much
more flexible than standard-template charts provided by charting libraries. You can think of Plottable as a "D3 for Charts" &mdash; it is not a charting library but rather a library of chart components. Check out examples of Plottable on our website's [examples page](http://plottablejs.org/examples/).

## Philosophy

Plottable's core philosophy is "Composition over Configuration", so a lot of the API flexibility is in choosing which `Components` to use, and how to arrange them in `Tables`, rather than setting high-level properties on the charts. If you find you need a feature that doesn't exist, consider writing a new `Component` that implements the functionality. This way, you can get your custom functionality and still benefit from the rest of the library.

Plottable is used and developed at [Palantir Technologies](http://palantir.com/). It's developed in [TypeScript](http://typescriptlang.org/) and distributed in ES5 JavaScript.

## Quick Start

- Get Plottable:
  - npm: `npm install --save plottable`
  - yarn: `yarn add plottable`
  - [jsdelivr](https://cdn.jsdelivr.net/npm/plottable@3/plottable.min.js)
- [Check out examples](http://plottablejs.org/examples/)
- [Read the tutorials](http://plottablejs.org/tutorials/)
- [Visit the website, plottablejs.org](http://plottablejs.org/)

## Upgrading to v1.0.0

If you are upgrading from a pre-v1.0.0 version of Plottable to v1.0.0 or later, please use the [Upgrade Guide](https://github.com/palantir/plottable/wiki/Upgrading-to-1.0.0) on the wiki.

## Upgrading to v2.0.0

Check out the full list of changes between v1.16.2 and [v2.0.0](https://github.com/palantir/plottable/wiki/2.0.0-Changes).

## Upgrading to v3.0.0

Check out the full list of changes between v2.9.0 and [v3.0.0](https://github.com/palantir/plottable/wiki/Upgrading-to-3.0.0).

## We Want To Help!

If you run into any problems using Plottable, please let us know. We want Plottable to be easy-to-use, so if you are getting confused, it is our fault, not yours. [Create an issue](https://github.com/palantir/plottable/issues) and we'll be happy to help you out, or drop by our [Gitter room](https://gitter.im/palantir/plottable).

## Development

- Clone the repo
- Install local dependencies `yarn install`
- Run `yarn build` to build the dependencies
- Run `yarn start` and it will spin up a server (pointed at http://localhost:9999) and begin compiling the typescript code
- Navigate to `http://localhost:9999/quicktests/` and choose a directory to view visual tests

## Contributing

- Write your code
- Add tests for new functionality, and please add some quicktests too
- Run `yarn test` and verify it completes with no warnings or failures
- Submit a pull request and sign the CLA when prompted by our bot
