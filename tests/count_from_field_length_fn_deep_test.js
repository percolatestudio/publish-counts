if (Meteor.isServer) {
  Meteor.publish('count_from_field_length_fn_deep', async function (testId) {
    await Counts.publish(this, 'posts' + testId, Posts.find({testId: testId}),
        {countFromFieldLength: function (doc) { return doc.a.b; }});
  });

  Meteor.methods({
    setup_deep_countFromFieldLength_fn: async function (testId) {
      await H.insert(testId, 0, {a: {b: [1, 2, 3]}});
      await H.insert(testId, 1, {a: {b: [1, 2, 3, 4]}});
    },
    addDoc_deep_countFromFieldLength_fn: async function (testId) {
      await H.insert(testId, 2, {a: {b: [1, 2]}});
    },
    updateDoc_deep_countFromFieldLength_fn: async function (testId) {
      // add 2 elements to array of doc 0
      await H.update(testId, 0, {$set: {'a.b': [1, 2, 3, 4, 5]}});
    },
    removeDoc_deep_countFromFieldLength_fn: async function (testId) {
      await H.remove(testId, 0);
    },
    addField_deep_countFromFieldLength_fn: async function (testId) {
      await H.update(testId, 0, {a: {b: [1, 2, 3, 4, 5]}});
    },
    removeField_deep_countFromFieldLength_fn: async function (testId) {
      await H.update(testId, 0, {});
    },
  });
}

if (Meteor.isClient) {
  Tinytest.addAsync("countFromFieldLength: (fn deep) - upon subscribe with no records, return zero", function (test, done) {
    Meteor.subscribe('count_from_field_length_fn_deep', test.id, function () {
      test.equal(H.getCount(test.id), 0);
      done();
    });
  });

  Tinytest.addAsync("countFromFieldLength: (fn deep) - upon subscribe with records, return sum of lengths of array fields", function (test, done) {
    Meteor.call('setup_deep_countFromFieldLength_fn', test.id, function () {
      Meteor.subscribe('count_from_field_length_fn_deep', test.id, function () {
        test.equal(H.getCount(test.id), 7);
        done();
      });
    });
  });

  Tinytest.addAsync("countFromFieldLength: (fn deep) - after adding a doc, increment count by new array length", function (test, done) {
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

  Tinytest.addAsync("countFromFieldLength: (fn deep) - after updating the count field of a doc, adjust count by change in array length", function (test, done) {
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

  Tinytest.addAsync("countFromFieldLength: (fn deep) - after removing a doc, decrement count by array length", function (test, done) {
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

  Tinytest.addAsync("countFromFieldLength: (fn deep) - after 1) removing count field parent, 2) readding count field, adjust count by gain minus loss", function (test, done) {
    Meteor.call('setup_deep_countFromFieldLength_fn', test.id, function () {
      Meteor.subscribe('count_from_field_length_fn_deep', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('removeField_deep_countFromFieldLength_fn', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, -3, 'removing field did not update count');

          Meteor.call('addField_deep_countFromFieldLength_fn', test.id, function () {
            var delta = H.getCount(test.id) - before;
            test.equal(delta, +2, 'adding field did not update count');
            done();
          });
        });
      });
    });
  });
}
