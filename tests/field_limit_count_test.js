if (Meteor.isServer) {
  Tinytest.add("fieldLimit: (count) upon publish without field limit, automatically limit cursor fields to _id", function (test) {
    var pub = new H.PubMock();
    var cursor = Posts.find({ testId: test.id });     // no field limit

    Counts.publish(pub, 'posts' + test.id, cursor);

    var fields = cursor._cursorDescription.options.fields;

    test.isNotUndefined(fields, 'cursor is missing fields property');
    test.isNotUndefined(fields._id, 'cursor is missing _id field');
    // verify only one field is fetched.
    test.equal(_.keys(fields).length, 1, 'cursor has more than one field')
  });

  Tinytest.add("fieldLimit: (count) upon publish with field limit, warn user and limit cursor fields to _id", function (test) {
    var pub = new H.PubMock();
    var cursor = Posts.find({ testId: test.id }, { fields: { name: true }});    // field manually limited to name
    var conmock = { warn: H.detectRegex(/unused fields removed from cursor fields option/) };

    H.withConsole(conmock, function () {
      Counts.publish(pub, 'posts' + test.id, cursor);
    });

    var fields = cursor._cursorDescription.options.fields;

    // verify the warning was sent to user
    test.isTrue(conmock.warn.found(), 'user was not warned of unused fields');

    test.isNotUndefined(fields, 'cursor is missing fields property');
    test.isNotUndefined(fields._id, 'cursor is missing field (_id)');
    // verify only two fields are fetched.
    test.equal(_.keys(fields).length, 1, 'cursor has more than one field')
  });
}
