if (Meteor.isServer) {
  Meteor.publish('count_from_field_fn_shallow', function (testId) {
    Counts.publish(this, 'posts' + testId, Posts.find({testId: testId}),
        {countFromField: function (doc) { return doc.number; }});
  });

  Meteor.methods({
    setup_shallow_countFromField_fn: function (testId) {
      H.insert(testId, 0, {number: 2});
      H.insert(testId, 1, {number: 3});
    },
    addDoc_shallow_countFromField_fn: function (testId) {
      H.insert(testId, 2, {number: 4});
    },
    updateDoc_shallow_countFromField_fn: function (testId) {
      H.update(testId, 0, {$set: {number: 1}});
    },
    removeDoc_shallow_countFromField_fn: function (testId) {
      H.remove(testId, 0);
    },
    addField_shallow_countFromField_fn: function (testId) {
      H.update(testId, 0, {number: 4});
    },
    removeField_shallow_countFromField_fn: function (testId) {
      H.update(testId, 0, {});
    },
  });
}

if (Meteor.isClient) {
  Tinytest.addAsync("countFromField: (fn shallow) - upon subscribe with no records, return zero", function (test, done) {
    Meteor.subscribe('count_from_field_fn_shallow', test.id, function () {
      test.equal(H.getCount(test.id), 0);
      done();
    });
  });

  Tinytest.addAsync("countFromField: (fn shallow) - upon subscribe with records, return sum of count fields", function (test, done) {
    Meteor.call('setup_shallow_countFromField_fn', test.id, function () {
      Meteor.subscribe('count_from_field_fn_shallow', test.id, function () {
        test.equal(H.getCount(test.id), 5);
        done();
      });
    });
  });

  Tinytest.addAsync("countFromField: (fn shallow) - after adding a doc, increment sum by new count field", function (test, done) {
    Meteor.call('setup_shallow_countFromField_fn', test.id, function () {
      Meteor.subscribe('count_from_field_fn_shallow', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('addDoc_shallow_countFromField_fn', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, +4);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("countFromField: (fn shallow) - after updating the count field of a doc, adjust sum by change in count field", function (test, done) {
    Meteor.call('setup_shallow_countFromField_fn', test.id, function () {
      Meteor.subscribe('count_from_field_fn_shallow', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('updateDoc_shallow_countFromField_fn', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, -1);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("countFromField: (fn shallow) - after removing a doc, decrement sum by previous count value", function (test, done) {
    Meteor.call('setup_shallow_countFromField_fn', test.id, function () {
      Meteor.subscribe('count_from_field_fn_shallow', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('removeDoc_shallow_countFromField_fn', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, -2);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("countFromField: (fn shallow) - after 1) removing count field, 2) readding count field, adjust count by gain minus loss", function (test, done) {
    Meteor.call('setup_shallow_countFromField_fn', test.id, function () {
      Meteor.subscribe('count_from_field_fn_shallow', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('removeField_shallow_countFromField_fn', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, -2, 'removing field did not update count');

          Meteor.call('addField_shallow_countFromField_fn', test.id, function () {
            var delta = H.getCount(test.id) - before;
            test.equal(delta, +2, 'adding field did not update count');
            done();
          });
        });
      });
    });
  });
}
