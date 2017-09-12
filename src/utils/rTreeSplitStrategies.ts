/**
 * Copyright 2017-present Palantir Technologies
 * @license MIT
 */

import { RTreeNode } from "./rTree";

export type NodePair<T> = [RTreeNode<T>, RTreeNode<T>];

export interface IRTreeSplitStrategy {
    split: <T>(entries: RTreeNode<T>[], nodes: NodePair<T>) => void;
}

export class SplitStrategyTrivial implements IRTreeSplitStrategy {
    public split<T>(entries: RTreeNode<T>[], nodes: NodePair<T>) {
        // Create simple middle split
        const mid = Math.ceil(entries.length / 2);

        for (let i = 0; i < mid; i++) {
            nodes[0].insert(entries[i]);
        }
        for (let i = mid; i < entries.length; i++) {
            nodes[1].insert(entries[i]);
        }
    }
}

// Linear split method adapted from https://github.com/imbcmdth/RTree/blob/master/src/rtree.js
export class SplitStrategyLinear implements IRTreeSplitStrategy {
    public split<T>(entries: RTreeNode<T>[], nodes: NodePair<T>) {
        // copy entries before we mutate it
        entries = entries.slice();

        this.chooseFirstSplit(entries, nodes);
        while (entries.length > 0) {
            this.addNext(entries, nodes);
        }
    }

    /**
     * Choose the two farthest-apart entries to begin the split.
     */
    private chooseFirstSplit<T>(entries: RTreeNode<T>[], nodes: NodePair<T>) {
        // Determine entry indices that have min/max x/y coordinates
        let minXH = 0;
        let minYH = 0;
        let maxXL = entries.length - 1;
        let maxYL = entries.length - 1;
        for (let i = 1; i < entries.length - 1; i++) {
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

        // Choose to split x or y based on greatest difference
        const dx = Math.abs(entries[minXH].bounds.xh - entries[maxXL].bounds.xl);
        const dy = Math.abs(entries[minYH].bounds.yh - entries[maxYL].bounds.yl);
        let [ i0, i1 ] = dx > dy ? [ minXH, maxXL ] : [ minYH, maxYL ];

        // if no detectable split, just use first/last entries
        if (i0 === i1) {
            i0 = 0;
            i1 = entries.length - 1;
        }

        // Split off nodes. We splice with the max index first to make sure we
        // don't change the index of the second splice call
        nodes[0].insert(entries.splice(Math.max(i0, i1), 1)[0]);
        nodes[1].insert(entries.splice(Math.min(i0, i1), 1)[0]);
    }

    /**
     * Split the next entry. Choose the entry that expands its parent node's
     * area the least.
     */
    private addNext<T>(entries: RTreeNode<T>[], nodes: NodePair<T>) {
        let index: number = null;
        let minDiff: number = null;
        let minDiffNode: RTreeNode<T> = null;

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const areaDiff0 = nodes[0].unionAreaDifference(entry.bounds);
            const areaDiff1 = nodes[1].unionAreaDifference(entry.bounds);

            if (areaDiff0 < minDiff || index == null) {
                index = i;
                minDiff = areaDiff0;
                minDiffNode = nodes[0];
            }

            if (areaDiff1 < minDiff) {
                index = i;
                minDiff = areaDiff1;
                minDiffNode = nodes[1];
            }
        }

        minDiffNode.insert(entries.splice(index, 1)[0]);
    }
}
