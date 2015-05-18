test("module without setup/teardown (default)", function () {
  expect(1);
  ok(true);
});

test("expect in test", 3, function () {
  ok(true);
  ok(true);
  ok(true);
});
