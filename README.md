Plottable.js[![Builds](https://api.travis-ci.org/repositories/palantir/plottable.png?branch=master)](https://travis-ci.org/palantir/plottable)
============

Plottable.js is a library for easily creating flexible, interactive, and performant charts for the web. It is built on top of D3 and provides a higher level of abstraction.

Plottable consists of three main pieces:
- A grid-based layout engine which handles positioning, sizing, and alignment of components
- "Components", such as LineRenderer or Axis, which process data and can be connected to d3 Scales
- "Interactions", such as PanZoomInteraction or AreaInteraction, which easily allow for custom logic to be bound to common interaction patterns

By virtue of being higher-level than D3, it is often much easier to create charts in Plottable.js, with less of a learning curve. Plottable's Renderers provide a convenient API for encapsulating, sharing and reusing D3 visualizations.

Plottable.js is being developed by Palantir Technologies. It's developed in Typescript, and released in Javascript. Plottable is currently in alpha and the API is not yet stable.

=========
Setup Instructions:

    npm install
    (if new to nodejs:)
    sudo npm install grunt -g
    sudo npm install grunt-cli -g

=========
Contributing Instructions:
- Write your code
- Add tests for new functionality
- Run `grunt test` and verify it completes with no warnings or failures
- Submit a pull request.
- You do not need to update the top-level plottable.js or plottable.d.ts files - we will update these automatically
