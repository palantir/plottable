(function (root) {
    "use strict";

    var buster = root.buster || require("buster");
    var sinon = root.sinon || require("../lib/sinon");
    var assert = buster.assert;
    var refute = buster.refute;
    var fail = buster.referee.fail;

    buster.testCase("sinon.stub", {
        "is spy": function () {
            var stub = sinon.stub.create();

            assert.isFalse(stub.called);
            assert.isFunction(stub.calledWith);
            assert.isFunction(stub.calledOn);
        },

        "should contain asynchronous versions of callsArg*, and yields* methods": function () {
            var stub = sinon.stub.create();

            var syncVersions = 0;
            var asyncVersions = 0;

            for (var method in stub) {
                if (stub.hasOwnProperty(method) && method.match(/^(callsArg|yields)/)) {
                    if (!method.match(/Async/)) {
                        syncVersions++;
                    } else if (method.match(/Async/)) {
                        asyncVersions++;
                    }
                }
            }

            assert.same(syncVersions, asyncVersions,
                "Stub prototype should contain same amount of synchronous and asynchronous methods");
        },

        "should allow overriding async behavior with sync behavior": function () {
            var stub = sinon.stub();
            var callback = sinon.spy();

            stub.callsArgAsync(1);
            stub.callsArg(1);
            stub(1, callback);

            assert(callback.called);
        },

        ".returns": {
            "returns specified value": function () {
                var stub = sinon.stub.create();
                var object = {};
                stub.returns(object);

                assert.same(stub(), object);
            },

            "returns should return stub": function () {
                var stub = sinon.stub.create();

                assert.same(stub.returns(""), stub);
            },

            "returns undefined": function () {
                var stub = sinon.stub.create();

                refute.defined(stub());
            },

            "supersedes previous throws": function () {
                var stub = sinon.stub.create();
                stub.throws().returns(1);

                refute.exception(function () {
                    stub();
                });
            }
        },

        ".returnsArg": {
            "returns argument at specified index": function () {
                var stub = sinon.stub.create();
                stub.returnsArg(0);
                var object = {};

                assert.same(stub(object), object);
            },

            "returns stub": function () {
                var stub = sinon.stub.create();

                assert.same(stub.returnsArg(0), stub);
            },

            "throws if no index is specified": function () {
                var stub = sinon.stub.create();

                assert.exception(function () {
                    stub.returnsArg();
                }, "TypeError");
            },

            "throws if index is not number": function () {
                var stub = sinon.stub.create();

                assert.exception(function () {
                    stub.returnsArg({});
                }, "TypeError");
            }
        },

        ".returnsThis": {
            "stub returns this": function () {
                var instance = {};
                instance.stub = sinon.stub.create();
                instance.stub.returnsThis();

                assert.same(instance.stub(), instance);
            },

            "stub returns undefined when detached": {
                requiresSupportFor: {
                    strictMode: (function () {
                        return this;
                    }()) === undefined
                },
                "": function () {
                    var stub = sinon.stub.create();
                    stub.returnsThis();

                    // Due to strict mode, would be `global` otherwise
                    assert.same(stub(), undefined);
                }
            },

            "stub respects call/apply": function () {
                var stub = sinon.stub.create();
                stub.returnsThis();
                var object = {};

                assert.same(stub.call(object), object);
                assert.same(stub.apply(object), object);
            },

            "returns stub": function () {
                var stub = sinon.stub.create();

                assert.same(stub.returnsThis(), stub);
            }
        },

        ".throws": {
            "throws specified exception": function () {
                var stub = sinon.stub.create();
                var error = new Error();
                stub.throws(error);

                try {
                    stub();
                    fail("Expected stub to throw");
                } catch (e) {
                    assert.same(e, error);
                }
            },

            "returns stub": function () {
                var stub = sinon.stub.create();

                assert.same(stub.throws({}), stub);
            },

            "sets type of exception to throw": function () {
                var stub = sinon.stub.create();
                var exceptionType = "TypeError";
                stub.throws(exceptionType);

                assert.exception(function () {
                    stub();
                }, exceptionType);
            },

            "specifies exception message": function () {
                var stub = sinon.stub.create();
                var message = "Oh no!";
                stub.throws("Error", message);

                try {
                    stub();
                    buster.referee.fail("Expected stub to throw");
                } catch (e) {
                    assert.equals(e.message, message);
                }
            },

            "does not specify exception message if not provided": function () {
                var stub = sinon.stub.create();
                stub.throws("Error");

                try {
                    stub();
                    buster.referee.fail("Expected stub to throw");
                } catch (e) {
                    assert.equals(e.message, "");
                }
            },

            "throws generic error": function () {
                var stub = sinon.stub.create();
                stub.throws();

                assert.exception(function () {
                    stub();
                }, "Error");
            },

            "resets 'invoking' flag": function () {
                var stub = sinon.stub.create();
                stub.throws();

                try {
                    stub();
                } catch (e) {
                    refute.defined(stub.invoking);
                }
            }
        },

        ".callsArg": {
            setUp: function () {
                this.stub = sinon.stub.create();
            },

            "calls argument at specified index": function () {
                this.stub.callsArg(2);
                var callback = sinon.stub.create();

                this.stub(1, 2, callback);

                assert(callback.called);
            },

            "returns stub": function () {
                assert.isFunction(this.stub.callsArg(2));
            },

            "throws if argument at specified index is not callable": function () {
                this.stub.callsArg(0);

                assert.exception(function () {
                    this.stub(1);
                }, "TypeError");
            },

            "throws if no index is specified": function () {
                var stub = this.stub;

                assert.exception(function () {
                    stub.callsArg();
                }, "TypeError");
            },

            "throws if index is not number": function () {
                var stub = this.stub;

                assert.exception(function () {
                    stub.callsArg({});
                }, "TypeError");
            }
        },

        ".callsArgWith": {
            setUp: function () {
                this.stub = sinon.stub.create();
            },

            "calls argument at specified index with provided args": function () {
                var object = {};
                this.stub.callsArgWith(1, object);
                var callback = sinon.stub.create();

                this.stub(1, callback);

                assert(callback.calledWith(object));
            },

            "returns function": function () {
                var stub = this.stub.callsArgWith(2, 3);

                assert.isFunction(stub);
            },

            "calls callback without args": function () {
                this.stub.callsArgWith(1);
                var callback = sinon.stub.create();

                this.stub(1, callback);

                assert(callback.calledWith());
            },

            "calls callback with multiple args": function () {
                var object = {};
                var array = [];
                this.stub.callsArgWith(1, object, array);
                var callback = sinon.stub.create();

                this.stub(1, callback);

                assert(callback.calledWith(object, array));
            },

            "throws if no index is specified": function () {
                var stub = this.stub;

                assert.exception(function () {
                    stub.callsArgWith();
                }, "TypeError");
            },

            "throws if index is not number": function () {
                var stub = this.stub;

                assert.exception(function () {
                    stub.callsArgWith({});
                }, "TypeError");
            }
        },

        ".callsArgOn": {
            setUp: function () {
                this.stub = sinon.stub.create();
                this.fakeContext = {
                    foo: "bar"
                };
            },

            "calls argument at specified index": function () {
                this.stub.callsArgOn(2, this.fakeContext);
                var callback = sinon.stub.create();

                this.stub(1, 2, callback);

                assert(callback.called);
                assert(callback.calledOn(this.fakeContext));
            },

            "returns stub": function () {
                var stub = this.stub.callsArgOn(2, this.fakeContext);

                assert.isFunction(stub);
            },

            "throws if argument at specified index is not callable": function () {
                this.stub.callsArgOn(0, this.fakeContext);

                assert.exception(function () {
                    this.stub(1);
                }, "TypeError");
            },

            "throws if no index is specified": function () {
                var stub = this.stub;

                assert.exception(function () {
                    stub.callsArgOn();
                }, "TypeError");
            },

            "throws if no context is specified": function () {
                var stub = this.stub;

                assert.exception(function () {
                    stub.callsArgOn(3);
                }, "TypeError");
            },

            "throws if index is not number": function () {
                var stub = this.stub;

                assert.exception(function () {
                    stub.callsArgOn(this.fakeContext, 2);
                }, "TypeError");
            },

            "throws if context is not an object": function () {
                var stub = this.stub;

                assert.exception(function () {
                    stub.callsArgOn(2, 2);
                }, "TypeError");
            }
        },

        ".callsArgOnWith": {
            setUp: function () {
                this.stub = sinon.stub.create();
                this.fakeContext = { foo: "bar" };
            },

            "calls argument at specified index with provided args": function () {
                var object = {};
                this.stub.callsArgOnWith(1, this.fakeContext, object);
                var callback = sinon.stub.create();

                this.stub(1, callback);

                assert(callback.calledWith(object));
                assert(callback.calledOn(this.fakeContext));
            },

            "returns function": function () {
                var stub = this.stub.callsArgOnWith(2, this.fakeContext, 3);

                assert.isFunction(stub);
            },

            "calls callback without args": function () {
                this.stub.callsArgOnWith(1, this.fakeContext);
                var callback = sinon.stub.create();

                this.stub(1, callback);

                assert(callback.calledWith());
                assert(callback.calledOn(this.fakeContext));
            },

            "calls callback with multiple args": function () {
                var object = {};
                var array = [];
                this.stub.callsArgOnWith(1, this.fakeContext, object, array);
                var callback = sinon.stub.create();

                this.stub(1, callback);

                assert(callback.calledWith(object, array));
                assert(callback.calledOn(this.fakeContext));
            },

            "throws if no index is specified": function () {
                var stub = this.stub;

                assert.exception(function () {
                    stub.callsArgOnWith();
                }, "TypeError");
            },

            "throws if no context is specified": function () {
                var stub = this.stub;

                assert.exception(function () {
                    stub.callsArgOnWith(3);
                }, "TypeError");
            },

            "throws if index is not number": function () {
                var stub = this.stub;

                assert.exception(function () {
                    stub.callsArgOnWith({});
                }, "TypeError");
            },

            "throws if context is not an object": function () {
                var stub = this.stub;

                assert.exception(function () {
                    stub.callsArgOnWith(2, 2);
                }, "TypeError");
            }
        },

        ".objectMethod": {
            setUp: function () {
                this.method = function () {};
                this.object = { method: this.method };
                this.wrapMethod = sinon.wrapMethod;
            },

            tearDown: function () {
                sinon.wrapMethod = this.wrapMethod;
            },

            "returns function from wrapMethod": function () {
                var wrapper = function () {};
                sinon.wrapMethod = function () {
                    return wrapper;
                };

                var result = sinon.stub(this.object, "method");

                assert.same(result, wrapper);
            },

            "passes object and method to wrapMethod": function () {
                var wrapper = function () {};
                var args;

                sinon.wrapMethod = function () {
                    args = arguments;
                    return wrapper;
                };

                sinon.stub(this.object, "method");

                assert.same(args[0], this.object);
                assert.same(args[1], "method");
            },

            "uses provided function as stub": function () {
                var called = false;
                var stub = sinon.stub(this.object, "method", function () {
                    called = true;
                });

                stub();

                assert(called);
            },

            "wraps provided function": function () {
                var customStub = function () {};
                var stub = sinon.stub(this.object, "method", customStub);

                refute.same(stub, customStub);
                assert.isFunction(stub.restore);
            },

            "throws if third argument is provided but not a function or proprety descriptor": function () {
                var object = this.object;

                assert.exception(function () {
                    sinon.stub(object, "method", 1);
                }, "TypeError");
            },

            "stubbed method should be proper stub": function () {
                var stub = sinon.stub(this.object, "method");

                assert.isFunction(stub.returns);
                assert.isFunction(stub.throws);
            },

            "custom stubbed method should not be proper stub": function () {
                var stub = sinon.stub(this.object, "method", function () {});

                refute.defined(stub.returns);
                refute.defined(stub.throws);
            },

            "stub should be spy": function () {
                var stub = sinon.stub(this.object, "method");
                this.object.method();

                assert(stub.called);
                assert(stub.calledOn(this.object));
            },

            "custom stubbed method should be spy": function () {
                var stub = sinon.stub(this.object, "method", function () {});
                this.object.method();

                assert(stub.called);
                assert(stub.calledOn(this.object));
            },

            "stub should affect spy": function () {
                var stub = sinon.stub(this.object, "method");
                stub.throws("TypeError");

                try {
                    this.object.method();
                }
                catch (e) {} // eslint-disable-line no-empty

                assert(stub.threw("TypeError"));
            },

            "returns standalone stub without arguments": function () {
                var stub = sinon.stub();

                assert.isFunction(stub);
                assert.isFalse(stub.called);
            },

            "throws if property is not a function": function () {
                var obj = { someProp: 42 };

                assert.exception(function () {
                    sinon.stub(obj, "someProp");
                });

                assert.equals(obj.someProp, 42);
            },

            "successfully stubs falsey properties": function () {
                var obj = { 0: function () { } };

                sinon.stub(obj, 0, function () {
                    return "stubbed value";
                });

                assert.equals(obj[0](), "stubbed value");
            },

            "does not stub function object": function () {
                assert.exception(function () {
                    sinon.stub(function () {});
                });
            }
        },

        everything: {
            "stubs all methods of object without property": function () {
                var obj = {
                    func1: function () {},
                    func2: function () {},
                    func3: function () {}
                };

                sinon.stub(obj);

                assert.isFunction(obj.func1.restore);
                assert.isFunction(obj.func2.restore);
                assert.isFunction(obj.func3.restore);
            },

            "stubs prototype methods": function () {
                function Obj() {}
                Obj.prototype.func1 = function () {};
                var obj = new Obj();

                sinon.stub(obj);

                assert.isFunction(obj.func1.restore);
            },

            "returns object": function () {
                var object = {};

                assert.same(sinon.stub(object), object);
            },

            "only stubs functions": function () {
                var object = { foo: "bar" };
                sinon.stub(object);

                assert.equals(object.foo, "bar");
            }
        },

        "stubbed function": {
            "throws if stubbing non-existent property": function () {
                var myObj = {};

                assert.exception(function () {
                    sinon.stub(myObj, "ouch");
                });

                refute.defined(myObj.ouch);
            },

            "has toString method": function () {
                var obj = { meth: function () {} };
                sinon.stub(obj, "meth");

                assert.equals(obj.meth.toString(), "meth");
            },

            "toString should say 'stub' when unable to infer name": function () {
                var stub = sinon.stub();

                assert.equals(stub.toString(), "stub");
            },

            "toString should prefer property name if possible": function () {
                var obj = {};
                obj.meth = sinon.stub();
                obj.meth();

                assert.equals(obj.meth.toString(), "meth");
            }
        },

        ".yields": {
            "invokes only argument as callback": function () {
                var stub = sinon.stub().yields();
                var spy = sinon.spy();
                stub(spy);

                assert(spy.calledOnce);
                assert.equals(spy.args[0].length, 0);
            },

            "throws understandable error if no callback is passed": function () {
                var stub = sinon.stub().yields();

                try {
                    stub();
                    throw new Error();
                } catch (e) {
                    assert.equals(e.message, "stub expected to yield, but no callback was passed.");
                }
            },

            "includes stub name and actual arguments in error": function () {
                var myObj = { somethingAwesome: function () {} };
                var stub = sinon.stub(myObj, "somethingAwesome").yields();

                try {
                    stub(23, 42);
                    throw new Error();
                } catch (e) {
                    assert.equals(e.message, "somethingAwesome expected to yield, but no callback " +
                                  "was passed. Received [23, 42]");
                }
            },

            "invokes last argument as callback": function () {
                var stub = sinon.stub().yields();
                var spy = sinon.spy();
                stub(24, {}, spy);

                assert(spy.calledOnce);
                assert.equals(spy.args[0].length, 0);
            },

            "invokes first of two callbacks": function () {
                var stub = sinon.stub().yields();
                var spy = sinon.spy();
                var spy2 = sinon.spy();
                stub(24, {}, spy, spy2);

                assert(spy.calledOnce);
                assert(!spy2.called);
            },

            "invokes callback with arguments": function () {
                var obj = { id: 42 };
                var stub = sinon.stub().yields(obj, "Crazy");
                var spy = sinon.spy();
                stub(spy);

                assert(spy.calledWith(obj, "Crazy"));
            },

            "throws if callback throws": function () {
                var obj = { id: 42 };
                var stub = sinon.stub().yields(obj, "Crazy");
                var callback = sinon.stub().throws();

                assert.exception(function () {
                    stub(callback);
                });
            },

            "plays nice with throws": function () {
                var stub = sinon.stub().throws().yields();
                var spy = sinon.spy();
                assert.exception(function () {
                    stub(spy);
                });
                assert(spy.calledOnce);
            },

            "plays nice with returns": function () {
                var obj = {};
                var stub = sinon.stub().returns(obj).yields();
                var spy = sinon.spy();
                assert.same(stub(spy), obj);
                assert(spy.calledOnce);
            },

            "plays nice with returnsArg": function () {
                var stub = sinon.stub().returnsArg(0).yields();
                var spy = sinon.spy();
                assert.same(stub(spy), spy);
                assert(spy.calledOnce);
            },

            "plays nice with returnsThis": function () {
                var obj = {};
                var stub = sinon.stub().returnsThis().yields();
                var spy = sinon.spy();
                assert.same(stub.call(obj, spy), obj);
                assert(spy.calledOnce);
            }
        },

        ".yieldsRight": {
            "invokes only argument as callback": function () {
                var stub = sinon.stub().yieldsRight();
                var spy = sinon.spy();
                stub(spy);

                assert(spy.calledOnce);
                assert.equals(spy.args[0].length, 0);
            },

            "throws understandable error if no callback is passed": function () {
                var stub = sinon.stub().yieldsRight();

                try {
                    stub();
                    throw new Error();
                } catch (e) {
                    assert.equals(e.message, "stub expected to yield, but no callback was passed.");
                }
            },

            "includes stub name and actual arguments in error": function () {
                var myObj = { somethingAwesome: function () {} };
                var stub = sinon.stub(myObj, "somethingAwesome").yieldsRight();

                try {
                    stub(23, 42);
                    throw new Error();
                } catch (e) {
                    assert.equals(e.message, "somethingAwesome expected to yield, but no callback " +
                    "was passed. Received [23, 42]");
                }
            },

            "invokes last argument as callback": function () {
                var stub = sinon.stub().yieldsRight();
                var spy = sinon.spy();
                stub(24, {}, spy);

                assert(spy.calledOnce);
                assert.equals(spy.args[0].length, 0);
            },

            "invokes the last of two callbacks": function () {
                var stub = sinon.stub().yieldsRight();
                var spy = sinon.spy();
                var spy2 = sinon.spy();
                stub(24, {}, spy, spy2);

                assert(!spy.called);
                assert(spy2.calledOnce);
            },

            "invokes callback with arguments": function () {
                var obj = { id: 42 };
                var stub = sinon.stub().yieldsRight(obj, "Crazy");
                var spy = sinon.spy();
                stub(spy);

                assert(spy.calledWith(obj, "Crazy"));
            },

            "throws if callback throws": function () {
                var obj = { id: 42 };
                var stub = sinon.stub().yieldsRight(obj, "Crazy");
                var callback = sinon.stub().throws();

                assert.exception(function () {
                    stub(callback);
                });
            },

            "plays nice with throws": function () {
                var stub = sinon.stub().throws().yieldsRight();
                var spy = sinon.spy();
                assert.exception(function () {
                    stub(spy);
                });
                assert(spy.calledOnce);
            },

            "plays nice with returns": function () {
                var obj = {};
                var stub = sinon.stub().returns(obj).yieldsRight();
                var spy = sinon.spy();
                assert.same(stub(spy), obj);
                assert(spy.calledOnce);
            },

            "plays nice with returnsArg": function () {
                var stub = sinon.stub().returnsArg(0).yieldsRight();
                var spy = sinon.spy();
                assert.same(stub(spy), spy);
                assert(spy.calledOnce);
            },

            "plays nice with returnsThis": function () {
                var obj = {};
                var stub = sinon.stub().returnsThis().yieldsRight();
                var spy = sinon.spy();
                assert.same(stub.call(obj, spy), obj);
                assert(spy.calledOnce);
            }
        },

        ".yieldsOn": {
            setUp: function () {
                this.stub = sinon.stub.create();
                this.fakeContext = { foo: "bar" };
            },

            "invokes only argument as callback": function () {
                var spy = sinon.spy();

                this.stub.yieldsOn(this.fakeContext);
                this.stub(spy);

                assert(spy.calledOnce);
                assert(spy.calledOn(this.fakeContext));
                assert.equals(spy.args[0].length, 0);
            },

            "throws if no context is specified": function () {
                assert.exception(function () {
                    this.stub.yieldsOn();
                }, "TypeError");
            },

            "throws understandable error if no callback is passed": function () {
                this.stub.yieldsOn(this.fakeContext);

                try {
                    this.stub();
                    throw new Error();
                } catch (e) {
                    assert.equals(e.message, "stub expected to yield, but no callback was passed.");
                }
            },

            "includes stub name and actual arguments in error": function () {
                var myObj = { somethingAwesome: function () {} };
                var stub = sinon.stub(myObj, "somethingAwesome").yieldsOn(this.fakeContext);

                try {
                    stub(23, 42);
                    throw new Error();
                } catch (e) {
                    assert.equals(e.message, "somethingAwesome expected to yield, but no callback " +
                                  "was passed. Received [23, 42]");
                }
            },

            "invokes last argument as callback": function () {
                var spy = sinon.spy();
                this.stub.yieldsOn(this.fakeContext);

                this.stub(24, {}, spy);

                assert(spy.calledOnce);
                assert(spy.calledOn(this.fakeContext));
                assert.equals(spy.args[0].length, 0);
            },

            "invokes first of two callbacks": function () {
                var spy = sinon.spy();
                var spy2 = sinon.spy();

                this.stub.yieldsOn(this.fakeContext);
                this.stub(24, {}, spy, spy2);

                assert(spy.calledOnce);
                assert(spy.calledOn(this.fakeContext));
                assert(!spy2.called);
            },

            "invokes callback with arguments": function () {
                var obj = { id: 42 };
                var spy = sinon.spy();

                this.stub.yieldsOn(this.fakeContext, obj, "Crazy");
                this.stub(spy);

                assert(spy.calledWith(obj, "Crazy"));
                assert(spy.calledOn(this.fakeContext));
            },

            "throws if callback throws": function () {
                var obj = { id: 42 };
                var callback = sinon.stub().throws();

                this.stub.yieldsOn(this.fakeContext, obj, "Crazy");

                assert.exception(function () {
                    this.stub(callback);
                });
            }
        },

        ".yieldsTo": {
            "yields to property of object argument": function () {
                var stub = sinon.stub().yieldsTo("success");
                var callback = sinon.spy();

                stub({ success: callback });

                assert(callback.calledOnce);
                assert.equals(callback.args[0].length, 0);
            },

            "throws understandable error if no object with callback is passed": function () {
                var stub = sinon.stub().yieldsTo("success");

                try {
                    stub();
                    throw new Error();
                } catch (e) {
                    assert.equals(e.message, "stub expected to yield to 'success', but no object " +
                                  "with such a property was passed.");
                }
            },

            "includes stub name and actual arguments in error": function () {
                var myObj = { somethingAwesome: function () {} };
                var stub = sinon.stub(myObj, "somethingAwesome").yieldsTo("success");

                try {
                    stub(23, 42);
                    throw new Error();
                } catch (e) {
                    assert.equals(e.message, "somethingAwesome expected to yield to 'success', but " +
                                  "no object with such a property was passed. " +
                                  "Received [23, 42]");
                }
            },

            "invokes property on last argument as callback": function () {
                var stub = sinon.stub().yieldsTo("success");
                var callback = sinon.spy();
                stub(24, {}, { success: callback });

                assert(callback.calledOnce);
                assert.equals(callback.args[0].length, 0);
            },

            "invokes first of two possible callbacks": function () {
                var stub = sinon.stub().yieldsTo("error");
                var callback = sinon.spy();
                var callback2 = sinon.spy();
                stub(24, {}, { error: callback }, { error: callback2 });

                assert(callback.calledOnce);
                assert(!callback2.called);
            },

            "invokes callback with arguments": function () {
                var obj = { id: 42 };
                var stub = sinon.stub().yieldsTo("success", obj, "Crazy");
                var callback = sinon.spy();
                stub({ success: callback });

                assert(callback.calledWith(obj, "Crazy"));
            },

            "throws if callback throws": function () {
                var obj = { id: 42 };
                var stub = sinon.stub().yieldsTo("error", obj, "Crazy");
                var callback = sinon.stub().throws();

                assert.exception(function () {
                    stub({ error: callback });
                });
            }
        },

        ".yieldsToOn": {
            setUp: function () {
                this.stub = sinon.stub.create();
                this.fakeContext = { foo: "bar" };
            },

            "yields to property of object argument": function () {
                this.stub.yieldsToOn("success", this.fakeContext);
                var callback = sinon.spy();

                this.stub({ success: callback });

                assert(callback.calledOnce);
                assert(callback.calledOn(this.fakeContext));
                assert.equals(callback.args[0].length, 0);
            },

            "throws if no context is specified": function () {
                assert.exception(function () {
                    this.stub.yieldsToOn("success");
                }, "TypeError");
            },

            "throws understandable error if no object with callback is passed": function () {
                this.stub.yieldsToOn("success", this.fakeContext);

                try {
                    this.stub();
                    throw new Error();
                } catch (e) {
                    assert.equals(e.message, "stub expected to yield to 'success', but no object " +
                                  "with such a property was passed.");
                }
            },

            "includes stub name and actual arguments in error": function () {
                var myObj = { somethingAwesome: function () {} };
                var stub = sinon.stub(myObj, "somethingAwesome").yieldsToOn("success", this.fakeContext);

                try {
                    stub(23, 42);
                    throw new Error();
                } catch (e) {
                    assert.equals(e.message, "somethingAwesome expected to yield to 'success', but " +
                                  "no object with such a property was passed. " +
                                  "Received [23, 42]");
                }
            },

            "invokes property on last argument as callback": function () {
                var callback = sinon.spy();

                this.stub.yieldsToOn("success", this.fakeContext);
                this.stub(24, {}, { success: callback });

                assert(callback.calledOnce);
                assert(callback.calledOn(this.fakeContext));
                assert.equals(callback.args[0].length, 0);
            },

            "invokes first of two possible callbacks": function () {
                var callback = sinon.spy();
                var callback2 = sinon.spy();

                this.stub.yieldsToOn("error", this.fakeContext);
                this.stub(24, {}, { error: callback }, { error: callback2 });

                assert(callback.calledOnce);
                assert(callback.calledOn(this.fakeContext));
                assert(!callback2.called);
            },

            "invokes callback with arguments": function () {
                var obj = { id: 42 };
                var callback = sinon.spy();

                this.stub.yieldsToOn("success", this.fakeContext, obj, "Crazy");
                this.stub({ success: callback });

                assert(callback.calledOn(this.fakeContext));
                assert(callback.calledWith(obj, "Crazy"));
            },

            "throws if callback throws": function () {
                var obj = { id: 42 };
                var callback = sinon.stub().throws();

                this.stub.yieldsToOn("error", this.fakeContext, obj, "Crazy");

                assert.exception(function () {
                    this.stub({ error: callback });
                });
            }
        },

        ".withArgs": {
            "defines withArgs method": function () {
                var stub = sinon.stub();

                assert.isFunction(stub.withArgs);
            },

            "creates filtered stub": function () {
                var stub = sinon.stub();
                var other = stub.withArgs(23);

                refute.same(other, stub);
                assert.isFunction(stub.returns);
                assert.isFunction(other.returns);
            },

            "filters return values based on arguments": function () {
                var stub = sinon.stub().returns(23);
                stub.withArgs(42).returns(99);

                assert.equals(stub(), 23);
                assert.equals(stub(42), 99);
            },

            "filters exceptions based on arguments": function () {
                var stub = sinon.stub().returns(23);
                stub.withArgs(42).throws();

                refute.exception(stub);
                assert.exception(function () {
                    stub(42);
                });
            }
        },

        ".callsArgAsync": {
            setUp: function () {
                this.stub = sinon.stub.create();
            },

            "asynchronously calls argument at specified index": function (done) {
                this.stub.callsArgAsync(2);
                var callback = sinon.spy(done);

                this.stub(1, 2, callback);

                assert(!callback.called);
            }
        },

        ".callsArgWithAsync": {
            setUp: function () {
                this.stub = sinon.stub.create();
            },

            "asynchronously calls callback at specified index with multiple args": function (done) {
                var object = {};
                var array = [];
                this.stub.callsArgWithAsync(1, object, array);

                var callback = sinon.spy(done(function () {
                    assert(callback.calledWith(object, array));
                }));

                this.stub(1, callback);

                assert(!callback.called);
            }
        },

        ".callsArgOnAsync": {
            setUp: function () {
                this.stub = sinon.stub.create();
                this.fakeContext = {
                    foo: "bar"
                };
            },

            "asynchronously calls argument at specified index with specified context": function (done) {
                var context = this.fakeContext;
                this.stub.callsArgOnAsync(2, context);

                var callback = sinon.spy(done(function () {
                    assert(callback.calledOn(context));
                }));

                this.stub(1, 2, callback);

                assert(!callback.called);
            }
        },

        ".callsArgOnWithAsync": {
            setUp: function () {
                this.stub = sinon.stub.create();
                this.fakeContext = { foo: "bar" };
            },

            "asynchronously calls argument at specified index with provided context and args": function (done) {
                var object = {};
                var context = this.fakeContext;
                this.stub.callsArgOnWithAsync(1, context, object);

                var callback = sinon.spy(done(function () {
                    assert(callback.calledOn(context));
                    assert(callback.calledWith(object));
                }));

                this.stub(1, callback);

                assert(!callback.called);
            }
        },

        ".yieldsAsync": {
            "asynchronously invokes only argument as callback": function (done) {
                var stub = sinon.stub().yieldsAsync();

                var spy = sinon.spy(done);

                stub(spy);

                assert(!spy.called);
            }
        },

        ".yieldsOnAsync": {
            setUp: function () {
                this.stub = sinon.stub.create();
                this.fakeContext = { foo: "bar" };
            },

            "asynchronously invokes only argument as callback with given context": function (done) {
                var context = this.fakeContext;
                this.stub.yieldsOnAsync(context);

                var spy = sinon.spy(done(function () {
                    assert(spy.calledOnce);
                    assert(spy.calledOn(context));
                    assert.equals(spy.args[0].length, 0);
                }));

                this.stub(spy);

                assert(!spy.called);
            }
        },

        ".yieldsToAsync": {
            "asynchronously yields to property of object argument": function (done) {
                var stub = sinon.stub().yieldsToAsync("success");

                var callback = sinon.spy(done(function () {
                    assert(callback.calledOnce);
                    assert.equals(callback.args[0].length, 0);
                }));

                stub({ success: callback });

                assert(!callback.called);
            }
        },

        ".yieldsToOnAsync": {
            setUp: function () {
                this.stub = sinon.stub.create();
                this.fakeContext = { foo: "bar" };
            },

            "asynchronously yields to property of object argument with given context": function (done) {
                var context = this.fakeContext;
                this.stub.yieldsToOnAsync("success", context);

                var callback = sinon.spy(done(function () {
                    assert(callback.calledOnce);
                    assert(callback.calledOn(context));
                    assert.equals(callback.args[0].length, 0);
                }));

                this.stub({ success: callback });
                assert(!callback.called);
            }
        },

        ".onCall": {
            "can be used with returns to produce sequence": function () {
                var stub = sinon.stub().returns(3);
                stub.onFirstCall().returns(1)
                    .onCall(2).returns(2);

                assert.same(stub(), 1);
                assert.same(stub(), 3);
                assert.same(stub(), 2);
                assert.same(stub(), 3);
            },

            "can be used with returnsArg to produce sequence": function () {
                var stub = sinon.stub().returns("default");
                stub.onSecondCall().returnsArg(0);

                assert.same(stub(1), "default");
                assert.same(stub(2), 2);
                assert.same(stub(3), "default");
            },

            "can be used with returnsThis to produce sequence": function () {
                var instance = {};
                instance.stub = sinon.stub().returns("default");
                instance.stub.onSecondCall().returnsThis();

                assert.same(instance.stub(), "default");
                assert.same(instance.stub(), instance);
                assert.same(instance.stub(), "default");
            },

            "can be used with throwsException to produce sequence": function () {
                var stub = sinon.stub();
                var error = new Error();
                stub.onSecondCall().throwsException(error);

                stub();
                try {
                    stub();
                    fail("Expected stub to throw");
                } catch (e) {
                    assert.same(e, error);
                }
            },

            "in combination with withArgs": {
                "can produce a sequence for a fake": function () {
                    var stub = sinon.stub().returns(0);
                    stub.withArgs(5).returns(-1)
                        .onFirstCall().returns(1)
                        .onSecondCall().returns(2);

                    assert.same(stub(0), 0);
                    assert.same(stub(5), 1);
                    assert.same(stub(0), 0);
                    assert.same(stub(5), 2);
                    assert.same(stub(5), -1);
                },

                "falls back to stub default behaviour if fake does not have its own default behaviour": function () {
                    var stub = sinon.stub().returns(0);
                    stub.withArgs(5)
                        .onFirstCall().returns(1);

                    assert.same(stub(5), 1);
                    assert.same(stub(5), 0);
                },

                "falls back to stub behaviour for call if fake does not have its own behaviour for call": function () {
                    var stub = sinon.stub().returns(0);
                    stub.withArgs(5).onFirstCall().returns(1);
                    stub.onSecondCall().returns(2);

                    assert.same(stub(5), 1);
                    assert.same(stub(5), 2);
                    assert.same(stub(4), 0);
                },

                "defaults to undefined behaviour once no more calls have been defined": function () {
                    var stub = sinon.stub();
                    stub.withArgs(5).onFirstCall().returns(1)
                        .onSecondCall().returns(2);

                    assert.same(stub(5), 1);
                    assert.same(stub(5), 2);
                    refute.defined(stub(5));
                },

                "does not create undefined behaviour just by calling onCall": function () {
                    var stub = sinon.stub().returns(2);
                    stub.onFirstCall();

                    assert.same(stub(6), 2);
                },

                "works with fakes and reset": function () {
                    var stub = sinon.stub();
                    stub.withArgs(5).onFirstCall().returns(1);
                    stub.withArgs(5).onSecondCall().returns(2);

                    assert.same(stub(5), 1);
                    assert.same(stub(5), 2);
                    refute.defined(stub(5));

                    stub.reset();

                    assert.same(stub(5), 1);
                    assert.same(stub(5), 2);
                    refute.defined(stub(5));
                },

                "throws an understandable error when trying to use withArgs on behavior": function () {
                    try {
                        sinon.stub().onFirstCall().withArgs(1);
                    } catch (e) {
                        assert.match(e.message, /not supported/);
                    }
                }
            },

            "can be used with yields* to produce a sequence": function () {
                var context = { foo: "bar" };
                var obj = { method1: sinon.spy(), method2: sinon.spy() };
                var obj2 = { method2: sinon.spy() };
                var stub = sinon.stub().yieldsToOn("method2", context, 7, 8);
                stub.onFirstCall().yields(1, 2)
                    .onSecondCall().yieldsOn(context, 3, 4)
                    .onThirdCall().yieldsTo("method1", 5, 6)
                    .onCall(3).yieldsToOn("method2", context, 7, 8);

                var spy1 = sinon.spy();
                var spy2 = sinon.spy();

                stub(spy1);
                stub(spy2);
                stub(obj);
                stub(obj);
                stub(obj2); // should continue with default behavior

                assert(spy1.calledOnce);
                assert(spy1.calledWithExactly(1, 2));

                assert(spy2.calledOnce);
                assert(spy2.calledAfter(spy1));
                assert(spy2.calledOn(context));
                assert(spy2.calledWithExactly(3, 4));

                assert(obj.method1.calledOnce);
                assert(obj.method1.calledAfter(spy2));
                assert(obj.method1.calledWithExactly(5, 6));

                assert(obj.method2.calledOnce);
                assert(obj.method2.calledAfter(obj.method1));
                assert(obj.method2.calledOn(context));
                assert(obj.method2.calledWithExactly(7, 8));

                assert(obj2.method2.calledOnce);
                assert(obj2.method2.calledAfter(obj.method2));
                assert(obj2.method2.calledOn(context));
                assert(obj2.method2.calledWithExactly(7, 8));
            },

            "can be used with callsArg* to produce a sequence": function () {
                var spy1 = sinon.spy();
                var spy2 = sinon.spy();
                var spy3 = sinon.spy();
                var spy4 = sinon.spy();
                var spy5 = sinon.spy();
                var decoy = sinon.spy();
                var context = { foo: "bar" };

                var stub = sinon.stub().callsArgOnWith(3, context, "c", "d");
                stub.onFirstCall().callsArg(0)
                    .onSecondCall().callsArgWith(1, "a", "b")
                    .onThirdCall().callsArgOn(2, context)
                    .onCall(3).callsArgOnWith(3, context, "c", "d");

                stub(spy1);
                stub(decoy, spy2);
                stub(decoy, decoy, spy3);
                stub(decoy, decoy, decoy, spy4);
                stub(decoy, decoy, decoy, spy5); // should continue with default behavior

                assert(spy1.calledOnce);

                assert(spy2.calledOnce);
                assert(spy2.calledAfter(spy1));
                assert(spy2.calledWithExactly("a", "b"));

                assert(spy3.calledOnce);
                assert(spy3.calledAfter(spy2));
                assert(spy3.calledOn(context));

                assert(spy4.calledOnce);
                assert(spy4.calledAfter(spy3));
                assert(spy4.calledOn(context));
                assert(spy4.calledWithExactly("c", "d"));

                assert(spy5.calledOnce);
                assert(spy5.calledAfter(spy4));
                assert(spy5.calledOn(context));
                assert(spy5.calledWithExactly("c", "d"));

                assert(decoy.notCalled);
            },

            "can be used with yields* and callsArg* in combination to produce a sequence": function () {
                var stub = sinon.stub().yields(1, 2);
                stub.onSecondCall().callsArg(1)
                    .onThirdCall().yieldsTo("method")
                    .onCall(3).callsArgWith(2, "a", "b");

                var obj = { method: sinon.spy() };
                var spy1 = sinon.spy();
                var spy2 = sinon.spy();
                var spy3 = sinon.spy();
                var decoy = sinon.spy();

                stub(spy1);
                stub(decoy, spy2);
                stub(obj);
                stub(decoy, decoy, spy3);

                assert(spy1.calledOnce);

                assert(spy2.calledOnce);
                assert(spy2.calledAfter(spy1));

                assert(obj.method.calledOnce);
                assert(obj.method.calledAfter(spy2));

                assert(spy3.calledOnce);
                assert(spy3.calledAfter(obj.method));
                assert(spy3.calledWithExactly("a", "b"));

                assert(decoy.notCalled);
            },

            "should interact correctly with assertions (GH-231)": function () {
                var stub = sinon.stub();
                var spy = sinon.spy();

                stub.callsArgWith(0, "a");

                stub(spy);
                assert(spy.calledWith("a"));

                stub(spy);
                assert(spy.calledWith("a"));

                stub.onThirdCall().callsArgWith(0, "b");

                stub(spy);
                assert(spy.calledWith("b"));
            }
        },

        "reset only resets call history": function () {
            var obj = { a: function () {} };
            var spy = sinon.spy();
            sinon.stub(obj, "a").callsArg(1);

            obj.a(null, spy);
            obj.a.reset();
            obj.a(null, spy);

            assert(spy.calledTwice);
        },

        ".resetBehavior": {
            "clears yields* and callsArg* sequence": function () {
                var stub = sinon.stub().yields(1);
                stub.onFirstCall().callsArg(1);
                stub.resetBehavior();
                stub.yields(3);
                var spyWanted = sinon.spy();
                var spyNotWanted = sinon.spy();

                stub(spyWanted, spyNotWanted);

                assert(spyNotWanted.notCalled);
                assert(spyWanted.calledOnce);
                assert(spyWanted.calledWithExactly(3));
            },

            "cleans 'returns' behavior": function () {
                var stub = sinon.stub().returns(1);

                stub.resetBehavior();

                refute.defined(stub());
            },

            "cleans behavior of fakes returned by withArgs": function () {
                var stub = sinon.stub();
                stub.withArgs("lolz").returns(2);

                stub.resetBehavior();

                refute.defined(stub("lolz"));
            },

            "does not clean parents' behavior when called on a fake returned by withArgs": function () {
                var parentStub = sinon.stub().returns(false);
                var childStub = parentStub.withArgs("lolz").returns(true);

                childStub.resetBehavior();

                assert.same(parentStub("lolz"), false);
                assert.same(parentStub(), false);
            },

            "cleans 'returnsArg' behavior": function () {
                var stub = sinon.stub().returnsArg(0);

                stub.resetBehavior();

                refute.defined(stub("defined"));
            },

            "cleans 'returnsThis' behavior": function () {
                var instance = {};
                instance.stub = sinon.stub.create();
                instance.stub.returnsThis();

                instance.stub.resetBehavior();

                refute.defined(instance.stub());
            },

            "does not touch properties that are reset by 'reset'": {
                ".calledOnce": function () {
                    var stub = sinon.stub();
                    stub(1);

                    stub.resetBehavior();

                    assert(stub.calledOnce);
                },

                "called multiple times": function () {
                    var stub = sinon.stub();
                    stub(1);
                    stub(2);
                    stub(3);

                    stub.resetBehavior();

                    assert(stub.called);
                    assert.equals(stub.args.length, 3);
                    assert.equals(stub.returnValues.length, 3);
                    assert.equals(stub.exceptions.length, 3);
                    assert.equals(stub.thisValues.length, 3);
                    assert.defined(stub.firstCall);
                    assert.defined(stub.secondCall);
                    assert.defined(stub.thirdCall);
                    assert.defined(stub.lastCall);
                },

                "call order state": function () {
                    var stubs = [sinon.stub(), sinon.stub()];
                    stubs[0]();
                    stubs[1]();

                    stubs[0].resetBehavior();

                    assert(stubs[0].calledBefore(stubs[1]));
                },

                "fakes returned by withArgs": function () {
                    var stub = sinon.stub();
                    var fakeA = stub.withArgs("a");
                    var fakeB = stub.withArgs("b");
                    stub("a");
                    stub("b");
                    stub("c");
                    var fakeC = stub.withArgs("c");

                    stub.resetBehavior();

                    assert(fakeA.calledOnce);
                    assert(fakeB.calledOnce);
                    assert(fakeC.calledOnce);
                }
            }
        },

        ".length": {
            "is zero by default": function () {
                var stub = sinon.stub();

                assert.equals(stub.length, 0);
            },

            "matches the function length": function () {
                var api = { someMethod: function (a, b, c) {} }; // eslint-disable-line no-unused-vars
                var stub = sinon.stub(api, "someMethod");

                assert.equals(stub.length, 3);
            }
        }
    });
}(this));
