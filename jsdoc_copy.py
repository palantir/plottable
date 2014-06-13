#!/usr/bin/env python2

USAGE = """
usage: jsdoc_copy.py in.d.ts out.d.ts

This script copies over the jsdoc comments between overloaded functions.
For example,

  /**
   * Retrieves the current range, or sets the Scale's range to the specified values.
   */
   public range(): any[];
   public range(values: any[]): Scale;

will turn into
  /**
   * Retrieves the current range, or sets the Scale's range to the specified values.
   */
   public range(): any[];
  /**
   * Retrieves the current range, or sets the Scale's range to the specified values.
   */
   public range(values: any[]): Scale;
"""

import sys
import re

try:
  in_file = sys.argv[1]
  out_file = sys.argv[2]
  lines = open(in_file, "r").readlines()
except:
  print USAGE
  raise

outlines = []
in_jsdoc = False
jsdoc_lines = []
i = 0

while i < len(lines):
  outlines.append(lines[i])
  if lines[i].strip() == "/**":
    in_jsdoc = True
  if in_jsdoc:
    jsdoc_lines.append(lines[i])
  if in_jsdoc and lines[i].strip() == "*/":
    in_jsdoc = False
    i += 1
    # definiton line, e.g. "   public foo();"
    outlines.append(lines[i])
    matches = re.findall("^.*?\(", lines[i])
    i += 1
    if matches:
      # we could have no matches if the docstring is for a class
      # e.g. "   public foo("
      name = matches[0]
      while lines[i].startswith(name):
        outlines.extend(jsdoc_lines)
        outlines.append(lines[i])
        i += 1
    jsdoc_lines = []
  else:
    i += 1

try:
  open(out_file, "w").write("".join(outlines))
except:
  print USAGE
  raise
