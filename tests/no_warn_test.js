if (Meteor.isServer) {
  Tinytest.add("Counts._warn: - print warnings if noWarnings option is falsey", function (test) {
    var conmock = { warn: H.detectRegex(/test/) };

    [false, null, undefined, '', 0].forEach(function (falsey) {
      H.withConsole(conmock, function () {
        Counts._warn(falsey, 'test');
      });

      // verify the warning was sent to user
      test.isTrue(conmock.warn.found(), 'warning did not print when noWarnings option is "' + String(falsey) + '"');
    });
  });

  Tinytest.add("Counts._warn: - suppress warnings if noWarnings option is truthy", function (test) {
    var conmock = { warn: H.detectRegex(/test/) };

    [true, 1, '2', {}].forEach(function (truthy) {
      H.withConsole(conmock, function () {
        Counts._warn(truthy, 'test');
      });

      // verify the warning was suppressed
      test.isFalse(conmock.warn.found(), 'warning not suppressed when noWarnings option is "' + String(truthy) + '"');
    });
  });
}
