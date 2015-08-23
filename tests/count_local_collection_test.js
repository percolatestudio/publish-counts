if (Meteor.isServer) {
  var Locals = new Mongo.Collection(null);
  var insert = H.insertFactory(Locals);
  var remove = H.removeFactory(Locals);
  var update = H.updateFactory(Locals);

  Meteor.publish('count-locals', function (testId) {
    Counts.publish(this, 'locals' + testId, Locals.find({ testId: testId }));
  });

  Meteor.methods({
    setup_count_locals: function (testId) {
      insert(testId, 0, { name: "i'm a test local" });
      insert(testId, 1, { name: "i'm a test local" });
      insert(testId, 2, { name: "i'm a test local" });
    },
    addDoc_count_locals: function (testId) {
      insert(testId, 3, { name: "i'm a test local" });
    },
    updateDoc_count_locals: function (testId) {
      update(testId, 0, { $set: { name: "i'm an edited local" } });
    },
    removeDoc_count_locals: function (testId) {
      remove(testId, 0);
    },
  });
}

if (Meteor.isClient) {
  var getCount = H.getCountFactory('locals');   // name must match name used in `Counts.publish` above.

  Tinytest.addAsync("count: (local collection) - upon subscribe with no records, return zero", function (test, done) {
    Meteor.subscribe('count-locals', test.id, function () {
      test.equal(getCount(test.id), 0);
      done();
    });
  });

  Tinytest.addAsync("count: (local collection) - upon subscribe with records, return number of records", function (test, done) {
    Meteor.call('setup_count_locals', test.id, function () {
      Meteor.subscribe('count-locals', test.id, function () {
        test.equal(getCount(test.id), 3);
        done();
      });
    });
  });

  Tinytest.addAsync("count: (local collection) - after adding a doc, increment count", function (test, done) {
    Meteor.call('setup_count_locals', test.id, function () {
      Meteor.subscribe('count-locals', test.id, function () {
        var before = getCount(test.id);
        Meteor.call('addDoc_count_locals', test.id, function () {
          var delta = getCount(test.id) - before;
          test.equal(delta, +1);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("count: (local collection) - after updating a doc, count remains the same", function (test, done) {
    Meteor.call('setup_count_locals', test.id, function () {
      Meteor.subscribe('count-locals', test.id, function () {
        var before = getCount(test.id);
        Meteor.call('updateDoc_count_locals', test.id, function () {
          var delta = getCount(test.id) - before;
          test.equal(delta, 0);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("count: (local collection) - after removing a doc, decrement count", function (test, done) {
    Meteor.call('setup_count_locals', test.id, function () {
      Meteor.subscribe('count-locals', test.id, function () {
        var before = getCount(test.id);
        Meteor.call('removeDoc_count_locals', test.id, function () {
          var delta = getCount(test.id) - before;
          test.equal(delta, -1);
          done();
        });
      });
    });
  });
}
