/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
import * as Utils from "../utils";
import { Dataset } from "../core/dataset";
import { AttributeToProjector } from "../core/interfaces";
import { IComponent } from ".";

export interface ILabeled {
    drawLabels(dataToDraw: Utils.Map<Dataset, any[]>, attrToProjector: AttributeToProjector, timeout: number): void;
}

export type LabeledComponent = IComponent<any> & ILabeled;
