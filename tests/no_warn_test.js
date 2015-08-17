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

  Tinytest.add("Counts._warn: - suppress warnings after Counts.noWarnings() is invoked", function (test) {
    var conmock = { warn: H.detectRegex(/test/) };

    H.withConsole(conmock, function () {
      H.withNoWarnings(function () {
        Counts._warn(false, 'test');
      });
    });

    // verify the warning was suppressed
    test.isFalse(conmock.warn.found(), 'Counts.noWarnings() did not suppress warning');
  });

  Tinytest.add("Counts._warn: - suppress warnings after Counts.noWarnings(true) is invoked", function (test) {
    var conmock = { warn: H.detectRegex(/test/) };

    H.withConsole(conmock, function () {
      Counts.noWarnings(true);
      Counts._warn(false, 'test');
    });

    // verify the warning was suppressed
    test.isFalse(conmock.warn.found(), 'Counts.noWarnings(true) did not suppress warning');
  });

  // NOTE: Counts.noWarnings(false) cannot override { noWarnings: true }.
  Tinytest.add("Counts._warn: - print warnings after Counts.noWarnings(false) is invoked", function (test) {
    var conmock = { warn: H.detectRegex(/test/) };

    H.withConsole(conmock, function () {
      H.withNoWarnings(function () {
        Counts.noWarnings(false);
        Counts._warn(false, 'test');
      });
    });

    // verify the warning was sent to user
    test.isTrue(conmock.warn.found(), 'warning did not print after Count.noWarnings(false)');
  });

  Tinytest.add("Counts._warn: - suppress warnings in production environment", function (test) {
    var conmock = { warn: H.detectRegex(/test/) };

    H.withConsole(conmock, function () {
      H.withNodeEnv({ NODE_ENV: 'production' }, function () {
        Counts._warn(false, 'test');
      });
    });

    // verify the warning was suppressed
    test.isFalse(conmock.warn.found(), 'production environment did not suppress warning');
  });
}
