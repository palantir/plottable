(function (root) {
    "use strict";

    var buster = root.buster || require("buster");
    var sinon = root.sinon || require("../lib/sinon");
    var assert = buster.assert;
    var refute = buster.refute;
    var samsam = root.samsam || require("samsam");

    var supportsAjax = typeof XMLHttpRequest !== "undefined" || typeof ActiveXObject !== "undefined";
    var globalXHR = root.XMLHttpRequest;
    var globalAXO = root.ActiveXObject;

    if (!assert.stub) {
        require("./test-helper");
    }

    buster.referee.add("fakeServerWithClock", {
        assert: function (obj, fakeServer) {
            return samsam.deepEqual(obj, fakeServer) &&
                sinon.fakeServer.create.calledOn(sinon.fakeServerWithClock);
        },
        assertMessage: "Expected object ${0} to be a fake server with clock"
    });

    buster.testCase("sinon.sandbox", {
        "inherits collection": function () {
            assert(sinon.collection.isPrototypeOf(sinon.sandbox));
        },

        "creates sandboxes": function () {
            var sandbox = sinon.sandbox.create();

            assert.isObject(sandbox);
            assert(sinon.sandbox.isPrototypeOf(sandbox));
        },

        "exposes match": function () {
            var sandbox = sinon.sandbox.create();

            assert.same(sandbox.match, sinon.match);
        },

        ".useFakeTimers": {
            setUp: function () {
                this.sandbox = sinon.create(sinon.sandbox);
            },

            tearDown: function () {
                this.sandbox.restore();
            },

            "returns clock object": function () {
                var clock = this.sandbox.useFakeTimers();

                assert.isObject(clock);
                assert.isFunction(clock.tick);
            },

            "exposes clock property": function () {
                this.sandbox.useFakeTimers();

                assert.isObject(this.sandbox.clock);
                assert.isFunction(this.sandbox.clock.tick);
            },

            "uses restorable clock": function () {
                this.sandbox.useFakeTimers();

                assert.isFunction(this.sandbox.clock.restore);
            },

            "passes arguments to sinon.useFakeTimers": sinon.test(function () {
                var stub = this.stub(sinon, "useFakeTimers").returns({ restore: function () {} });
                this.sandbox.useFakeTimers("Date", "setTimeout");
                this.sandbox.useFakeTimers("setTimeout", "clearTimeout", "setInterval");

                assert(sinon.useFakeTimers.calledWith("Date", "setTimeout"));
                assert(sinon.useFakeTimers.calledWith("setTimeout", "clearTimeout", "setInterval"));

                stub.restore();
            }),

            "adds clock to fake collection": function () {
                this.sandbox.useFakeTimers();
                this.sandbox.restore();

                assert.same(setTimeout, sinon.timers.setTimeout);
            }
        },

        // These were not run in browsers before, as we were only testing in node
        "//fake XHR/server": {
            // Causes problems in Chrome/Firefox
            // TODO: Figure out why
            // requiresSupportFor: {
            //     "XHR/ActiveXObject": globalXHR || globalAXO
            // },
            requiresSupportFor: {
                browser: typeof window !== "undefined"
            },

            ".useFakeXMLHttpRequest": {
                setUp: function () {
                    this.sandbox = sinon.sandbox.create();
                },

                tearDown: function () {
                    this.sandbox.restore();
                },

                "calls sinon.useFakeXMLHttpRequest": function () {
                    this.stub(sinon, "useFakeXMLHttpRequest").returns({ restore: function () {} });
                    this.sandbox.useFakeXMLHttpRequest();

                    assert(sinon.useFakeXMLHttpRequest.called);
                },

                "adds fake xhr to fake collection": function () {
                    this.sandbox.useFakeXMLHttpRequest();
                    this.sandbox.restore();

                    assert.same(global.XMLHttpRequest, globalXHR);
                    assert.same(global.ActiveXObject, globalAXO);
                }
            },

            ".useFakeServer": {
                setUp: function () {
                    this.sandbox = sinon.create(sinon.sandbox);
                },

                tearDown: function () {
                    this.sandbox.restore();
                },

                "returns server": function () {
                    var server = this.sandbox.useFakeServer();

                    assert.isObject(server);
                    assert.isFunction(server.restore);
                },

                "exposes server property": function () {
                    var server = this.sandbox.useFakeServer();

                    assert.same(this.sandbox.server, server);
                },

                "creates server": function () {
                    var server = this.sandbox.useFakeServer();

                    assert(sinon.fakeServer.isPrototypeOf(server));
                },

                "creates server with cock": function () {
                    this.sandbox.serverPrototype = sinon.fakeServerWithClock;
                    var server = this.sandbox.useFakeServer();

                    assert(sinon.fakeServerWithClock.isPrototypeOf(server));
                },

                "adds server to fake collection": function () {
                    this.sandbox.useFakeServer();
                    this.sandbox.restore();

                    assert.same(global.XMLHttpRequest, globalXHR);
                    assert.same(global.ActiveXObject, globalAXO);
                }
            }
        },

        ".inject": {
            setUp: function () {
                this.obj = {};
                this.sandbox = sinon.sandbox.create();
            },

            tearDown: function () {
                this.sandbox.restore();
            },

            "injects spy, stub, mock": function () {
                this.sandbox.inject(this.obj);

                assert.isFunction(this.obj.spy);
                assert.isFunction(this.obj.stub);
                assert.isFunction(this.obj.mock);
            },

            "does not define clock, server and requests objects": function () {
                this.sandbox.inject(this.obj);

                assert.isFalse("clock" in this.obj);
                assert.isFalse("server" in this.obj);
                assert.isFalse("requests" in this.obj);
            },

            "defines clock when using fake time": function () {
                this.sandbox.useFakeTimers();
                this.sandbox.inject(this.obj);

                assert.isFunction(this.obj.spy);
                assert.isFunction(this.obj.stub);
                assert.isFunction(this.obj.mock);
                assert.isObject(this.obj.clock);
                assert.isFalse("server" in this.obj);
                assert.isFalse("requests" in this.obj);
            },

            "should return object": function () {
                var injected = this.sandbox.inject({});

                assert.isObject(injected);
                assert.isFunction(injected.spy);
            },

            "ajax options": {
                requiresSupportFor: { "ajax/browser": supportsAjax },

                "defines server and requests when using fake time": function () {
                    this.sandbox.useFakeServer();
                    this.sandbox.inject(this.obj);

                    assert.isFunction(this.obj.spy);
                    assert.isFunction(this.obj.stub);
                    assert.isFunction(this.obj.mock);
                    assert.isFalse("clock" in this.obj);
                    assert.isObject(this.obj.server);
                    assert.equals(this.obj.requests, []);
                },

                "should define all possible fakes": function () {
                    this.sandbox.useFakeServer();
                    this.sandbox.useFakeTimers();
                    this.sandbox.inject(this.obj);

                    var spy = sinon.spy();
                    setTimeout(spy, 10);

                    this.sandbox.clock.tick(10);

                    var xhr = window.XMLHttpRequest ?
                                new XMLHttpRequest() :
                                new ActiveXObject("Microsoft.XMLHTTP"); //eslint-disable-line no-undef

                    assert.isFunction(this.obj.spy);
                    assert.isFunction(this.obj.stub);
                    assert.isFunction(this.obj.mock);
                    assert(spy.called);
                    assert.isObject(this.obj.server);
                    assert.equals(this.obj.requests, [xhr]);
                }
            }
        },

        "configurable sandbox": {
            setUp: function () {
                this.requests = [];
                this.fakeServer = { requests: this.requests };
                this.clock = {};

                sinon.stub(sinon, "useFakeTimers").returns(this.clock);

                if (sinon.fakeServer) {
                    sinon.stub(sinon.fakeServer, "create").returns(this.fakeServer);
                }
            },

            tearDown: function () {
                sinon.useFakeTimers.restore();
                if (sinon.fakeServer) {
                    sinon.fakeServer.create.restore();
                }
            },

            "yields stub, mock as arguments": function () {
                var sandbox = sinon.sandbox.create(sinon.getConfig({
                    injectIntoThis: false,
                    properties: ["stub", "mock"]
                }));

                assert.equals(sandbox.args.length, 2);
                assert.stub(sandbox.args[0]());
                assert.mock(sandbox.args[1]({}));

                sandbox.restore();
            },

            "yields spy, stub, mock as arguments": function () {
                var sandbox = sinon.sandbox.create(sinon.getConfig({
                    injectIntoThis: false,
                    properties: ["spy", "stub", "mock"]
                }));

                assert.spy(sandbox.args[0]());
                assert.stub(sandbox.args[1]());
                assert.mock(sandbox.args[2]({}));

                sandbox.restore();
            },

            "does not yield server when not faking xhr": function () {
                var sandbox = sinon.sandbox.create(sinon.getConfig({
                    injectIntoThis: false,
                    properties: ["server", "stub", "mock"],
                    useFakeServer: false
                }));

                assert.equals(sandbox.args.length, 2);
                assert.stub(sandbox.args[0]());
                assert.mock(sandbox.args[1]({}));

                sandbox.restore();
            },

            "does not inject properties if they are already present": function () {
                var server = function () {};
                var clock = {};
                var spy = false;
                var object = { server: server, clock: clock, spy: spy};
                var sandbox = sinon.sandbox.create(sinon.getConfig({
                        properties: ["server", "clock", "spy"],
                        injectInto: object
                    }));

                assert.same(object.server, server);
                assert.same(object.clock, clock);
                assert.same(object.spy, spy);

                sandbox.restore();
            },

            "ajax options": {
                requiresSupportFor: { "ajax/browser": supportsAjax },

                "yields server when faking xhr": function () {
                    var sandbox = sinon.sandbox.create(sinon.getConfig({
                        injectIntoThis: false,
                        properties: ["server", "stub", "mock"]
                    }));

                    assert.equals(sandbox.args.length, 3);
                    assert.equals(sandbox.args[0], this.fakeServer);
                    assert.stub(sandbox.args[1]());
                    assert.mock(sandbox.args[2]({}));

                    sandbox.restore();
                },

                "uses serverWithClock when faking xhr": function () {
                    var sandbox = sinon.sandbox.create(sinon.getConfig({
                        injectIntoThis: false,
                        properties: ["server"],
                        useFakeServer: sinon.fakeServerWithClock
                    }));

                    assert.fakeServerWithClock(sandbox.args[0], this.fakeServer);

                    sandbox.restore();
                },

                "yields clock when faking timers": function () {
                    var sandbox = sinon.sandbox.create(sinon.getConfig({
                        injectIntoThis: false,
                        properties: ["server", "clock"]
                    }));

                    assert.same(sandbox.args[0], this.fakeServer);
                    assert.same(sandbox.args[1], this.clock);

                    sandbox.restore();
                },

                "injects properties into object": function () {
                    var object = {};

                    var sandbox = sinon.sandbox.create(sinon.getConfig({
                        properties: ["server", "clock"],
                        injectInto: object
                    }));

                    assert.equals(sandbox.args.length, 0);
                    assert.equals(object.server, this.fakeServer);
                    assert.equals(object.clock, this.clock);
                    refute.defined(object.spy);
                    refute.defined(object.stub);
                    refute.defined(object.mock);
                    refute.defined(object.requests);

                    sandbox.restore();
                },

                "should inject server and clock when only enabling them": function () {
                    var object = {};

                    var sandbox = sinon.sandbox.create(sinon.getConfig({
                        injectInto: object,
                        useFakeTimers: true,
                        useFakeServer: true
                    }));

                    assert.equals(sandbox.args.length, 0);
                    assert.equals(object.server, this.fakeServer);
                    assert.equals(object.clock, this.clock);
                    assert.isFunction(object.spy);
                    assert.isFunction(object.stub);
                    assert.isFunction(object.mock);
                    assert.isArray(object.requests);
                    refute.defined(object.sandbox);

                    sandbox.restore();
                }
            },

            "fakes specified timers": function () {
                var sandbox = sinon.sandbox.create(sinon.getConfig({
                    injectIntoThis: false,
                    properties: ["clock"],
                    useFakeTimers: ["Date", "setTimeout"]
                }));

                assert(sinon.useFakeTimers.calledWith("Date", "setTimeout"));

                sandbox.restore();
            },

            "injects sandbox": function () {
                var object = {};

                var sandbox = sinon.sandbox.create(sinon.getConfig({
                    properties: ["sandbox", "spy"],
                    injectInto: object
                }));

                assert.equals(sandbox.args.length, 0);
                assert.isFunction(object.spy);
                assert.isObject(object.sandbox);

                sandbox.restore();
            },

            "injects match": function () {
                var object = {};

                var sandbox = sinon.sandbox.create(sinon.getConfig({
                    properties: ["match"],
                    injectInto: object
                }));

                assert.same(object.match, sinon.match);

                sandbox.restore();
            }
        }
    });
}(this));
