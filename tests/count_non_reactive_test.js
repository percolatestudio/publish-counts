if (Meteor.isServer) {

  Meteor.publish('count_non_reactive', function (testId) {
    Counts.publish(this, 'posts' + testId, Posts.find({ testId: testId }), {nonReactive: true});
  });

  Meteor.methods({
    setup_countNonReactive: function (testId) {
      H.insert(testId, 0, {name: "i'm a test post" });
      H.insert(testId, 1, {name: "i'm a test post" });
      H.insert(testId, 2, {name: "i'm a test post" });
    },
    add_doc_countNonReactive: function (testId) {
      H.insert(testId, 3, {name: "i'm a test post" });
    },
    remove_doc_countNonReactive: function (testId) {
      H.remove(testId, 0);
    },
  });
}

if (Meteor.isClient) {
  Tinytest.addAsync("count: (non-reactive) - upon subscribe with no records, return zero", function (test, done) {
    Meteor.subscribe('count_non_reactive', test.id, function () {
      test.equal(H.getCount(test.id), 0);
      done();
    });
  });

  Tinytest.addAsync("count: (non-reactive) - upon subscribe with records, return number of records", function (test, done) {
    Meteor.call('setup_countNonReactive', test.id, function () {
      Meteor.subscribe('count_non_reactive', test.id, function () {
        test.equal(H.getCount(test.id), 3);
        done();
      });
    });
  });

  Tinytest.addAsync("count: (non-reactive) - after adding a doc, count remains same", function (test, done) {
    Meteor.call('setup_countNonReactive', test.id, function () {
      Meteor.subscribe('count_non_reactive', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('add_doc_countNonReactive', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, 0);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("count: (non-reactive) - after removing a doc, count remains same", function (test, done) {
    Meteor.call('setup_countNonReactive', test.id, function () {
      Meteor.subscribe('count_non_reactive', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('remove_doc_countNonReactive', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, 0);
          done();
        });
      });
    });
  });
}
