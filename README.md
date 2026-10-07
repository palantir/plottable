<p align="right">
<a href="https://autorelease.general.dmz.palantir.tech/palantir/plottable"><img src="https://img.shields.io/badge/Perform%20an-Autorelease-success.svg" alt="Autorelease"></a>
</p>

# Plottable [![CircleCI](https://circleci.com/gh/palantir/plottable/tree/develop.svg?style=shield)](https://circleci.com/gh/palantir/plottable/tree/develop) [![Join the chat at https://gitter.im/palantir/plottable](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/palantir/plottable?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Plottable is a library of chart components for creating flexible, custom charts for websites. It is built on top of [D3.js](http://d3js.org/) and provides higher-level pieces, like plots, gridlines, and axes. As such, it's easier to quickly build charts than with D3, and the charts are much
more flexible than standard-template charts provided by charting libraries. You can think of Plottable as a "D3 for Charts" &mdash; it is not a charting library but rather a library of chart components. Check out examples of Plottable on our website's [examples page](http://plottablejs.org/examples/).

## Philosophy

Plottable's core philosophy is "Composition over Configuration", so a lot of the API flexibility is in choosing which `Components` to use, and how to arrange them in `Tables`, rather than setting high-level properties on the charts. If you find you need a feature that doesn't exist, consider writing a new `Component` that implements the functionality. This way, you can get your custom functionality and still benefit from the rest of the library.

Plottable is used and developed at [Palantir Technologies](http://palantir.com/). It's developed in [TypeScript](http://typescriptlang.org/) and distributed in ES5 JavaScript.

## Quick Start

Plottable requires D3 7 (`d3@^7.9.0`) and a browser with ES2015 support.
When loading D3 with a script tag or RequireJS, use `d3/dist/d3.min.js`.
CommonJS consumers need Node.js 22.12 or later to load D3's ES modules;
browser applications can use a bundler with ES module support.
TypeScript consumers need TypeScript 5 or later for the D3 type definitions.
The `Category20`, `Category20b`, and `Category20c` color scales retain their original palettes.

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
- Use the Node.js version in `.nvmrc`, then run `yarn install` and `yarn build`
- Run `yarn playwright install chromium` to install the browser used by `yarn test`
- Run `yarn start` and it will spin up a server (pointed at http://localhost:9999) and begin compiling the typescript code
- Navigate to `http://localhost:9999/quicktests/` and choose a directory to view visual tests

## Contributing

- Write your code
- Add tests for new functionality, and please add some quicktests too
- Run `yarn test` and verify it completes with no warnings or failures
- Submit a pull request and sign the CLA when prompted by our bot
