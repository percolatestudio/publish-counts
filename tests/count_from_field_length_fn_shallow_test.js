if (Meteor.isServer) {
  Meteor.publish('count_from_field_length_fn_shallow', function (testId) {
    Counts.publish(this, 'posts' + testId, Posts.find({testId: testId}),
        {countFromFieldLength: function (doc) { return doc.array; }});
  });

  Meteor.methods({
    setup_shallow_countFromFieldLength_fn: function (testId) {
      H.insert(testId, 0, {array: [1, 2, 3]});
      H.insert(testId, 1, {array: [1, 2, 3, 4]});
    },
    addDoc_shallow_countFromFieldLength_fn: function (testId) {
      H.insert(testId, 2, {array: [1, 2]});
    },
    updateDoc_shallow_countFromFieldLength_fn: function (testId) {
      // add 2 elements to array of doc 0
      H.update(testId, 0, {$set: {array: [1, 2, 3, 4, 5]}});
    },
    removeDoc_shallow_countFromFieldLength_fn: function (testId) {
      H.remove(testId, 0);
    },
  });
}

if (Meteor.isClient) {
  Tinytest.addAsync("countFromFieldLength: (fn shallow) upon subscribe with no records, returns zero", function (test, done) {
    Meteor.subscribe('count_from_field_length_fn_shallow', test.id, function () {
      test.equal(H.getCount(test.id), 0);
      done();
    });
  });

  Tinytest.addAsync("countFromFieldLength: (fn shallow) upon subscribe with records, returns sum of lengths of array fields", function (test, done) {
    Meteor.call('setup_shallow_countFromFieldLength_fn', test.id, function () {
      Meteor.subscribe('count_from_field_length_fn_shallow', test.id, function () {
        test.equal(H.getCount(test.id), 7);
        done();
      });
    });
  });

  Tinytest.addAsync("countFromFieldLength: (fn shallow) after adding a doc, increments count by new array length", function (test, done) {
    Meteor.call('setup_shallow_countFromFieldLength_fn', test.id, function () {
      Meteor.subscribe('count_from_field_length_fn_shallow', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('addDoc_shallow_countFromFieldLength_fn', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, +2);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("countFromFieldLength: (fn shallow) after updating the count field of a doc, adjusts count by change in array length", function (test, done) {
    Meteor.call('setup_shallow_countFromFieldLength_fn', test.id, function () {
      Meteor.subscribe('count_from_field_length_fn_shallow', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('updateDoc_shallow_countFromFieldLength_fn', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, +2);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("countFromFieldLength: (fn shallow) after removing a doc, decrements count by array length", function (test, done) {
    Meteor.call('setup_shallow_countFromFieldLength_fn', test.id, function () {
      Meteor.subscribe('count_from_field_length_fn_shallow', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('removeDoc_shallow_countFromFieldLength_fn', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, -3);
          done();
        });
      });
    });
  });
}
