'use strict';

/**
 * An Error object which wraps another Error instance.
 *
 * @constructor
 * @extends Error
 * @param {String} message - Error message.
 * @param {Error} innerError - The Error instance to wrap.
 */
function WrapperError(message, innerError) {
  // supports instantiating the object without the new keyword
  if (!(this instanceof WrapperError)) {
    return new WrapperError(message, innerError);
  }

  Error.call(this);
  Error.captureStackTrace(this, WrapperError);

  this.message = message;
  this.innerError = innerError;
}

WrapperError.prototype = Object.create(Error.prototype);
WrapperError.prototype.constructor = WrapperError;

var origPrepareStackTrace = Error.prototype.prepareStackTrace;

/**
 * Prepends 4 spaces to s.
 *
 * @param {String} s - The string to modify.
 * @returns {String} - The modified string.
 */
function padLeft(s) {
  return '    ' + s;
}

/**
 * Creates and returns a string representation of an error.
 *
 * @param {Error} error - The error.
 * @returns {String} - A string representation of the error.
 */
function formatError(error, stack) {
  if (origPrepareStackTrace) {
    return origPrepareStackTrace(error, stack);
  }
  return [
    error.toString(),
    stack
      .map(function (frame) {
        return 'at ' + frame.toString();
      })
      .map(padLeft)
      .join('\n')
  ].join('\n');
}

/**
 * Hooks onto the global prepareStackTrace() function in order to customize the
 * format of the WrapperError instances' stack trace.
 *
 * @param {Error} error - The error.
 * @param {CallSite[]} stack - Array of stack frames.
 */
Error.prepareStackTrace = function (error, stack) {
  var result = formatError(error, stack);

  if (error instanceof WrapperError &&
      error.innerError !== null &&
      error.innerError !== undefined) {
    result += '\n';
    if (error.innerError.stack) {
      result += error.innerError.stack.split('\n').map(padLeft).join('\n');
    } else {
      result += padLeft(error.innerError.toString());
    }
  }

  return result;
};

module.exports = WrapperError;
