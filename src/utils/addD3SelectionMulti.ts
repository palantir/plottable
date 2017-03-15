/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 *
 * @fileoverview manually add d3-selection-multi to d3 default bundle. Most of this code is
 * copied from d3-selection-multi@1.0.0.
 * See https://github.com/d3/d3-selection-multi/issues/11 for why we have to do this
 */

import * as d3 from "d3";

const d3Selection = d3;
const d3Transition = d3;

function attrsFunction(selection: any, map: any) {
  return selection.each(function() {
    const x = map.apply(this, arguments), s = d3Selection.select(this);
    for (const name in x) s.attr(name, x[name]);
  });
}

function attrsObject(selection: any, map: any) {
  for (const name in map) selection.attr(name, map[name]);
  return selection;
}

function selection_attrs(map: any) {
  return (typeof map === "function" ? attrsFunction : attrsObject)(this, map);
}

function stylesFunction(selection: any, map: any, priority: any) {
  return selection.each(function() {
    const x = map.apply(this, arguments), s = d3Selection.select(this);
    for (const name in x) s.style(name, x[name], priority);
  });
}

function stylesObject(selection: any, map: any, priority: any) {
  for (const name in map) selection.style(name, map[name], priority);
  return selection;
}

function selection_styles(map: any, priority: any) {
  return (typeof map === "function" ? stylesFunction : stylesObject)(this, map, priority == null ? "" : priority);
}

function propertiesFunction(selection: any, map: any) {
  return selection.each(function() {
    const x = map.apply(this, arguments), s = d3Selection.select(this);
    for (const name in x) s.property(name, x[name]);
  });
}

function propertiesObject(selection: any, map: any) {
  for (const name in map) selection.property(name, map[name]);
  return selection;
}

function selection_properties(map: any) {
  return (typeof map === "function" ? propertiesFunction : propertiesObject)(this, map);
}

function attrsFunction$1(transition: any, map: any) {
  return transition.each(function() {
    const x = map.apply(this, arguments), t = d3Selection.select(this).transition(transition);
    for (const name in x) t.attr(name, x[name]);
  });
}

function attrsObject$1(transition: any, map: any) {
  for (const name in map) transition.attr(name, map[name]);
  return transition;
}

function transition_attrs(map: any) {
  return (typeof map === "function" ? attrsFunction$1 : attrsObject$1)(this, map);
}

function stylesFunction$1(transition: any, map: any, priority: any) {
  return transition.each(function() {
    const x = map.apply(this, arguments), t = d3Selection.select(this).transition(transition);
    for (const name in x) t.style(name, x[name], priority);
  });
}

function stylesObject$1(transition: any, map: any, priority: any) {
  for (const name in map) transition.style(name, map[name], priority);
  return transition;
}

function transition_styles(map: any, priority: any) {
  return (typeof map === "function" ? stylesFunction$1 : stylesObject$1)(this, map, priority == null ? "" : priority);
}

d3Selection.selection.prototype.attrs = selection_attrs;
d3Selection.selection.prototype.styles = selection_styles;
d3Selection.selection.prototype.properties = selection_properties;
d3Transition.transition.prototype.attrs = transition_attrs;
d3Transition.transition.prototype.styles = transition_styles;
