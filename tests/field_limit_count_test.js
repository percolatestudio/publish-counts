if (Meteor.isServer) {
  Tinytest.add("fieldLimit: (count) - upon publish without field limit, automatically limit cursor fields to _id", function (test) {
    var pub = new H.PubMock();
    var cursor = Posts.find({ testId: test.id });     // no field limit

    Counts.publish(pub, 'posts' + test.id, cursor);

    var fields = cursor._cursorDescription.options.fields;

    test.isNotUndefined(fields, 'cursor is missing fields property');
    test.isNotUndefined(fields._id, 'cursor is missing _id field');
    // verify only one field is fetched.
    test.equal(_.keys(fields).length, 1, 'cursor has more than one field')
  });

  Tinytest.add("fieldLimit: (count) - upon publish with field limit, always limit cursor fields to _id", function (test) {
    var pub = new H.PubMock();
    var cursor = Posts.find({ testId: test.id }, { fields: { name: true }});    // field manually limited to name

    Counts.publish(pub, 'posts' + test.id, cursor);

    var fields = cursor._cursorDescription.options.fields;

    test.isNotUndefined(fields, 'cursor is missing fields property');
    test.isNotUndefined(fields._id, 'cursor is missing field (_id)');
    // verify only two fields are fetched.
    test.equal(_.keys(fields).length, 1, 'cursor has more than one field');
  });

  { // WARNING TESTS

    //  upon publish
    //    with field limit
    //    with warnings
    //    in development
    //  warn user
    Tinytest.add("fieldLimit: (count) - upon publish with field limit, with warnings, in development, " +
                 "warn user unused fields were removed", function (test) {
      var pub = new H.PubMock();
      var cursor = Posts.find({ testId: test.id }, { fields: { name: true }});    // field manually limited to name
      var conmock = { warn: H.detectRegex(/unused fields removed from cursor fields option/) };

      H.withConsole(conmock, function () {
        Counts.publish(pub, 'posts' + test.id, cursor);
      });

      // verify the warning was sent to user
      test.isTrue(conmock.warn.found(), 'expected warning');
    });

    //  upon publish
    //    with field limit
    //  warning uses Counts._warn
    Tinytest.add("fieldLimit: (count) - upon publish with field limit, warn with Counts._warn()", function (test) {
      var pub     = new H.PubMock();
      var cursor  = Posts.find({ testId: test.id }, { fields: { name: true }});    // field manually limited to name
      var flag    = false;

      H.withWarn(function () { flag = true; }, function () {
        Counts.publish(pub, 'posts' + test.id, cursor);
      });

      test.isTrue(flag, 'did not call Counts._warn()');
    });

  } // END WARNING TESTS
}
