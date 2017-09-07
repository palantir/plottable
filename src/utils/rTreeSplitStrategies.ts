/**
 * Copyright 2017-present Palantir Technologies
 * @license MIT
 */

import { RTreeBounds, RTreeNode } from "./rTree";

export type NodePair<T> = [RTreeNode<T>, RTreeNode<T>];

export interface IRTreeSplitStrategy {
    split: <T>(entries: RTreeNode<T>[], nodes: NodePair<T>) => void;
}

export class SplitStrategyTrival implements IRTreeSplitStrategy {
    public split<T>(entries: RTreeNode<T>[], nodes: NodePair<T>) {
        // Create simple middle split
        const mid = Math.floor(entries.length / 2);

        const leftEntries = entries.slice(0, mid);
        for (let i = 0; i < leftEntries.length; i++) {
            nodes[0].insert(leftEntries[i]);
        }

        const rightEntries = entries.slice(0, mid);
        for (let i = 0; i < rightEntries.length; i++) {
            nodes[1].insert(rightEntries[i]);
        }
    }
}

// Linear split method adapted from https://github.com/imbcmdth/RTree/blob/master/src/rtree.js
export class SplitStrategyLinear implements IRTreeSplitStrategy {
    public split<T>(entries: RTreeNode<T>[], nodes: NodePair<T>) {
        entries = entries.slice();
        this.chooseFirstSplit(entries, nodes);
        while (entries.length > 0) {
            this.addNext(entries, nodes);
        }
    }

    private chooseFirstSplit<T>(entries: RTreeNode<T>[], nodes: NodePair<T>) {
        let minXH = entries.length - 1;
        let minYH = entries.length - 1;
        let maxXL = 0;
        let maxYL = 0;

        for (let i = entries.length - 2; i >= 0; i--) {
            const entry = entries[i];

            if (entry.bounds.xl > entries[maxXL].bounds.xl) {
                maxXL = i;
            } else if (entry.bounds.xh < entries[minXH].bounds.xh) {
                minXH = i;
            }

            if (entry.bounds.yl > entries[maxYL].bounds.yl) {
                maxYL = i;
            } else if (entry.bounds.yh < entries[minYH].bounds.yh) {
                minYH = i;
            }
        }

        // Choose to split x or y
        const dx = Math.abs(entries[minXH].bounds.xh - entries[maxXL].bounds.xl);
        const dy = Math.abs(entries[minYH].bounds.yh - entries[maxYL].bounds.yl);
        const [ i0, i1 ] = dx > dy ? [ minXH, maxXL ] : [ minYH, maxYL ];

        // Split off nodes
        nodes[0].insert(entries.splice(Math.max(i0, i1), 1)[0]);
        nodes[1].insert(entries.splice(Math.min(i0, i1), 1)[0]);
    }

    private addNext<T>(entries: RTreeNode<T>[], nodes: NodePair<T>) {
        let index: number = null;
        let areaDiff: number = null;
        let minDiffNode: RTreeNode<T> = null;

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const areaDiffs = nodes.map(function (node) {
                return RTreeBounds.union(entry.bounds, node.bounds).area() - node.bounds.area();
            });

            const diff = Math.abs(areaDiffs[1] - areaDiffs[0]);
            if (!index || diff < areaDiff) {
                index = i;
                areaDiff = diff;
                minDiffNode = areaDiffs[1] < areaDiffs[0] ? nodes[0] : nodes[1];
            }
        }

        minDiffNode.insert(entries.splice(index, 1)[0]);
    }
}
