# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Plottable is a library of composable chart *components* built on D3. It is not a charting
library: the API surface is "which `Component`s you create and how you arrange them in a
`Table`", not high-level options on a chart object. When a feature does not exist, the
idiomatic answer is a new `Component` rather than a new config flag.

Written in TypeScript, shipped as ES5. `develop` is the integration branch; PRs target it.

## Commands

The project is developed with **yarn** (`yarn.lock` is the committed lockfile — running
`npm install` rewrites it, so revert it if you do).

```bash
yarn install
yarn build            # tslint + tsc -> build/, then webpack -> plottable.js and test/tests.js
yarn start            # tsc --watch + webpack-dev-server on http://localhost:9999
yarn lint             # tslint (src + test) and eslint/jscs (Gruntfile + quicktests)
```

### Tests

```bash
grunt test            # compile, then run the suite  <- use this
yarn test             # runs the suite WITHOUT compiling first
grunt test-ci         # compile + lint + suite (what CI runs)
```

`yarn test` (`grunt test-local`) only launches PhantomJS against the **already-built**
`test/tests.js`. It will happily pass against stale code, so either use `grunt test` or run
`npx webpack` yourself before it. A typical inner loop:

```bash
npx tsc -p . && npx tslint --project tsconfig.json && npx webpack && npx grunt blanket_mocha
```

The suite is ~1200 specs and runs in about 15s. There is no CLI test filter — the runner is
a browser page (`test/coverage.html`) driven by PhantomJS. To narrow it down:

- Add `describe.only(...)` / `it.only(...)` in the spec file, rebuild, and re-run. This is
  the fastest loop (sub-second).
- Or run `yarn start` and open `http://localhost:9999/test/tests.html?grep=<pattern>` for an
  interactive run with real devtools.

Test files are `test/**/*Tests.ts`; they are picked up automatically by a webpack
`ContextReplacementPlugin` matching `/Tests.ts$/`, so a new file needs no registration.
`test/globalInitialization.ts` forces `RenderController.renderPolicy("immediate")`, which is
why tests can assert on the DOM synchronously right after a setter call. Its `after()` hook
fails the run if a test leaks a `div`, `svg`, or `style` node — always `div.remove()`.

## Architecture

### Component lifecycle

`src/components/component.ts` is the base class everything visual extends. The sequence is:

1. `anchor(selection)` → `_setup()` — creates three stacked `<svg>` layers per component:
   `background()`, `content()`, `foreground()`. Subclasses append their own elements here and
   must call `super._setup()` first.
2. `requestedSpace(w, h)` → `{minWidth, minHeight}`, plus `fixedWidth()`/`fixedHeight()`.
   This is how a parent negotiates layout.
3. `computeLayout(origin, w, h)` → calls `_sizeFromOffer()` to decide the actual size, then
   places the component inside the offered box using `xAlignment()`/`yAlignment()`.
4. `render()` enqueues with the `RenderController`; `renderImmediately()` does the drawing.
   `redraw()` re-runs layout and then renders.

Note the consequence for step 3: a component whose `_sizeFromOffer` returns the full offer
(`Group`, `Gridlines`, `GuideLineLayer`) can never be moved by `xAlignment`/`yAlignment` —
it already fills the space. If such a component needs internal placement, give it its own
accessors rather than overloading the inherited ones.

### Containers and layout

`ComponentContainer` → `Group` (every child gets the whole box, stacked) and `Table` (rows
and columns; distributes leftover space to non-fixed cells based on the `requestedSpace`
negotiation above).

### Rendering

`src/core/renderController.ts` batches work. Components call `registerToRender` /
`registerToComputeLayout` / `registerToComputeLayoutAndRender`; the queue is drained by the
current `IRenderPolicy` (`AnimationFrame` by default, also `Immediate` and `Timeout`).
`RenderController.flush()` forces it.

### Scales

`Scale` maintains a callback set; components call `scale.onUpdate(cb)` and **must** call
`scale.offUpdate(cb)` in `destroy()`, otherwise the scale keeps the component alive. See
`GuideLineLayer.destroy()` for the canonical pattern. Components that own a scale typically
also set its `range()` from `computeLayout()`.

### Plots and drawers

`Plot extends Component` and owns `Dataset`s. Each dataset gets a `ProxyDrawer`
(`src/drawers/`) that can target either the SVG `render-area` group or a canvas, so the same
plot renders both ways. Drawing is expressed as `drawSteps` (attrs + an `Animator`).

### Text

All text goes through [`typesettable`](https://github.com/palantir/typesettable):
`SvgContext` → `CacheMeasurer` → `Writer` (optionally a `Wrapper`, only if the text should
wrap). tslint **bans `Typesettable.Measurer`** — always use `CacheMeasurer`. Because it
caches, override `invalidateCache()` to call `measurer.reset()`. Typesettable cannot clear
its own output, so re-rendering means `container.selectAll("g").remove()` first — see
`Label.renderImmediately()` and `GuideLineLayer._renderLabel()`.

### Public API surface

`src/index.ts` re-exports the namespaces (`Components`, `Plots`, `Scales`, `Axes`,
`Interactions`, `Dispatchers`, `Utils`, …). `test/namespacingTests.ts` pins that shape, so
adding or renaming an export may require updating it.

## Conventions

**Getter/setter overloads.** Every public property follows this shape; the setter returns
`this` and triggers a re-render:

```ts
public padding(): number;
public padding(padding: number): this;
public padding(padding?: number): any {
  if (padding == null) { return this._padding; }
  if (!Utils.Math.isValidNumber(padding)) { throw new Error("padding must be a finite number"); }
  this._padding = padding;
  this.render();   // or this.redraw() if layout changes
  return this;
}
```

Use `== null` for the getter branch. The exception is a property where `null` is a
meaningful value to set (e.g. clearing a label) — then guard on `=== undefined` and say why
in a comment.

**Styles** live in the hand-written `plottable.css` at the repo root — it is not generated.
New component styles go there, scoped under `.plottable`.

**Build outputs are gitignored** (`plottable.js`, `plottable.js.map`, `test/tests.js`,
`build/`). Never commit them.

**tslint** enforces double quotes, semicolons, trailing commas on multiline literals,
ordered imports, and `prefer-const`. Run it before committing; CI fails on lint.

**Quicktests** (`quicktests/overlaying/tests/**/*.js`) are the visual test suite, browsable
at `http://localhost:9999/quicktests/` under `yarn start`. Each file exports
`makeData()` and `run(div, data, Plottable)` and is plain ES5-ish JS linted by eslint and
jscs (`grunt eslint jscs`) — not TypeScript. Per CONTRIBUTING guidance in the README, new
functionality should come with both unit tests and a quicktest.
