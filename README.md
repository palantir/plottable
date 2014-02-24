Plottable.js
============

Plottable.js is a library for easily creating flexible, interactive, and performant charts for the web. It is built on top of d3 and provides a higher level of abstraction.

Plottable consists of three main pieces:
- A grid-based layout engine which handles positioning, sizing, and alignment of components
- "Components", such as LineRenderer or Axis, which process data and can be connected to d3 Scales
- "Interactions", such as PanZoomInteraction or AreaInteraction, which easily allow for custom logic to be bound to common interaction patterns

By virtue of being higher-level than D3, it is often much easier to create charts in Plottable.js, with less of a learning curve. Many stylistic changes that would be a pain in D3 (e.g. changing font sizes) are trivially easy in Plottable.js (change the CSS and everything updates). On the other hand, if you want the full power and expressivity of D3, you can just write a new Component plugin in D3, and still get all fo the benefits of Plottable's layout engine and other components.

Plottable.js is being developed by Palantir Technologies. It's developed in Typescript, and released in Javascript. Plottable is currently in alpha and the API is not yet stable.

=========
Setup Instructions:

    npm install
    bower install
    tsd reinstall
