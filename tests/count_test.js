if (Meteor.isServer) {

  Meteor.publish('count', function (testId) {
    Counts.publish(this, 'posts' + testId, Posts.find({ testId: testId }));
  });

  Meteor.methods({
    setup_count: function (testId) {
      H.insert(testId, 0, { name: "i'm a test post" });
      H.insert(testId, 1, { name: "i'm a test post" });
      H.insert(testId, 2, { name: "i'm a test post" });
    },
    addDoc_count: function (testId) {
      H.insert(testId, 3, { name: "i'm a test post" });
    },
    updateDoc_count: function (testId) {
      H.update(testId, 0, { $set: { name: "i'm an edited post" } });
    },
    removeDoc_count: function (testId) {
      H.remove(testId, 0);
    },
  });
}

if (Meteor.isClient) {
  Tinytest.addAsync("count: - upon subscribe with no records, return zero", function (test, done) {
    Meteor.subscribe('count', test.id, function () {
      test.equal(H.getCount(test.id), 0);
      done();
    });
  });

  Tinytest.addAsync("count: - upon subscribe with records, return number of records", function (test, done) {
    Meteor.call('setup_count', test.id, function () {
      Meteor.subscribe('count', test.id, function () {
        test.equal(H.getCount(test.id), 3);
        done();
      });
    });
  });

  Tinytest.addAsync("count: - after adding a doc, increment count", function (test, done) {
    Meteor.call('setup_count', test.id, function () {
      Meteor.subscribe('count', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('addDoc_count', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, +1);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("count: - after updating a doc, count remains the same", function (test, done) {
    Meteor.call('setup_count', test.id, function () {
      Meteor.subscribe('count', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('updateDoc_count', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, 0);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("count: - after removing a doc, decrement count", function (test, done) {
    Meteor.call('setup_count', test.id, function () {
      Meteor.subscribe('count', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('removeDoc_count', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, -1);
          done();
        });
      });
    });
  });
}
