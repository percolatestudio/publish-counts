Posts = new Meteor.Collection('posts');

if (Meteor.isServer) {

  var PubMock = function() { this._ready = false; };
  PubMock.prototype.added = function(name, id) {};
  PubMock.prototype.removed = function(name, id) {};
  PubMock.prototype.changed = function(name, id) {};
  PubMock.prototype.onStop = function(cb) { this._onStop = cb; };
  PubMock.prototype.stop = function() { if (this._onStop) this._onStop(); };
  PubMock.prototype.ready = function() { this._ready = true; };

  Posts.allow({
    insert: function() {
      return true;
    },
    remove: function() {
      return true;
    }
  });

  Meteor.publish('counts', function(testId) {
    Counts.publish(this, 'posts' + testId, Posts.find({ testId: testId }));
  });

  // options.countFromFieldLength
  Meteor.publish('counts2', function(testId) {
    Counts.publish(this, 'posts' + testId, Posts.find({ testId: testId }), {
      countFromFieldLength: 'array'
    });
  });

  // options.nonReactive
  Meteor.publish('counts3', function(testId) {
    Counts.publish(this, 'posts' + testId, Posts.find({ testId: testId }), {
      nonReactive: true
    });
  });

  // options.countFromField
  Meteor.publish('counts4', function(testId) {
    Counts.publish(this, 'posts' + testId, Posts.find({ testId: testId }), {
      countFromField: 'number'
    });
  });

  Meteor.methods({
    setup: function(testId) {
      Posts.insert({ testId: testId, name: "i'm a test post" });
      Posts.insert({ testId: testId, name: "i'm a test post" });
      Posts.insert({ testId: testId, name: "i'm a test post" });
    },
    setup2: function(testId) {
      Posts.insert({ _id: 'first' + testId, testId: testId, array: ['a', 'b'] });
      Posts.insert({ testId: testId, array: ['a', 'b', 'c'] });
      Posts.insert({ testId: testId, array: ['a'] });
      // Because we should handle missing fields
      Posts.insert({ testId: testId });
    },
    setup3: function(testId) {
      Posts.insert({ _id: 'first' + testId, testId: testId, number: 5 });
      Posts.insert({ testId: testId, number: 1 });
      Posts.insert({ testId: testId, number: 3 });
      // Because we should handle missing fields
      Posts.insert({ testId: testId });
    },
    update2: function(testId) {
      Posts.update({_id: 'first' + testId}, {$set: {array: []}});
    },
    update3: function(testId) {
      Posts.update({ _id: 'first' + testId}, {$set: {number: 3}});
    }
  });

  //
  // We've forked Meteor in order to run this test.
  // `factsByPackage` has been exported from the Facts package.
  // To run this test, add:
  // "meteor": {
  //   "git": "git://github.com/percolatestudio/meteor.git",
  //   "branch": "enable-publication-tests-0.7.0.1"
  // },
  // to the project smart.json
  //

  // Tinytest.add("Confirm observe handles start and stop", function(test) {
  //   var pub = new PubMock();
  //   Counts.publish(pub, 'posts' + test.id, Posts.find({ testId: test.id }));
  //   test.equal(factsByPackage['mongo-livedata']['observe-handles'], 1);
  //   pub.stop();
  //   test.equal(factsByPackage['mongo-livedata']['observe-handles'], 0);
  // });

  Tinytest.add("Adding noReady option stops ready being called", function(test) {
    var pub = new PubMock();
    Counts.publish(pub, 'posts' + test.id, Posts.find({ testId: test.id }));
    test.isTrue(pub._ready);

    pub = new PubMock();
    Counts.publish(pub, 'posts' + test.id, Posts.find({ testId: test.id }), {noReady: true});
    test.isFalse(pub._ready);
  });
}

if (Meteor.isClient) {

  Tinytest.addAsync("Basic count is correct", function(test, done) {
    Meteor.call('setup', test.id, function() {
      Meteor.subscribe('counts', test.id, function() {
        test.equal(Counts.get('posts' + test.id), 3);
        done();
      });
    });
  });

  Tinytest.addAsync("Count changes on add and remove", function(test, done) {
    Meteor.call('setup', test.id, function() {
      Meteor.subscribe('counts', test.id, function() {
        test.equal(Counts.get('posts' + test.id), 3);

        Posts.insert({ testId: test.id, name: "i'm a test post" }, function(error, post1Id) {
          Posts.insert({ testId: test.id, name: "i'm a test post" }, function(error, post2Id) {
            test.equal(Counts.get('posts' + test.id), 5);
            Posts.remove(post1Id, function() {
              Posts.remove(post2Id, function() {
                test.equal(Counts.get('posts' + test.id), 3);
                done();
              });
            });
          });
        });
      });
    });
  });

  Tinytest.addAsync("countFromFieldLength is correct", function(test, done) {
    Meteor.call('setup2', test.id, function() {
      Meteor.subscribe('counts2', test.id, function() {
        test.equal(Counts.get('posts' + test.id), 6);
        Meteor.call('update2', test.id, function() {
          test.equal(Counts.get('posts' + test.id), 4);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("countFromField is correct", function(test, done) {
    Meteor.call('setup3', test.id, function() {
      Meteor.subscribe('counts4', test.id, function() {
        test.equal(Counts.get('posts' + test.id), 9);
        Meteor.call('update3', test.id, function() {
          test.equal(Counts.get('posts' + test.id), 7);
          done();
        });
      });
    });
  });

  Tinytest.addAsync("options.nonReactive is not reactive", function(test, done) {
    Meteor.call('setup', test.id, function() {
      Meteor.subscribe('counts3', test.id, function() {
        test.equal(Counts.get('posts' + test.id), 3);

        Posts.insert({ testId: test.id, name: "i'm a test post" }, function(error, post1Id) {
          test.equal(Counts.get('posts' + test.id), 3);
          done();
        });
      });
    });
  });

}
