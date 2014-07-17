Plottable.js[![Builds](https://api.travis-ci.org/repositories/palantir/plottable.png?branch=master)](https://travis-ci.org/palantir/plottable)
============

Plottable.js is a library for easily creating flexible, interactive, and performant charts for the web. It is built on top of D3 and provides higher-level pieces, like plots, gridlines, and axes. As such, it's easier to quickly build charts

Plottable consists of three main pieces:
- A grid-based layout engine which handles positioning, sizing, and alignment of components
- "Components", such as LinePlot or Axis, which process data and can be connected to d3 Scales
- "Interactions", such as PanZoomInteraction or AreaInteraction, which easily allow for custom logic to be bound to common interaction patterns

By virtue of being higher-level than D3, it is often much easier to create charts in Plottable.js, with less of a learning curve. Plottable's Plots provide a convenient API for encapsulating, sharing and reusing D3 visualizations.

Plottable.js is being developed by Palantir Technologies. It's developed in Typescript, and released in Javascript. Plottable's API is not yet stable.

=========
Setup Instructions for Development:

    npm install
    (if new to nodejs:)
    sudo npm install grunt -g
    sudo npm install grunt-cli -g
    run `grunt` and it will spin up a server (pointed at localhost:9999) and begin compiling the typescript code
    for local experimentation, the source files are individually compiled to their own javascript files, with `plottable_multifile.js` responsible for loading them together
    when ready

=========
Contributing Instructions:
- Write your code
- Add tests for new functionality
- Run `grunt test` and verify it completes with no warnings or failures
- Commit new files, including the updated built files like `plottable.js` and `plottable.d.ts`
- Submit a pull request.
