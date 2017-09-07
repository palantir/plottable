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

const DEFAULT_NODE_SIZE = 3;
const DEFAULT_SPLIT_STRATEGY = new SplitStrategyLinear();

/**
 * R-Tree is a multidimensional spatial region tree. It stores entries that have
 * arbitrarily overlapping bounding boxes and supports efficient point and
 * bounding box queries.
 *
 * Similar in purpose to a quadtree except quadtrees can only store a single
 * point per entry.
 */
export class RTree<T> {
    private root: RTreeNode<T>;
    private size: number;

    constructor(
        private maxNodeChildren = DEFAULT_NODE_SIZE,
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
        return this.query((mbr) => mbr.contains(xy));
    }

    public intersect(bounds: RTreeBounds) {
        return this.query((mbr) => mbr.intersects(bounds));
    }

    public query(predicate: (mbr: RTreeBounds) => boolean) {
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

    public overflow(maxNodeChildren: number) {
        return this.entries.length > maxNodeChildren;
    }

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

    public subtree(bounds: RTreeBounds) {
        const minDiff = Infinity;
        let minEntry = null;

        // choose entry for which the addition least increases the entry"s area
        for (let i = 0; i < this.entries.length; i++) {
            const entry = this.entries[i];
            const diffArea = RTreeBounds.union(entry.bounds, bounds).area() - entry.bounds.area();
            if (diffArea < minDiff) {
                minEntry = entry;
            }
        }
        return minEntry;
    }

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
        return parent;
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

    // http://gamedev.stackexchange.com/questions/586/what-is-the-fastest-way-to-work-out-2d-bounding-box-intersection
    public intersects(bounds: RTreeBounds) {
        return Math.abs(this.xl - bounds.xl) * 2 < (this.width + bounds.width) &&
               Math.abs(this.yl - bounds.yl) * 2 < (this.height + bounds.height);
    }
}
