if (Meteor.isServer) {
  Meteor.publish('count_from_field_fn_deep', function (testId) {
    Counts.publish(this, 'posts' + testId, Posts.find({testId: testId}),
        {countFromField: function (doc) { return doc.a.b; }});
  });

  Meteor.methods({
    setup_deep_countFromField_fn: function (testId) {
      H.insert(testId, 0, {a: {b: 2}});
      H.insert(testId, 1, {a: {b: 3}});
    },
    addDoc_deep_countFromField_fn: function (testId) {
      H.insert(testId, 2, {a: {b: 4}});
    },
    updateDoc_deep_countFromField_fn: function (testId) {
      H.update(testId, 0, {$set: {a: {b: 1}}});
    },
    removeDoc_deep_countFromField_fn: function (testId) {
      H.remove(testId, 0);
    },
    addField_deep_countFromField_fn: function (testId) {
      H.update(testId, 0, {a: {b: 4}});
    },
    removeField_deep_countFromField_fn: function (testId) {
      H.update(testId, 0, {});
    },
  });
}

if (Meteor.isClient) {
  Tinytest.addAsync("countFromField: (fn deep) - upon subscribe with no records, return zero", function (test, done) {
    Meteor.subscribe('count_from_field_fn_deep', test.id, function () {
      test.equal(H.getCount(test.id), 0);
      done();
    });
  });

  Tinytest.addAsync("countFromField: (fn deep) - upon subscribe with records, return sum of count fields", function (test, done) {
    Meteor.call('setup_deep_countFromField_fn', test.id, function () {
      Meteor.subscribe('count_from_field_fn_deep', test.id, function () {
        test.equal(H.getCount(test.id), 5);
        done();
      });
    });
  });

  Tinytest.addAsync("countFromField: (fn deep) - after adding a doc, increment sum by new count field", function (test, done) {
    Meteor.call('setup_deep_countFromField_fn', test.id, function () {
      Meteor.subscribe('count_from_field_fn_deep', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('addDoc_deep_countFromField_fn', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, +4);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("countFromField: (fn deep) - after updating the count field of a doc, adjust sum by change in count field", function (test, done) {
    Meteor.call('setup_deep_countFromField_fn', test.id, function () {
      Meteor.subscribe('count_from_field_fn_deep', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('updateDoc_deep_countFromField_fn', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, -1);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("countFromField: (fn deep) - after removing a doc, decrement sum by previous count value", function (test, done) {
    Meteor.call('setup_deep_countFromField_fn', test.id, function () {
      Meteor.subscribe('count_from_field_fn_deep', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('removeDoc_deep_countFromField_fn', test.id, function () {
          var delta = H.getCount(test.id) - before;
          test.equal(delta, -2);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("countFromField: (fn deep) - after 1) removing count field parent, 2) readding count field, adjust count by gain minus loss", function (test, done) {
    var delta;
    Meteor.call('setup_deep_countFromField_fn', test.id, function () {
      Meteor.subscribe('count_from_field_fn_deep', test.id, function () {
        var before = H.getCount(test.id);
        Meteor.call('removeField_deep_countFromField_fn', test.id, function () {
          delta = H.getCount(test.id) - before;
          test.equal(delta, -2, 'removing field did not update count');

          Meteor.call('addField_deep_countFromField_fn', test.id, function () {
            delta = H.getCount(test.id) - before;
            test.equal(delta, +2, 'adding field did not update count');
            done();
          });
        });
      });
    });
  });
}
