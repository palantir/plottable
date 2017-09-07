import { assert } from "chai";
import * as Plottable from "../../src";

const RTree = Plottable.Utils.RTree;

// convert tuple to point
const P = ([x, y]: [number, number]) => {
  return {x, y};
};

describe("RTreeBounds", () => {
  it("creates bounds from corner points", () => {
    const b0 = RTree.RTreeBounds.pointPair(P([0, 0]), P([100, 100]));
    const b1 = RTree.RTreeBounds.pointPair(P([0, 100]), P([100, 0]));
    assert.deepEqual(b0, b1);
  });

  it("creates bounds from points array", () => {
    const points = [
      P([-100, 0]),
      P([10, 100]),
      P([20, -100]),
      P([100, 0]),
      P([-40, 30]),
    ];
    const b0 = RTree.RTreeBounds.points(points);
    const b1 = RTree.RTreeBounds.pointPair(P([-100, -100]), P([100, 100]));
    assert.deepEqual(b0, b1);
  });
});

describe("RTree", () => {
  it("inserts a couple entries",()  => {
    const rtree = new RTree.RTree(5);
    rtree.insert(RTree.RTreeBounds.pointPair(P([0, 10]), P([100, 100])), "A");
    rtree.insert(RTree.RTreeBounds.pointPair(P([0, 0]), P([200, 10])), "B");

    const b0 = RTree.RTreeBounds.pointPair(P([0, 0]), P([200, 100]));
    assert.deepEqual(b0, rtree.getRoot().bounds);
    assert.equal(2, rtree.getRoot().entries.length);
  });

  it("splits when necessary ",()  => {
    // create tree with max entries per node == 2
    const rtree = new RTree.RTree(2);
    rtree.insert(RTree.RTreeBounds.pointPair(P([0, 10]), P([100, 100])), "A");
    rtree.insert(RTree.RTreeBounds.pointPair(P([0, 0]), P([200, 10])), "B");
    assert.equal(2, rtree.getRoot().entries.length);
    assert.equal(true, rtree.getRoot().leaf);

    // add 3rd entry
    rtree.insert(RTree.RTreeBounds.pointPair(P([10, 0]), P([100, 10])), "C");
    assert.equal(2, rtree.getRoot().entries.length);
    assert.equal(false, rtree.getRoot().leaf);
  });

  it("updates bounds on removal", () => {
    const rtree = new RTree.RTree(2);
    const nodeA = rtree.insert(RTree.RTreeBounds.pointPair(P([0, 10]), P([100, 100])), "A");
    rtree.insert(RTree.RTreeBounds.pointPair(P([0, 0]), P([200, 10])), "B");
    rtree.insert(RTree.RTreeBounds.pointPair(P([10, 0]), P([100, 10])), "C");
    assert.deepEqual(RTree.RTreeBounds.pointPair(P([0, 0]), P([200, 100])), rtree.getRoot().bounds);
    assert.equal(2, rtree.getRoot().entries.length);

    nodeA.parent.remove(nodeA);
    assert.equal(2, rtree.getRoot().entries.length);
    assert.deepEqual(RTree.RTreeBounds.pointPair(P([0, 0]), P([200, 10])), rtree.getRoot().bounds);
  });

  it("locates a point", () => {
    const xy = P([100, 100]);
    const rtree = new RTree.RTree(3);
    rtree.insert(RTree.RTreeBounds.pointPair(P([90, 90]), P([110, 110])), "MATCH");
    assert.deepEqual(["MATCH"], rtree.locate(xy));
  });

  it("locates on the edge of a region", () => {
    const xy = P([100, 100]);
    let rtree = new RTree.RTree(3);
    rtree.insert(RTree.RTreeBounds.pointPair(P([100, 100]), P([110, 110])), "MATCH");
    assert.deepEqual(["MATCH"], rtree.locate(xy));

    rtree = new RTree.RTree(3);
    rtree.insert(RTree.RTreeBounds.pointPair(P([90, 90]), P([100, 100])), "MATCH");
    assert.deepEqual(["MATCH"], rtree.locate(xy));
  });

  it("builds a big tree and locates", () => {
    const xy = P([100, 100]);
    const randoms = 1000;
    const rtree = new RTree.RTree(3);

    // single matching value
    rtree.insert(RTree.RTreeBounds.pointPair(P([90, 90]), P([110, 110])), "MATCH");

    // add a bunch of bounds that WILL NOT match
    for (let i = 0; i < randoms; i++) {
      const offset = [10, 110][Math.floor(Math.random() * 2)];
      rtree.insert(RTree.RTreeBounds.pointPair(
          P([offset + Math.random() * 80, offset + Math.random() * 80]),
          P([offset + Math.random() * 80, offset + Math.random() * 80]),
        ),
        `RANDOM-${i}`,
      );
    }
    assert.deepEqual(["MATCH"], rtree.locate(xy));

    // add a bunch of bounds that WILL match
    for (let i = 0; i < randoms; i++) {
      rtree.insert(RTree.RTreeBounds.pointPair(
          P([99 - Math.random() * 100, 99 - Math.random() * 100]),
          P([101 + Math.random() * 100, 101 + Math.random() * 100]),
        ),
        `RANDOM-MATCH-${i}`,
      );
    }
    assert.equal(randoms + 1, rtree.locate(xy).length);
  });

  it("intersects an aabb", () => {
    const bounds = RTree.RTreeBounds.pointPair(P([100, 100]), P([120, 120]));
    const rtree = new RTree.RTree(3);
    rtree.insert(RTree.RTreeBounds.pointPair(P([90, 90]), P([110, 110])), "MATCH");
    assert.deepEqual(["MATCH"], rtree.intersect(bounds));
  });
});
