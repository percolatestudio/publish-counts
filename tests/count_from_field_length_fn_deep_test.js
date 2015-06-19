if (Meteor.isServer) {
  Meteor.publish('count_from_field_length_fn_deep', function (testId) {
    Counts.publish(this, 'posts' + testId, Posts.find({testId: testId}), {countFromFieldLength: 'array'});
  });

  Meteor.methods({
    setup_deep_countFromFieldLength_fn: function (testId) {
      H.insert(testId, 0, {array: [1, 2, 3]});
      H.insert(testId, 1, {array: [1, 2, 3, 4]});
    },
    addDoc_deep_countFromFieldLength_fn: function (testId) {
      H.insert(testId, 2, {array: [1, 2]});
    },
    updateDoc_deep_countFromFieldLength_fn: function (testId) {
      // add 2 elements to array of doc 0
      H.update(testId, 0, {$set: {array: [1, 2, 3, 4, 5]}});
    },
    removeDoc_deep_countFromFieldLength_fn: function (testId) {
      H.remove(testId, 0);
    },
  });
}

if (Meteor.isClient) {
  Tinytest.addAsync("countFromFieldLength: (fn deep) upon subscribe with no records, returns zero", function (test, done) {
    Meteor.subscribe('count_from_field_length_fn_deep', test.id, function () {
      test.equal(H.getCount(test.id), 0);
      done();
    });
  });

  Tinytest.addAsync("countFromFieldLength: (fn deep) upon subscribe with records, returns sum of lengths of array fields", function (test, done) {
    Meteor.call('setup_deep_countFromFieldLength_fn', test.id, function () {
      Meteor.subscribe('count_from_field_length_fn_deep', test.id, function () {
        test.equal(H.getCount(test.id), 7);
        done();
      });
    });
  });

  Tinytest.addAsync("countFromFieldLength: (fn deep) after adding a doc, increments count by new array length", function (test, done) {
    Meteor.call('setup_deep_countFromFieldLength_fn', test.id, function () {
      Meteor.subscribe('count_from_field_length_fn_deep', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('addDoc_deep_countFromFieldLength_fn', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, +2);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("countFromFieldLength: (fn deep) after updating the count field of a doc, adjusts count by change in array length", function (test, done) {
    Meteor.call('setup_deep_countFromFieldLength_fn', test.id, function () {
      Meteor.subscribe('count_from_field_length_fn_deep', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('updateDoc_deep_countFromFieldLength_fn', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, +2);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("countFromFieldLength: (fn deep) after removing a doc, decrements count by array length", function (test, done) {
    Meteor.call('setup_deep_countFromFieldLength_fn', test.id, function () {
      Meteor.subscribe('count_from_field_length_fn_deep', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('removeDoc_deep_countFromFieldLength_fn', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, -3);
          done();
        });
      });
    });
  });
}
