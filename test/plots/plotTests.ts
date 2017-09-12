import { assert } from "chai";
import * as d3 from "d3";
import * as sinon from "sinon";

import * as Plottable from "../../src";

import { CanvasDrawer } from "../../src/drawers/canvasDrawer";
import { ProxyDrawer } from "../../src/drawers/drawer";
import * as TestMethods from "../testMethods";

describe("Plots", () => {
  describe("Plot", () => {
    it("adds a \"plot\" css class by default", () => {
      const plot = new Plottable.Plot();
      assert.isTrue(plot.hasClass("plot"), "plot class added by default");
    });

    it("turns _overflowHidden on", () => {
      const plot = new Plottable.Plot();
      assert.isTrue((<any> plot)._overflowHidden, "overflowHidden is enabled");
    });

    describe("managing entities", () => {
      let plot: Plottable.Plot;
      let div: d3.Selection<HTMLDivElement, any, any, any>;

      beforeEach(() => {
        plot = new Plottable.Plot();
        div = TestMethods.generateDiv();
        plot.renderTo(div);
      });

      afterEach(() => {
        div.remove();
      });

      it("first call to entities builds a new store", () => {
        const data = [5, -5, 10];
        const dataset = new Plottable.Dataset(data);
        plot.addDataset(dataset);

        const lightweightPlotEntitySpy = sinon.spy(plot, "_buildLightweightPlotEntities");
        const entities = plot.entities();
        const entities1 = plot.entities();
        assert.deepEqual(entities, entities1);
        assert.isTrue(lightweightPlotEntitySpy.calledOnce);
      });

      it("new store is built each time entities is called with data", () => {
        const data = [5, -5, 10];
        const dataset = new Plottable.Dataset(data);
        plot.addDataset(dataset);

        const lightweightPlotEntitySpy = sinon.spy(plot, "_buildLightweightPlotEntities");
        const entities = plot.entities([dataset]);
        const entities1 = plot.entities([dataset]);
        assert.deepEqual(entities, entities1);
        assert.isTrue(lightweightPlotEntitySpy.calledTwice);
      });

      it("rebuilds the store when the datasets change", () => {
        const dataset = new Plottable.Dataset([5, -5, 10]);
        const dataset1 = new Plottable.Dataset([1, -2, 3]);

        plot.addDataset(dataset);

        const lightweightPlotEntitySpy = sinon.spy(plot, "_buildLightweightPlotEntities");
        const entities = plot.entities();
        assert.strictEqual(entities.length, 3);

        plot.datasets([dataset1]);

        const entities1 = plot.entities();
        assert.isTrue(lightweightPlotEntitySpy.calledTwice);
        assert.strictEqual(entities1.length, 3);

        plot.addDataset(dataset);
        const entities2 = plot.entities();
        assert.isTrue(lightweightPlotEntitySpy.calledThrice);
        assert.strictEqual(entities2.length, 6);

        plot.removeDataset(dataset);
        const entities3 = plot.entities();
        assert.deepEqual(entities3, entities1);
        assert.strictEqual(lightweightPlotEntitySpy.callCount, 4);
      });

      describe("adding entities", () => {
        let addAllSpy: sinon.SinonSpy;

        beforeEach(() => {
          addAllSpy = sinon.spy(Plottable.Utils.EntityStore.prototype, "addAll");
        });

        afterEach(() => {
          addAllSpy.restore();
        });

        it("supplies plot bounds from its own origin when adding entities to the store", () => {
          const dataset = new Plottable.Dataset();
          plot.addDataset(dataset);
          const width = 200;
          const height = 100;
          const originX = 50;
          const originY = 20;

          plot.setBounds(width, height, originX, originY);
          const parentSpaceBounds = plot.bounds();

          plot.entities();
          const plotLocalBounds = addAllSpy.args[0][2];

          assert.notDeepEqual(parentSpaceBounds, plotLocalBounds);
          assert.deepEqual(plotLocalBounds, {
            topLeft: {x: 0, y: 0},
            bottomRight: {x: width, y: height},
          });
        });
      });
    });

    describe("entityNearest", () => {
      let plot: Plottable.Plot;
      let div: any;

      beforeEach(() => {
        plot = new Plottable.Plot();
        div = TestMethods.generateDiv();
        plot.renderTo(div);
      });

      afterEach(() => {
        div.remove();
      });

      it("builds entityStore if entity store is undefined", () => {
        const dataset = new Plottable.Dataset([5, -5, 10]);
        plot.addDataset(dataset);
        const lightweightPlotEntitySpy = sinon.spy(plot, "_buildLightweightPlotEntities");
        plot.entityNearest({ x: 5, y: 0 });
        assert.isTrue(lightweightPlotEntitySpy.calledOnce);
      });
    });

    describe("managing datasets", () => {
      let plot: Plottable.Plot;

      beforeEach(() => {
        plot = new Plottable.Plot();
      });

      it("can add a dataset", () => {
        const dataset = new Plottable.Dataset();
        assert.strictEqual(plot.addDataset(dataset), plot, "adding a dataset returns the plot");

        assert.deepEqual(plot.datasets(), [dataset], "dataset has been added");
      });

      it("can remove a dataset", () => {
        const dataset = new Plottable.Dataset();
        plot.addDataset(dataset);
        assert.strictEqual(plot.removeDataset(dataset), plot, "removing a dataset returns the plot");
        assert.deepEqual(plot.datasets(), [], "dataset has been removed");
      });

      it("can set the datasets", () => {
        const datasetCount = 5;
        const datasets = Plottable.Utils.Math.range(0, datasetCount).map(() => new Plottable.Dataset());
        assert.strictEqual(plot.datasets(datasets), plot, "setting the datasets returns the plot");
        assert.deepEqual(plot.datasets(), datasets, "datasets have been set");
      });

      it("adds a g element for each dataset to the render area", () => {
        const datasetCount = 5;
        const datasets = Plottable.Utils.Math.range(0, datasetCount).map(() => new Plottable.Dataset());
        plot.datasets(datasets);

        const div = TestMethods.generateDiv();
        plot.anchor(div);

        assert.strictEqual(plot.content().select(".render-area").selectAll<Element, any>("g").size(), datasetCount, "g for each dataset");

        div.remove();
      });

      it("updates the scales extents when the datasets get updated", () => {
        const scale = new Plottable.Scales.Linear();

        const data = [5, -5, 10];
        const dataset = new Plottable.Dataset(data);

        plot.attr("foo", (d) => d, scale);
        plot.addDataset(dataset);

        const oldDomain = scale.domain();

        const div = TestMethods.generateDiv();
        plot.anchor(div);

        assert.operator(scale.domainMin(), "<=", Math.min.apply(null, data), "domainMin extended to at least minimum");
        assert.operator(scale.domainMax(), ">=", Math.max.apply(null, data), "domainMax extended to at least maximum");

        plot.removeDataset(dataset);

        assert.deepEqual(scale.domain(), oldDomain, "domain does not include dataset if removed");

        const data2 = [7, -7, 8];
        const dataset2 = new Plottable.Dataset(data2);
        plot.datasets([dataset, dataset2]);

        assert.operator(scale.domainMin(), "<=", Math.min.apply(null, data.concat(data2)), "domainMin includes new dataset");
        assert.operator(scale.domainMax(), ">=", Math.max.apply(null, data.concat(data2)), "domainMax includes new dataset");

        div.remove();
      });

      it("updates the scale extents in dataset order", () => {
        const categoryScale = new Plottable.Scales.Category();
        const data = ["A"];
        const dataset = new Plottable.Dataset(data);
        const data2 = ["B"];
        const dataset2 = new Plottable.Dataset(data2);

        plot.addDataset(dataset2);
        plot.addDataset(dataset);
        plot.attr("key", (d) => d, categoryScale);

        const div = TestMethods.generateDiv();
        plot.anchor(div);

        assert.deepEqual(categoryScale.domain(), data2.concat(data), "extent in the right order");
        div.remove();
      });
    });

    it("can set if the plot will animate", () => {
      const plot = new Plottable.Plot();
      assert.strictEqual(plot.animated(), false, "by default the plot is not animated");
      assert.strictEqual(plot.animated(true), plot, "toggling animation returns the plot");
      assert.strictEqual(plot.animated(), true, "can set if plot does animate");
      plot.animated(false);
      assert.strictEqual(plot.animated(), false, "can set if plot does not animate");
    });

    describe("managing animators", () => {
      let plot: Plottable.Plot;

      beforeEach(() => {
        plot = new Plottable.Plot();
      });

      it("correctly computes the total draw time", () => {
        function makeFixedTimeAnimator(totalTime: number) {
          return <Plottable.IAnimator> {
            animate: () => null,
            totalTime: () => totalTime,
          };
        }

        const animationTimes = [10, 20];
        const drawSteps = animationTimes.map((time) => {
          return {
            attrToProjector: <Plottable.AttributeToProjector> {},
            animator: makeFixedTimeAnimator(time),
          };
        });
        const totalTime = Plottable.Plot.getTotalDrawTime([], drawSteps);
        const expectedTotalTime = d3.sum(animationTimes);
        assert.strictEqual(totalTime, expectedTotalTime, "returned the total time taken by all Animators");
      });

      it("uses a null animator for the reset animator by default", () => {
        assert.isTrue(plot.animator(Plottable.Plots.Animator.RESET) instanceof Plottable.Animators.Null, "null by default");
      });

      it("uses an easing animator for the main animator by default", () => {
        assert.isTrue(plot.animator(Plottable.Plots.Animator.MAIN) instanceof Plottable.Animators.Easing, "easing by default");
      });

      it("can set the animator for a key", () => {
        const animator = new Plottable.Animators.Easing();
        const animatorKey = "foo";
        assert.strictEqual(plot.animator(animatorKey, animator), plot, "setting an animator returns the plot");
        assert.strictEqual(plot.animator(animatorKey), animator, "can set the animator for a given key");
      });
    });

    it("disconnects the data extents from the scales when destroyed", () => {
      const plot = new Plottable.Plot();
      const scale = new Plottable.Scales.Linear();
      plot.attr("attr", (d) => d, scale);

      const data = [5, -5, 10];
      const dataset = new Plottable.Dataset(data);
      plot.addDataset(dataset);

      const oldDomain = scale.domain();

      const div = TestMethods.generateDiv();
      plot.anchor(div);

      plot.destroy();
      assert.deepEqual(scale.domain(), oldDomain, "destroying the plot removes its extents from the scale");
      div.remove();
    });

    it("disconnects the data extents from the scales when detached", () => {
      const plot = new Plottable.Plot();
      const scale = new Plottable.Scales.Linear();
      plot.attr("attr", (d) => d, scale);

      const data = [5, -5, 10];
      const dataset = new Plottable.Dataset(data);
      plot.addDataset(dataset);

      const oldDomain = scale.domain();

      const div = TestMethods.generateDiv();
      plot.anchor(div);

      plot.detach();
      assert.deepEqual(scale.domain(), oldDomain, "detaching the plot removes its extents from the scale");
      div.remove();
    });

    describe("setting attributes with attr()", () => {
      let plot: Plottable.Plot;

      beforeEach(() => {
        plot = new Plottable.Plot();
      });

      it("can set the attribute to a constant value", () => {
        const constantNumber = 10;
        assert.strictEqual(plot.attr("foo", constantNumber), plot, "setting the attribute returns the calling plot");
        assert.strictEqual(plot.attr("foo").accessor(null, 0, null), constantNumber, "can set the attribute to a constant number");

        const constantString = "one";
        plot.attr("foo", constantString);
        assert.strictEqual(plot.attr("foo").accessor(null, 0, null), constantString, "can set the attribute to a constant string");
      });

      it("can set the attribute based on the input data", () => {
        const data = [1, 2, 3, 4, 5];
        const dataset = new Plottable.Dataset(data);
        plot.addDataset(dataset);

        const numberAccessor = (d: any, i: number) => d + i * 10;
        assert.strictEqual(plot.attr("foo", numberAccessor), plot, "setting the attribute returns the calling plot");

        let attrAccessor = plot.attr("foo").accessor;
        /* tslint:disable no-shadowed-variable */
        plot.datasets().forEach((dataset, datasetIndex) => {
          dataset.data().forEach((datum, index) => {
            assert.strictEqual(attrAccessor(datum, index, dataset), numberAccessor(datum, index),
              `can set attribute for number datum ${index} in dataset ${datasetIndex}`);
          });
        });
        /* tslint:enable no-shadowed-variable */

        const stringAccessor = (d: any, i: number) => `${d + i * 10} foo`;
        assert.strictEqual(plot.attr("foo", stringAccessor), plot, "setting the attribute returns the calling plot");

        attrAccessor = plot.attr("foo").accessor;
        /* tslint:disable no-shadowed-variable */
        plot.datasets().forEach((dataset, datasetIndex) => {
          dataset.data().forEach((datum, index) => {
            assert.strictEqual(attrAccessor(datum, index, dataset), stringAccessor(datum, index),
              `can set attribute for string datum ${index} in dataset ${datasetIndex}`);
          });
        });
        /* tslint:enable no-shadowed-variable */
      });

      it("passes the correct index to the Accessor", () => {
        const data = ["A", "B", "C"];
        const dataset = new Plottable.Dataset(data);
        plot.addDataset(dataset);
        const indexCheckAccessor = (datum: any, index: number) => {
          assert.strictEqual(index, data.indexOf(datum), "was passed correct index");
          return datum;
        };
        const scale = new Plottable.Scales.Category();
        plot.attr("foo", indexCheckAccessor, scale);

        const div = TestMethods.generateDiv();
        plot.anchor(div);
        div.remove();
      });

      it("can apply a scale to the returned values", () => {
        const data = [1, 2, 3, 4, 5];
        const dataset = new Plottable.Dataset(data);
        plot.addDataset(dataset);

        const numberAccessor = (d: any, i: number) => d;
        const linearScale = new Plottable.Scales.Linear();
        assert.strictEqual(plot.attr("foo", numberAccessor, linearScale), plot, "setting the attribute returns the calling plot");

        let attrAccessor = plot.attr("foo").accessor;
        let attrScale = plot.attr("foo").scale;
        /* tslint:disable no-shadowed-variable */
        plot.datasets().forEach((dataset, datasetIndex) => {
          dataset.data().forEach((datum, index) => {
            assert.strictEqual(attrScale.scale(attrAccessor(datum, index, dataset)), linearScale.scale(numberAccessor(datum, index)),
              `can set based on scaled version of number datum ${index} in dataset ${datasetIndex}`);
          });
        });
        /* tslint:enable no-shadowed-variable */

        const stringAccessor = (d: any, i: number) => `${d} foo`;
        const categoryScale = new Plottable.Scales.Category();
        categoryScale.domain(data.map(stringAccessor));
        assert.strictEqual(plot.attr("foo", stringAccessor, categoryScale), plot, "setting the attribute returns the calling plot");

        attrAccessor = plot.attr("foo").accessor;
        attrScale = plot.attr("foo").scale;
        /* tslint:disable no-shadowed-variable */
        plot.datasets().forEach((dataset, datasetIndex) => {
          dataset.data().forEach((datum, index) => {
            assert.strictEqual(attrScale.scale(attrAccessor(datum, index, dataset)), categoryScale.scale(stringAccessor(datum, index)),
              `can set based on scaled version of string datum ${index} in dataset ${datasetIndex}`);
          });
        });
        /* tslint:enable no-shadowed-variable */
      });

      it("updates the scales extents associated with an attribute when that attribute is set", () => {
        const scale = new Plottable.Scales.Linear();

        const data = [5, -5, 10];
        const dataset = new Plottable.Dataset(data);
        plot.addDataset(dataset);

        plot.attr("foo", (d) => d, scale);

        const div = TestMethods.generateDiv();
        plot.anchor(div);

        assert.operator(scale.domainMin(), "<=", Math.min.apply(null, data), "domainMin extended to at least minimum");
        assert.operator(scale.domainMax(), ">=", Math.max.apply(null, data), "domainMax extended to at least maximum");

        div.remove();
      });
    });

    describe("canvas renderer", () => {
      let plot: Plottable.Plot;

      beforeEach(() => {
        plot = new Plottable.Plot();
      });

      it("can get/set the .renderer", () => {
        assert.strictEqual(plot.renderer(), "svg", "defaults to svg");
        plot.renderer("canvas");
        assert.strictEqual(plot.renderer(), "canvas", "can change to canvas");
      });

      it("adds a canvas element to the DOM when rendered", () => {
        plot.renderer("canvas");

        const div = TestMethods.generateDiv();
        plot.renderTo(div);
        assert.isDefined(div.select("canvas").node(), "canvas is in DOM");
        div.remove();
      });

      it("removes renderArea from the DOM after anchoring", () => {
        plot.addDataset(new Plottable.Dataset([]));
        const div = TestMethods.generateDiv();
        plot.anchor(div);

        // set to canvas after anchor
        plot.renderer("canvas");
        assert.strictEqual(plot.content().select(".render-area").selectAll("g").size(), 0, "no g's in renderArea anymore");

        plot.renderer("svg");
        assert.strictEqual(plot.content().select(".render-area").selectAll("g").size(), 1, "g's come back");
        div.remove();
      });

      it("sets Drawers' canvas when renderer is set", () => {
        plot.addDataset(new Plottable.Dataset([]));
        const div = TestMethods.generateDiv();
        plot.anchor(div);

        plot.renderer("canvas");
        (<any> plot)._datasetToDrawer.forEach((drawer: ProxyDrawer) => {
          assert.isTrue(drawer.getDrawer() instanceof CanvasDrawer, "ProxyDrawer is using a CanvasDrawer");
        });

        div.remove();
      });

      it("returns null on .selections()", () => {
        plot.addDataset(new Plottable.Dataset([]));
        plot.renderer("canvas");
        const div = TestMethods.generateDiv();
        plot.renderTo(div);

        assert.isTrue(plot.selections().empty(), "no selections on canvas");
        div.remove();
      });
    });
  });
});
