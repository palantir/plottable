/**
 * Copyright 2017-present Palantir Technologies
 * @license MIT
 */

import { Bounds, IEntityBounds, Point } from "../core/interfaces";
import {
    IRTreeSplitStrategy,
    NodePair,
    SplitStrategyLinear,
} from "./rTreeSplitStrategies";

/**
 * The maximum number of children in an r-tree node before we attempt to split.
 * This must be >= 2.
 */
const DEFAULT_MAX_NODE_CHILDREN = 5;

/**
 * There are several strategies for splitting nodes that contain overlapping
 * regions. By default we use `SplitStrategyLinear` which minimizes the change
 * in node bounding box area.
 */
const DEFAULT_SPLIT_STRATEGY: IRTreeSplitStrategy = new SplitStrategyLinear();

/**
 * The return result of predicates used with `RTree.queryNodes`.
 *
 * The `PASS_AND_OVERWRITE` value will overwrite previous results
 * when the predicate finds a more optimal result.
 */
export enum QueryPredicateResult {
    PASS,
    FAIL,
    PASS_AND_OVERWRITE,
}

/**
 * Returns the absolute distance to the nearest point on the edge of bounds or 0
 * if the point is in bounds.
 */
export type IDistanceFunction = (bounds: RTreeBounds, p: Point) => number;

/**
 * Creates a node predicate for use with `RTree.queryNodes`
 *
 * @param point - the query point
 * @param nearFn - an `IDistanceFunction` from the query point to the nearest
 * point on the node bounds
 * @param farFn - an `IDistanceFunction` from the query point to the farthest
 * point on the node bounds
 */
export function createMinimizingNodePredicate<T>(point: Point, nearFn: IDistanceFunction, farFn: IDistanceFunction) {
    let nearestLeafDistance = Infinity;
    let nearestBranchDistance = Infinity;
    let farthestBranchDistance = Infinity;
    return (node: RTreeNode<T>) => {
        const near = nearFn(node.bounds, point);
        const far = farFn(node.bounds, point);
        // assumption: node.value indicates that parent is a leaf
        if (node.value != null) {
            if (near < nearestLeafDistance) {
                nearestLeafDistance = near;
                nearestBranchDistance = near;
                farthestBranchDistance = far;
                return QueryPredicateResult.PASS_AND_OVERWRITE;
            } else if (near === nearestLeafDistance) {
                return QueryPredicateResult.PASS;
            } else {
                return QueryPredicateResult.FAIL;
            }
        } else {
            if (near > farthestBranchDistance) {
                return QueryPredicateResult.FAIL;
            } else {
                nearestBranchDistance = Math.min(near, nearestBranchDistance);
                farthestBranchDistance = Math.max(far, farthestBranchDistance);
                return QueryPredicateResult.PASS;
            }
        }
    };
}

/**
 * Create a `Array.sort` function from a query point and a distance function.
 */
export function createNodeSort<T>(point: Point, distanceFn: IDistanceFunction) {
    return (a: RTreeNode<T>, b: RTreeNode<T>) => {
        return distanceFn(b.bounds, point) - distanceFn(a.bounds, point);
    };
}

/**
 * R-Tree is a multidimensional spatial region tree. It stores entries that have
 * arbitrarily overlapping bounding boxes and supports efficient point and
 * bounding box overlap queries.
 *
 * Average search time complexity is O(log_M(N)) where M = max children per node
 * and N is number of values stored in tree.
 *
 * It is similar in purpose to a quadtree except quadtrees can only store a
 * single point per entry. Also, the space-partitioning structure of quadtrees
 * provides guarantees that any given value has no neighbors closer than its
 * node's bounds, whereas r-trees provide no such guarantees.
 */
export class RTree<T> {
    private root: RTreeNode<T>;
    private size: number;

    constructor(
        private maxNodeChildren = DEFAULT_MAX_NODE_CHILDREN,
        private splitStrategy = DEFAULT_SPLIT_STRATEGY,
    ) {
        this.root = new RTreeNode<T>(true);
        this.size = 0;
    }

    public getRoot() {
        return this.root;
    }

    public clear() {
        this.root = new RTreeNode<T>(true);
        this.size = 0;
    }

    public insert(bounds: RTreeBounds, value: T) {
        let node = this.root;

        // Choose subtree until we find a leaf
        while (!node.leaf) {
            node = node.subtree(bounds);
        }

        // Insert new value node into leaf node
        const valueNode = RTreeNode.valueNode<T>(bounds, value);
        node.insert(valueNode);
        this.size += 1;

        // While node overflows, split and walk up
        while (node.overflow(this.maxNodeChildren)) {
            node = node.split(this.splitStrategy);
            if (node.parent == null) {
                this.root = node;
            }
        }
        return valueNode;
    }

    public locate(xy: Point) {
        return this.query((b) => b.contains(xy));
    }

    /**
     * Returns an array of `T` values that are the "nearest" to the query point.
     *
     * Nearness is measured as the absolute distance from the query point to the
     * nearest edge of the node bounds. If the node bounds contains the query
     * point, the distance is 0.
     */
    public locateNearest(xy: Point) {
        const predicate = createMinimizingNodePredicate(
            xy,
            RTreeBounds.distanceSquaredToNearEdge,
            RTreeBounds.distanceSquaredToFarEdge,
        );
        const nodes = this.queryNodes(predicate);
        return nodes.map((node) => node.value);
    }

    /**
     * Returns an array of `T` values that are the "nearest" to the query point.
     *
     * Nearness is measured as the 1-dimensional absolute distance from the
     * query's x point to the nearest edge of the node bounds. If the node
     * bounds contains the query point, the distance is 0.
     *
     * The results are sorted by y-coordinate nearness.
     */
    public locateNearestX(xy: Point) {
        const predicate = createMinimizingNodePredicate(
            xy,
            RTreeBounds.absoluteDistanceToNearEdgeX,
            RTreeBounds.absoluteDistanceToFarEdgeX,
        );
        const nodes = this.queryNodes(predicate);
        nodes.sort(createNodeSort(xy, RTreeBounds.absoluteDistanceToNearEdgeY));
        return nodes.map((node) => node.value);
    }

    /**
     * Returns an array of `T` values that are the "nearest" to the query point.
     *
     * Nearness is measured as the 1-dimensional absolute distance from the
     * query's y point to the nearest edge of the node bounds. If the node
     * bounds contains the query point, the distance is 0.
     *
     * The results are sorted by x-coordinate nearness.
     */
    public locateNearestY(xy: Point) {
        const predicate = createMinimizingNodePredicate(
            xy,
            RTreeBounds.absoluteDistanceToNearEdgeY,
            RTreeBounds.absoluteDistanceToFarEdgeY,
        );
        const nodes = this.queryNodes(predicate);
        nodes.sort(createNodeSort(xy, RTreeBounds.absoluteDistanceToNearEdgeX));
        return nodes.map((node) => node.value);
    }

    public intersect(bounds: RTreeBounds) {
        return this.query((b) => RTreeBounds.isBoundsOverlapBounds(b, bounds));
    }

    public intersectX(bounds: RTreeBounds) {
        return this.query((b) => RTreeBounds.isBoundsOverlapX(b, bounds));
    }

    public intersectY(bounds: RTreeBounds) {
        return this.query((b) => RTreeBounds.isBoundsOverlapY(b, bounds));
    }

    public query(predicate: (b: RTreeBounds) => boolean) {
        const results: T[] = [];
        if (this.root.bounds != null && !predicate(this.root.bounds)) {
            return results;
        }

        const candidates = [this.root];
        while (candidates.length > 0) {
            const candidate = candidates.shift();
            for (let i = 0; i < candidate.entries.length; i++) {
                const entry = candidate.entries[i];
                if (predicate(entry.bounds)) {
                    if (candidate.leaf) {
                        results.push(entry.value);
                    } else {
                        candidates.push(entry);
                    }
                }
            }
        }
        return results;
    }

    public queryNodes(predicate: (b: RTreeNode<T>) => QueryPredicateResult) {
        let results: RTreeNode<T>[] = [];
        if (this.root.bounds != null && predicate(this.root) === QueryPredicateResult.FAIL) {
            return results;
        }

        const candidates = [this.root];
        while (candidates.length > 0) {
            const candidate = candidates.shift();
            for (let i = 0; i < candidate.entries.length; i++) {
                const entry = candidate.entries[i];
                const p = predicate(entry);
                if (p === QueryPredicateResult.PASS_AND_OVERWRITE) {
                    results = [];
                }
                if (p === QueryPredicateResult.PASS || p === QueryPredicateResult.PASS_AND_OVERWRITE) {
                    if (candidate.leaf) {
                        results.push(entry);
                    } else {
                        candidates.push(entry);
                    }
                }
            }
        }
        return results;
    }
}

export class RTreeNode<T> {
    public static valueNode<T>(bounds: RTreeBounds, value: T) {
        const node = new RTreeNode<T>(true);
        node.bounds = bounds;
        node.value = value;
        return node;
    }

    public bounds: RTreeBounds = null;
    public entries: RTreeNode<T>[] = [];
    public parent: RTreeNode<T> = null;
    public value: T = null;

    constructor(
        public leaf: boolean,
    ) {}

    /**
     * Returns `true` iff this node has more children than the `maxNodeChildren`
     * parameter.
     */
    public overflow(maxNodeChildren: number) {
        return this.entries.length > maxNodeChildren;
    }

    /**
     * Inserts a child node and updates the ancestry bounds.
     */
    public insert(node: RTreeNode<T>) {
        this.entries.push(node);
        node.parent = this;

        // Update ancestor bounds
        let ancestor: RTreeNode<T> = this;
        while (ancestor != null) {
            ancestor.bounds = RTreeBounds.unionAll([ancestor.bounds, node.bounds]);
            ancestor = ancestor.parent;
        }
        return this;
    }

    /**
     * Removes a child node and updates the ancestry bounds.
     *
     * If the node argument is not a child, do nothing.
     */
    public remove(node: RTreeNode<T>) {
        const i = this.entries.indexOf(node);
        if (i >= 0) {
            this.entries.splice(i, 1);

            // Update ancestor bounds
            let ancestor: RTreeNode<T> = this;
            while (ancestor != null) {
                ancestor.bounds = RTreeBounds.unionAll(ancestor.entries.map((e) => e.bounds));
                ancestor = ancestor.parent;
            }
        }
        return this;
    }

    /**
     * Chooses an node from then entries that minimizes the area difference that
     * adding the bounds the each entry would cause.
     */
    public subtree(bounds: RTreeBounds) {
        const minDiff = Infinity;
        let minEntry = null;

        // choose entry for which the addition least increases the entry's area
        for (let i = 0; i < this.entries.length; i++) {
            const entry = this.entries[i];
            const diffArea = entry.unionAreaDifference(bounds);
            if (diffArea < minDiff || (
                    // break ties to node with fewest children
                    diffArea === minDiff &&
                    minEntry != null &&
                    entry.entries.length < minEntry.entries.length
                )
            ) {
                minEntry = entry;
            }
        }
        return minEntry;
    }

    /**
     * Splits this node by creating two new nodes and dividing the this node's
     * children between them. This node is removed from its parent and the two
     * new nodes are added.
     *
     * If this node is the root, a new parent node is created.
     *
     * Returns the parent node.
     */
    public split(strategy: IRTreeSplitStrategy): RTreeNode<T> {
        // Remove self from parent.
        if (this.parent != null) {
            this.parent.remove(this);
        }

        // Create children from split
        const children: NodePair<T> = [
            new RTreeNode<T>(this.leaf),
            new RTreeNode<T>(this.leaf),
        ];
        strategy.split(this.entries, children);

        // Add new nodes to parent
        // If root, create new non-leaf node as parent.
        const parent = this.parent != null ? this.parent : new RTreeNode<T>(false);
        parent.insert(children[0]);
        parent.insert(children[1]);
        // Always make the parent a non-leaf after split
        parent.leaf = false;
        return parent;
    }

    /**
     * Returns the difference in area that adding an entry `bounds` to the node
     * would cause.
     */
    public unionAreaDifference(bounds: RTreeBounds) {
        return Math.abs(RTreeBounds.union(this.bounds, bounds).area() - this.bounds.area());
    }

    /**
     * Returns the depth from this node to the deepest leaf descendant.
     */
    public maxDepth(): number {
        if (this.leaf) return 1;
        return 1 + this.entries.map((e) => e.maxDepth()).reduce((a, b) => Math.max(a, b));
    }
}

export class RTreeBounds {
    public static xywh(x: number, y: number, w: number, h: number) {
        return new RTreeBounds(x, y, x + w, y + h);
    }

    public static entityBounds(bounds: IEntityBounds) {
        return new RTreeBounds(
            bounds.x,
            bounds.y,
            bounds.x + bounds.width,
            bounds.y + bounds.height,
        );
    }

    public static bounds(bounds: Bounds) {
        return RTreeBounds.pointPair(
            bounds.topLeft,
            bounds.bottomRight,
        );
    }

    public static pointPair(p0: Point, p1: Point) {
        return new RTreeBounds(
            Math.min(p0.x, p1.x),
            Math.min(p0.y, p1.y),
            Math.max(p0.x, p1.x),
            Math.max(p0.y, p1.y),
        );
    }

    public static points(points: Point[]) {
        if (points.length < 2) {
            throw new Error("need at least 2 points to create bounds");
        }
        const xs: number[] = points.map((p) => p.x);
        const ys: number[] = points.map((p) => p.y);
        return new RTreeBounds(
            xs.reduce((a, b) => Math.min(a, b)),
            ys.reduce((a, b) => Math.min(a, b)),
            xs.reduce((a, b) => Math.max(a, b)),
            ys.reduce((a, b) => Math.max(a, b)),
        );
    }

    public static union(b0: RTreeBounds, b1: RTreeBounds) {
        return new RTreeBounds(
            Math.min(b0.xl, b1.xl),
            Math.min(b0.yl, b1.yl),
            Math.max(b0.xh, b1.xh),
            Math.max(b0.yh, b1.yh),
        );
    }

    public static unionAll(bounds: RTreeBounds[]) {
        bounds = bounds.filter((b) => b != null);
        if (bounds.length === 0) {
            return null;
        }
        return bounds.reduce((b0, b1) => RTreeBounds.union(b0, b1));
    }

    /**
     * Returns true if `a` overlaps `b` in the x and y axes.
     *
     * Touching counts as overlap.
     */
    public static isBoundsOverlapBounds(a: RTreeBounds, b: RTreeBounds) {
        return RTreeBounds.isBoundsOverlapX(a, b) && RTreeBounds.isBoundsOverlapY(a, b);
    }

    /**
     * Returns true if `a` overlaps `b` in the x axis only.
     *
     * Touching counts as overlap.
     */
    public static isBoundsOverlapX(a: RTreeBounds, b: RTreeBounds) {
        return !(a.xh < b.xl) && !(a.xl > b.xh);
    }

    /**
     * Returns true if `a` overlaps `b` in the y axis only.
     *
     * Touching counts as overlap.
     */
    public static isBoundsOverlapY(a: RTreeBounds, b: RTreeBounds) {
        return !(a.yh < b.yl) && !(a.yl > b.yh);
    }

    /**
     * Returns the orthogonal absolute distance in the x-dimension from point
     * `p` to the nearest edge of `bounds`.
     *
     * If `p.x` is inside the bounds returns `0`.
     */
    public static absoluteDistanceToNearEdgeX(bounds: RTreeBounds, p: Point) {
        const half = bounds.width / 2;
        const mid = bounds.xl + half;
        return Math.max(Math.abs(p.x - mid) - half, 0);
    }

    /**
     * Returns the orthogonal absolute distance in the y-dimension from point
     * `p` to the nearest edge of `bounds`.
     *
     * If `p.y` is inside the bounds returns `0`.
     */
    public static absoluteDistanceToNearEdgeY(bounds: RTreeBounds, p: Point) {
        const half = bounds.height / 2;
        const mid = bounds.yl + half;
        return Math.max(Math.abs(p.y - mid) - half, 0);
    }

    /**
     * Returns the orthogonal absolute distance in the x-dimension from point
     * `p` to the farthest edge of `bounds`.
     *
     * If `p.x` is inside the bounds returns `0`.
     */
    public static absoluteDistanceToFarEdgeX(bounds: RTreeBounds, p: Point) {
        const near = RTreeBounds.absoluteDistanceToNearEdgeX(bounds, p);
        return near === 0 ? 0 : near + bounds.width;
    }

    /**
     * Returns the orthogonal absolute distance in the y-dimension from point
     * `p` to the farthest edge of `bounds`.
     *
     * If `p.y` is inside the bounds returns `0`.
     */
    public static absoluteDistanceToFarEdgeY(bounds: RTreeBounds, p: Point) {
        const near = RTreeBounds.absoluteDistanceToNearEdgeY(bounds, p);
        return near === 0 ? 0 : near + bounds.height;
    }

    /**
     * Returns the distance squared from `p` to the nearest edge of `bounds`. If
     * the point touches or is inside the bounds, returns `0`;
     *
     * https://gamedev.stackexchange.com/questions/44483/how-do-i-calculate-distance-between-a-point-and-an-axis-aligned-rectangle
     */
    public static distanceSquaredToNearEdge(bounds: RTreeBounds, p: Point) {
        const dx = RTreeBounds.absoluteDistanceToNearEdgeX(bounds, p);
        const dy = RTreeBounds.absoluteDistanceToNearEdgeY(bounds, p);
        return dx * dx + dy * dy;
    }

    public static distanceSquaredToFarEdge(bounds: RTreeBounds, p: Point) {
        const dx = RTreeBounds.absoluteDistanceToFarEdgeX(bounds, p);
        const dy = RTreeBounds.absoluteDistanceToFarEdgeY(bounds, p);
        return dx * dx + dy * dy;
    }

    public width: number;
    public height: number;
    private areaCached: number;

    constructor(
        public xl: number,
        public yl: number,
        public xh: number,
        public yh: number,
    ) {
        this.width = this.xh - this.xl;
        this.height = this.yh - this.yl;
    }

    public area() {
        if (this.areaCached == null) {
            this.areaCached = (this.xh - this.xl) * (this.yh - this.yl);
        }
        return this.areaCached;
    }

    public contains(xy: Point) {
        return this.xl <= xy.x && this.xh >= xy.x && this.yl <= xy.y && this.yh >= xy.y;
    }
}
