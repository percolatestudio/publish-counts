if (Meteor.isServer) {
  Tinytest.add("fieldLimit: (countFromField) - upon publish without field limit, automatically limit cursor fields to _id and count field", function (test) {
    var pub = new H.PubMock();
    var cursor = Posts.find({ testId: test.id });   // no field limit

    Counts.publish(pub, 'posts' + test.id, cursor, { countFromField: 'likes' });

    var fields = cursor._cursorDescription.options.fields;

    test.isNotUndefined(fields, 'cursor is missing fields property');
    test.isNotUndefined(fields._id, 'cursor is missing field (_id)');
    test.isNotUndefined(fields.likes, 'cursor is missing field (likes)');
    // verify only two fields are fetched.
    test.equal(_.keys(fields).length, 2, 'cursor has more/less than two fields');
  });

  Tinytest.add("fieldLimit: (countFromField) - upon publish with count field assigned to field limit, keep existing field limit plus _id", function (test) {
    var pub = new H.PubMock();
    var cursor = Posts.find({ testId: test.id }, { fields: { likes: true }});   // field limit matches countFromField

    Counts.publish(pub, 'posts' + test.id, cursor, { countFromField: 'likes' });

    var fields = cursor._cursorDescription.options.fields;

    test.isNotUndefined(fields, 'cursor is missing fields property');
    test.isNotUndefined(fields._id, 'cursor is missing field (_id)');
    test.isNotUndefined(fields.likes, 'cursor is missing field (likes)');
    // verify only two fields are fetched.
    test.equal(_.keys(fields).length, 2, 'cursor has more/less fields than specified (plus _id)');
  });

  // honestly, devs should never have a reason to do this.  the 'name' field in this example is never used, nor can it ever be.
  Tinytest.add("fieldLimit: (countFromField) - upon publish with other fields assigned to field limit, always keep existing field limit plus _id and count field", function (test) {
    var pub = new H.PubMock();
    var cursor = Posts.find({ testId: test.id }, { fields: { name: true }});

    Counts.publish(pub, 'posts' + test.id, cursor, { countFromField: 'likes' });

    var fields = cursor._cursorDescription.options.fields;

    test.isNotUndefined(fields, 'cursor is missing fields property');
    test.isNotUndefined(fields._id, 'cursor is missing field (_id)');
    test.isNotUndefined(fields.likes, 'cursor is missing field (likes)');
    test.isNotUndefined(fields.name, 'cursor is missing field (name)');
    // verify only three fields are fetched.
    test.equal(_.keys(fields).length, 3, 'cursor has more/less fields than specified (plus _id and likes)');
  });

  { // WARNING TESTS

    //  upon publish with other fields assigned to field limit
    //    with warnings
    //    in development
    //  warn user
    Tinytest.add("fieldLimit: (countFromField) - upon publish with other fields assigned to field limit, " +
                 "with warnings, in development, warn user about unused fields", function (test) {
      var pub = new H.PubMock();
      var cursor = Posts.find({ testId: test.id }, { fields: { name: true }});
      var conmock = { warn: H.detectRegex(/unused fields detected in cursor fields option/) };

      H.withConsole(conmock, function () {
        Counts.publish(pub, 'posts' + test.id, cursor, { countFromField: 'likes' });
      });

      // verify the warning was sent to user
      test.isTrue(conmock.warn.found(), 'expected warning');
    });

    //  upon publish
    //    with other fields assigned to field limit
    //  warning uses Counts._warn
    Tinytest.add("fieldLimit: (countFromField) - upon publish with other fields assigned to field limit, " +
                 "warn with Counts._warn()", function (test) {
      var pub    = new H.PubMock();
      var cursor = Posts.find({ testId: test.id }, { fields: { name: true }});
      var flag   = false;

      H.withWarn(function () { flag = true; }, function () {
        Counts.publish(pub, 'posts' + test.id, cursor, { countFromField: 'likes' });
      });

      test.isTrue(flag, 'did not call Counts._warn()');
    });

  } // END WARNING TESTS
}
