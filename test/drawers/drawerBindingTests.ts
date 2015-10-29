///<reference path="../testReference.ts" />

describe("Drawers", () => {
  let a1: Plottable.Animator;
  let jr: Plottable.Drawers.JoinResult = null;
  let dr: Plottable.Drawer = null;
  let data: any[];
  let data2: any[];
  let animatefcn: any; // Plottable.Animators.AnimateJoinCallback ...when defined
  before(() => {
    // callback implementation of animator to be used by CallbackAnimator
    // note that to have
    animatefcn = (joinResult: Plottable.Drawers.JoinResult
      , attrToAppliedProjector: Plottable.AttributeToAppliedProjector
      , drawer: Plottable.Drawer) => {
      jr = joinResult;
      dr = drawer;
    };
    a1 = new MockAnimator(1000, animatefcn);
    data = [{ n: "a", v: 12 }, { n: "b", v: 16 }, { n: "c", v: 8 }];
    data2 = [{ n: "a", v: 15 }, { n: "b", v: 16 }, { n: "d", v: 8 }, { n: "e", v: 7 }, { n: "f", v: 3 }];
  });

  describe("Abstract Drawer", () => {
    let drawer: Plottable.Drawer;
    let dataset: Plottable.Dataset;
    let svg: any;
    before(() => {
      dataset = new Plottable.Dataset(data);
      drawer = createMockDrawer(dataset);
     });
    beforeEach(() => {
      svg = TestMethods.generateSVG();
      drawer.renderArea(svg);
    });
    afterEach(() => {
      svg.remove();
    });
    it("passes the JoinResult to animators", () => {
      dataset.keyFunction(Plottable.KeyFunctions.useProperty("n"));
      let ds1: Plottable.Drawers.DrawStep = { attrToProjector: {}, animator: a1 };
      let steps = [ds1];
      drawer.draw(data, steps);
      assert.isNotNull(jr, "JoinResult received by animator");
    });
    it("passes itself to animators", () => {
      dataset.keyFunction(Plottable.KeyFunctions.useProperty("n"));
      let ds1: Plottable.Drawers.DrawStep = { attrToProjector: {}, animator: a1 };
      let steps = [ds1];
      drawer.draw(data, steps);
      assert.isNotNull(dr, "Drawer received by animator");
    });
    it("supports legacy animators", () => {
      // try to simulate the javascript
      // a 'legacy' animator does not implement animateJoin
      let flag = 0;
      class Legacy {
        public animate = function(selection: any, attrs: any) {
          flag = 1;
          selection.attr(attrs);
        };
        public totalTime = function(n: any) { return 0; };
      }
      let a2: any = new Legacy();
      dataset.keyFunction(Plottable.KeyFunctions.useProperty("n"));
      let ds1: Plottable.Drawers.DrawStep = { attrToProjector: {}, animator: a2 };
      let steps = [ds1];
      drawer.draw(data, steps);
      assert.strictEqual(flag, 1, "Drawer called legacy animator");
    });
    describe("useProperty key", () => {
      it("matches elements based on the specified property name", () => {
        dataset.keyFunction(Plottable.KeyFunctions.useProperty("n"));
        let ds1: Plottable.Drawers.DrawStep = { attrToProjector: {}, animator: a1 };
        let steps = [ds1];
        drawer.draw(data, steps);
        // now change the data - we'll have 2 constant (a b), 3 in (d e f), 1 out (c)
        drawer.draw(data2, steps);
        // check the sizes
        assert.strictEqual(jr.update.size(), 2, "update selection correct size");
        assert.strictEqual(jr.enter.size(), 3, "enter selection correct size");
        assert.strictEqual(jr.exit.size(), 1, "exit selection correct size");
        assert.strictEqual(jr.merge.size(), data2.length, "update selection correct size");
      });
    });
    describe("noConstancy key", () => {
      it("destroys and recreates all elements", () => {

        dataset.keyFunction(Plottable.KeyFunctions.noConstancy);
        let ds1: Plottable.Drawers.DrawStep = { attrToProjector: {}, animator: a1 };
        let steps = [ds1];
        drawer.draw(data, steps);
        // change the data - we'll have 0 constant, 5 in, 3 out
        drawer.draw(data2, steps);
        // check the sizes
        assert.strictEqual(jr.update.size(), 0, "update selection contains no elements");
        assert.strictEqual(jr.enter.size(), data2.length, "enter selection size matches incoming data");
        assert.strictEqual(jr.exit.size(), data.length, "exit selection size matches outgoing data");
        assert.strictEqual(jr.merge.size(), data2.length, "merge selection matches incoming data");
      });
    });
    describe("useIndex key", () => {
      it("matches elements by index position", () => {
        dataset.keyFunction(Plottable.KeyFunctions.useIndex);
        let ds1: Plottable.Drawers.DrawStep = { attrToProjector: {}, animator: a1 };
        let steps = [ds1];
        drawer.draw(data, steps);
        // change the data - we'll have 3 constant and 3 in
        drawer.draw(data2, steps);
        // check the sizes
        assert.strictEqual(jr.update.size(), Math.min(data.length, data2.length), "update selection correct size");
        assert.strictEqual(jr.enter.size(), Math.max(data2.length - data.length, 0), "enter selection size matches incoming data");
        assert.strictEqual(jr.exit.size(), Math.max(data.length - data2.length, 0), "exit selection size matches outgoing data");
        assert.strictEqual(jr.merge.size(), data2.length, "merge selection matches incoming data");
        // go back again to get the other case
        drawer.draw(data, steps);
        assert.strictEqual(jr.update.size(), Math.min(data2.length, data.length), "update selection correct size");
        assert.strictEqual(jr.enter.size(), Math.max(data.length - data2.length, 0), "enter selection size matches incoming data");
        assert.strictEqual(jr.exit.size(), Math.max(data2.length - data.length, 0), "exit selection size matches outgoing data");
        assert.strictEqual(jr.merge.size(), data.length, "merge selection matches incoming data");
      });
    });
  });
  describe("Initializer", () => {
    let ini: () => Plottable.AttributeToProjector;
    let svg: any;
    let drawer: Plottable.Drawer;

    before(() => {
      let dataset = new Plottable.Dataset(data)
        .keyFunction(Plottable.KeyFunctions.noConstancy);
      drawer = createMockDrawer(dataset);
      let atp: Plottable.AttributeToProjector = {
        height: () => {
          return 20;
        },
        x: (d: any) => {
          return d.v;
        }
      };
      // initializer is a function returning AttributeToProjector
      ini = () => {
        return atp;
      };
      svg = TestMethods.generateSVG();
      // pass the initializer function to the drawer
      drawer
        .renderArea(svg)
        .initializer(ini);
      (<any> drawer)._svgElementName = "rect";

      let ds1: Plottable.Drawers.DrawStep = { attrToProjector: {}, animator: a1 };
      let steps = [ds1];
      drawer.draw(data, steps);
      // when tests begin, animator has already been called
    });
    after(() => {
      svg.remove();
    });
    it("is applied to the enter() selection", () => {
      // in the drawing target delivered to the animator, the initializer has already been applied
      assert.strictEqual((<any>jr.enter)[0][0].attributes["height"].value, "20",
        "constant attribute is correctly applied");
      assert.strictEqual((<any>jr.enter)[0][2].attributes["x"].value, data[2].v.toString(),
        "data-dependent attribute is correctly applied");
    });
    it("is available to the animator", () => {
      // in the drawing target delivered to the animator, the initializer has already been applied
      assert.strictEqual(dr.initializer(), ini, "initializer is available to animator");
    });

  });
  describe.skip("Base animator", () => {
    let ini: () => Plottable.AttributeToProjector;
    let svg: any;
    let drawer: Plottable.Drawer;

    it("can apply a transition to the each selection in the joinResult", () => {
      let enterInTransition: boolean;
      let exitInTransition: boolean;
      let updateInTransition: boolean;
      let dataset = new Plottable.Dataset(data)
        .keyFunction(Plottable.KeyFunctions.noConstancy);
      // animator will apply a tranistion to enter
      animatefcn = function (joinResult: Plottable.Drawers.JoinResult
        , attrToAppliedProjector: Plottable.AttributeToAppliedProjector
        , drawer: Plottable.Drawer): void {
        jr = joinResult;
        dr = drawer;
        joinResult.enter = this.getTransition(joinResult.enter)
          .attr(attrToAppliedProjector);
        joinResult.exit = this.getTransition(joinResult.exit);
        joinResult.update = this.getTransition(joinResult.update)
          .attr(attrToAppliedProjector);

        enterInTransition = this.isTransition(joinResult.enter);
        exitInTransition = this.isTransition(joinResult.exit);
        updateInTransition = this.isTransition(joinResult.update);

      };
      a1 = new MockAnimator(2000, animatefcn);
      drawer = createMockDrawer(dataset);
      let atp: Plottable.AttributeToProjector = {
        height: () => {
          return 20;
        },
        x: (d: any) => {
          return d.v;
        }
      };
      // initializer is a function returning AttributeToProjector
      ini = () => {
        return atp;
      };
      svg = TestMethods.generateSVG();
      // pass the initializer function to the drawer
      drawer
        .renderArea(svg)
        .initializer(ini);
      (<any> drawer)._svgElementName = "rect";

      let ds1: Plottable.Drawers.DrawStep = { attrToProjector: {}, animator: a1 };
      let steps = [ds1];
      drawer.draw(data, steps);
      assert.isTrue(enterInTransition, "enter selection can be transitioned");
      assert.isTrue(exitInTransition, "exit selection can be transitioned");
      assert.isTrue(updateInTransition, "update selection can be transitioned");
      svg.remove();
    });
  });
});
