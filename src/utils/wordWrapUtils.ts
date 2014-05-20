///<reference path="../reference.ts" />

var LINE_BREAKS_BEFORE = /[{\[]/;
var LINE_BREAKS_AFTER = /[!"%),-.:;?\]}]/;
var SPACES = /^\s+$/;
module Plottable {

  /**
   * Splits up the text so that it will fit in width (or splits into a list of single characters if it is impossible
   * to fit in width). Tries to avoid breaking words on non-linebreak-or-space characters, and will only break a word if
   * the word is too big to fit within width on its own.
   */
  export function breakTextToFitWidth(text: string, width: number, measureText: (s: string) => number): string[] {
    var ret: string[] = [];
    var paragraphs = text.split("\n");
    for (var i = 0, len = paragraphs.length; i < len; i++) {
      var paragraph = paragraphs[i];
      if (paragraph !== null) {
        ret = ret.concat(breakParagraphToFitWidth(paragraph, width, measureText));
      } else {
        ret.push("");
      }
    }
    return ret;
  }

  /**
   * Determines if it is possible to fit a given text within width without breaking any of the words.
   * Simple algorithm, split the text up into tokens, and make sure that the widest token doesn't exceed
   * allowed width.
   */
  export function canWrapWithoutBreakingWords(text: string, width: number, measureText: (s: string) => number): boolean {
    var tokens = tokenize(text);
    var widths = tokens.map(measureText);
    var maxWidth = d3.max(widths);
    return maxWidth <= width;
  }

  /**
   * A paragraph is a string of text containing no newlines.
   * Given a paragraph, break it up into lines that are no
   * wider than width.  measureText is a function that takes
   * text as input, and returns the width of the text in pixels.
   */
  function breakParagraphToFitWidth(text: string, width: number, measureText: (s: string) => number): string[] {
    var lines: string[] = [];
    var tokens = tokenize(text);
    var curLine = "";
    var i = 0;
    var nextToken: string;
    while (nextToken || i < tokens.length) {
      if (typeof nextToken === "undefined" || nextToken === null) {
        nextToken = tokens[i++];
      }
      var brokenToken = breakNextTokenToFitInWidth(curLine, nextToken, width, measureText);

      var canAdd = brokenToken[0];
      var leftOver = brokenToken[1];

      if (canAdd !== null) {
        curLine += canAdd;
      }
      nextToken = leftOver;
      if (leftOver) {
        lines.push(curLine);
        curLine = "";
      }
    }
    if (curLine) {
      lines.push(curLine);
    }
    return lines;
  }

  /**
   * Breaks up the next token and so that some part of it can be
   * added to curLine and fits in the width. the return value
   * is an array with 2 elements, the part that can be added
   * and the left over part of the token
   * measureText is a function that takes text as input,
   * and returns the width of the text in pixels.
   */
  function breakNextTokenToFitInWidth(curLine: string, nextToken: string, width: number, measureText: (s: string) => number): string[] {

    if (isBlank(nextToken)) {
      return [nextToken, null];
    }
    if (measureText(curLine + nextToken) <= width) {
      return [nextToken, null];
    }
    if (!isBlank(curLine)) {
      return [null, nextToken];
    }
    var i = 0;
    while (i < nextToken.length) {
      if (measureText(curLine + nextToken[i]) <= width) {
        curLine += nextToken[i++];
      } else {
        break;
      }
    }
    if (isBlank(curLine) && i === 0) {
      i = 1;
    }
    return [nextToken.substring(0, i), nextToken.substring(i)];
  }

  /**
   * Breaks up into tokens for word wrapping
   * Each token is comprised of either:
   *  1) Only word and non line break characters
   *  2) Only spaces characters
   *  3) Line break characters such as ":" or ";" or ","
   *  (will be single character token, unless there is a repeated linebreak character)
   */
  function tokenize(text: string): string[] {
    var ret: string[] = [];
    var token = "";
    var lastChar = "";
    for (var i = 0, len = text.length; i < len; i++) {
      var curChar = text[i];
      if (token === "" || isTokenizedTogether(token[0], curChar, lastChar)) {
        token += curChar;
      } else {
        ret.push(token);
        token = curChar;
      }
      lastChar = curChar;
    }
    if (token) {
      ret.push(token);
    }
    return ret;
  }

  /**
   * Returns whether a string is blank.
   *
   * @param {string} str: The string to test for blank-ness
   * @returns {boolean} Whether the string is blank
   */
  function isBlank(text: string) {
    return text == null ? true : text.trim() === "";
  }

  /**
   * Given a token (ie a string of characters that are similar and shouldn't be broken up) and a character, determine
   * whether that character should be added to the token. Groups of characters that don't match the space or line break
   * regex are always tokenzied together. Spaces are always tokenized together. Line break characters are almost always
   * split into their own token, except that two subsequent identical line break characters are put into the same token.
   * For isTokenizedTogether(":", ",") == False but isTokenizedTogether("::") == True.
   */
  function isTokenizedTogether(text: string, nextChar: string, lastChar: string): boolean {
    if (!(text && nextChar)) {
      false;
    }
    if (SPACES.test(text) && SPACES.test(nextChar)) {
      return true;
    } else if (SPACES.test(text) || SPACES.test(nextChar)) {
      return false;
    }
    if (LINE_BREAKS_AFTER.test(lastChar) || LINE_BREAKS_BEFORE.test(nextChar)) {
      return false;
    }
    return true;
  }
}
