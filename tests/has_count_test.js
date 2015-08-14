if (Meteor.isServer) {
  Meteor.publish('Counts.has', function (testId) {
    Counts.publish(this, 'posts' + testId, Posts.find({ testId: testId }));
  });
}

if (Meteor.isClient) {
  var hasCount = function hasCount (testId) {
    return Counts.has('posts' + testId);
  }

  Tinytest.add('Counts.has: - when count is not published, return false', function (test, done) {
    test.isFalse(Counts.has('posts'), 'found unexpected count "posts"');
  });

  Tinytest.add('Counts.has: - when count is published but not subscribed, return false', function (test, done) {
    test.isFalse(hasCount(test.id), 'found unexpected count "posts' + test.id + '"');
  });

  Tinytest.addAsync('Counts.has: - when count is published and subscribed, return true', function (test, done) {
    Meteor.subscribe('Counts.has', test.id, function () {
      test.isTrue(hasCount(test.id), 'missing expected count "posts' + test.id + '"');
      done();
    });
  });
}
