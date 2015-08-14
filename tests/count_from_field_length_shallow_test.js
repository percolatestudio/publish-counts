if (Meteor.isServer) {
  Meteor.publish('count_from_field_length_shallow', function (testId) {
    Counts.publish(this, 'posts' + testId, Posts.find({testId: testId}), {countFromFieldLength: 'array'});
  });

  Meteor.methods({
    setup_shallow_countFromFieldLength: function (testId) {
      H.insert(testId, 0, {array: [1, 2, 3]});
      H.insert(testId, 1, {array: [1, 2, 3, 4]});
    },
    addDoc_shallow_countFromFieldLength: function (testId) {
      H.insert(testId, 2, {array: [1, 2]});
    },
    updateDoc_shallow_countFromFieldLength: function (testId) {
      // add 2 elements to array of doc 0
      H.update(testId, 0, {$set: {array: [1, 2, 3, 4, 5]}});
    },
    removeDoc_shallow_countFromFieldLength: function (testId) {
      H.remove(testId, 0);
    },
    addField_shallow_countFromFieldLength: function (testId) {
      H.update(testId, 0, {array: [1, 2, 3, 4, 5]});
    },
    removeField_shallow_countFromFieldLength: function (testId) {
      H.update(testId, 0, {});
    },
  });
}

if (Meteor.isClient) {
  Tinytest.addAsync("countFromFieldLength: (shallow) - upon subscribe with no records, return zero", function (test, done) {
    Meteor.subscribe('count_from_field_length_shallow', test.id, function () {
      test.equal(H.getCount(test.id), 0);
      done();
    });
  });

  Tinytest.addAsync("countFromFieldLength: (shallow) - upon subscribe with records, return sum of lengths of array fields", function (test, done) {
    Meteor.call('setup_shallow_countFromFieldLength', test.id, function () {
      Meteor.subscribe('count_from_field_length_shallow', test.id, function () {
        test.equal(H.getCount(test.id), 7);
        done();
      });
    });
  });

  Tinytest.addAsync("countFromFieldLength: (shallow) - after adding a doc, increment count by new array length", function (test, done) {
    Meteor.call('setup_shallow_countFromFieldLength', test.id, function () {
      Meteor.subscribe('count_from_field_length_shallow', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('addDoc_shallow_countFromFieldLength', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, +2);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("countFromFieldLength: (shallow) - after updating the array field of a doc, adjust count by change in array length", function (test, done) {
    Meteor.call('setup_shallow_countFromFieldLength', test.id, function () {
      Meteor.subscribe('count_from_field_length_shallow', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('updateDoc_shallow_countFromFieldLength', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, +2);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("countFromFieldLength: (shallow) - after removing a doc, decrement count by array length", function (test, done) {
    Meteor.call('setup_shallow_countFromFieldLength', test.id, function () {
      Meteor.subscribe('count_from_field_length_shallow', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('removeDoc_shallow_countFromFieldLength', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, -3);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("countFromFieldLength: (shallow) - after 1) removing count field, 2) readding count field, adjust count by gain minus loss", function (test, done) {
    Meteor.call('setup_shallow_countFromFieldLength', test.id, function () {
      Meteor.subscribe('count_from_field_length_shallow', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('removeField_shallow_countFromFieldLength', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, -3, 'removing field did not update count');

          Meteor.call('addField_shallow_countFromFieldLength', test.id, function () {
            var delta = H.getCount(test.id) - before;
            test.equal(delta, +2, 'adding field did not update count');
            done();
          });
        });
      });
    });
  });
}
