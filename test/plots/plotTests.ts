///<reference path="../testReference.ts" />

class CountingPlot extends Plottable.Plot {
  public renders: number = 0;

  public render() {
    ++this.renders;
    return super.render();
  }

  protected _createDrawer(dataset: Plottable.Dataset) {
    let drawer = new Plottable.Drawer(dataset);
    (<any> drawer)._svgElement = "g";
    return drawer;
  }
}

describe("Plots", () => {
  describe("Plot", () => {

    it("adds a \"plot\" css class by default", () => {
      const plot = new Plottable.Plot();
      assert.isTrue(plot.hasClass("plot"), "plot class added by default");
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

        const svg = TestMethods.generateSVG();
        plot.anchor(svg);

        assert.strictEqual(plot.content().select(".render-area").selectAll("g").size(), datasetCount, "g for each dataset");

        svg.remove();
      });

      it("updates the scales extents when the datasets get updated", () => {
        const scale = new Plottable.Scales.Linear();

        const data = [5, -5, 10];
        const dataset = new Plottable.Dataset(data);

        plot.attr("foo", (d) => d, scale);
        plot.addDataset(dataset);

        const oldDomain = scale.domain();

        const svg = TestMethods.generateSVG();
        plot.anchor(svg);

        assert.operator(scale.domainMin(), "<=", Math.min.apply(null, data), "domainMin extended to at least minimum");
        assert.operator(scale.domainMax(), ">=", Math.max.apply(null, data), "domainMax extended to at least maximum");

        plot.removeDataset(dataset);

        assert.deepEqual(scale.domain(), oldDomain, "domain does not include dataset if removed");

        const data2 = [7, -7, 8];
        const dataset2 = new Plottable.Dataset(data2);
        plot.datasets([dataset, dataset2]);

        assert.operator(scale.domainMin(), "<=", Math.min.apply(null, data.concat(data2)), "domainMin includes new dataset");
        assert.operator(scale.domainMax(), ">=", Math.max.apply(null, data.concat(data2)), "domainMax includes new dataset");

        svg.remove();
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

        let svg = TestMethods.generateSVG();
        plot.anchor(svg);

        assert.deepEqual(categoryScale.domain(), data2.concat(data), "extent in the right order");
        svg.remove();
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

      const svg = TestMethods.generateSVG();
      plot.anchor(svg);

      plot.destroy();
      assert.deepEqual(scale.domain(), oldDomain, "destroying the plot removes its extents from the scale");
      svg.remove();
    });

    it("disconnects the data extents from the scales when destroyed", () => {
      const plot = new Plottable.Plot();
      const scale = new Plottable.Scales.Linear();
      plot.attr("attr", (d) => d, scale);

      const data = [5, -5, 10];
      const dataset = new Plottable.Dataset(data);
      plot.addDataset(dataset);

      const oldDomain = scale.domain();

      const svg = TestMethods.generateSVG();
      plot.anchor(svg);

      plot.detach();
      assert.deepEqual(scale.domain(), oldDomain, "detaching the plot removes its extents from the scale");
      svg.remove();
    });

    describe("clipPath", () => {
      it("uses the correct clipPath", () => {
        const svg = TestMethods.generateSVG();
        const plot = new Plottable.Plot();
        plot.renderTo(svg);
        TestMethods.verifyClipPath(plot);
        svg.remove();
      });

      // not supported on IE9 (http://caniuse.com/#feat=history)
      if (window.history == null || window.history.replaceState == null) {
        it("updates the clipPath reference when rendered", () => {
          const svg = TestMethods.generateSVG();
          const plot = new Plottable.Plot();
          plot.renderTo(svg);

          const originalState = window.history.state;
          const originalTitle = document.title;
          const originalLocation = document.location.href;
          window.history.replaceState(null, null, "clipPathTest");
          plot.render();

          const clipPathId = (<any> plot)._boxContainer[0][0].firstChild.id;
          const expectedPrefix = (/MSIE [5-9]/.test(navigator.userAgent) ? "" : document.location.href).replace(/#.*/g, "");
          const expectedClipPathURL = "url(" + expectedPrefix + "#" + clipPathId + ")";

          window.history.replaceState(originalState, originalTitle, originalLocation);

          const normalizeClipPath = (s: string) => s.replace(/"/g, "");
          assert.strictEqual(normalizeClipPath((<any> plot)._element.attr("clip-path")), expectedClipPathURL,
            "the clipPath reference was updated");
          svg.remove();
        });
      }
    });
  });
});
