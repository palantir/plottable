///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Utils.Window", () => {
  describe("deprecated()", () => {

    var oldWarn: (warning: string) => void;

    before(() => {
      oldWarn = Plottable.Utils.Window.warn;
    });

    after(() => {
      Plottable.Utils.Window.warn = oldWarn;
    });

    it("deprecated()", () => {
      var warningTriggered = false;
      Plottable.Utils.Window.warn = (msg: string) => {
        warningTriggered = true;
      };

      Plottable.Utils.Window.deprecated("v0.77.2");

      assert.isTrue(warningTriggered, "the warning has been triggered");
    });

    it("deprecated() version and message", () => {
      var version = "v0.77.2";
      var message = "hadoop is doopey";

      var warningTriggered = false;
      Plottable.Utils.Window.warn = (msg: string) => {
        assert.isNotNull(msg.match(/v\d\.\d\d\.\d/), "There exists a version number " + msg);
        assert.strictEqual(msg.match(/v\d\.\d\d\.\d/)[0], version, "The version number has been correctly passed in " + msg);
        assert.isNotNull(msg.match(message)[0], "The message exists in the warning message " + msg);
        var regEx = new RegExp(message + "$");
        assert.strictEqual(msg.match(regEx)[0], message, "The message appears at the end of the warning message " + msg);
        warningTriggered = true;
      };

      Plottable.Utils.Window.deprecated(version, message);

      assert.isTrue(warningTriggered, "the warning has been triggered");
    });

    it("deprecated() calling method", () => {
      var warningTriggered = false;
      Plottable.Utils.Window.warn = (msg: string) => {
        warningTriggered = true;
        if (!TestMethods.isIE() && !window.PHANTOMJS) {
          assert.isNotNull(msg.match(/reallyOutdatedCallerMethod/), "The method name exists in the message " + msg);
        }
      };

      var reallyOutdatedCallerMethod = () => Plottable.Utils.Window.deprecated("v0.1.2");
      reallyOutdatedCallerMethod();
    });

  });
});
