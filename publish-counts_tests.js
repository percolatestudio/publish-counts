Posts = new Meteor.Collection('posts');

if (Meteor.isServer) {

  var PubMock = function() {};
  PubMock.prototype.added = function(name, id) {};
  PubMock.prototype.removed = function(name, id) {};
  PubMock.prototype.changed = function(name, id) {};
  PubMock.prototype.onStop = function(cb) { this._onStop = cb; };
  PubMock.prototype.stop = function() { if (this._onStop) this._onStop(); };
  PubMock.prototype.ready = function() { return true; };

  Posts.allow({
    insert: function() {
      return true;
    },
    remove: function() {
      return true;
    }
  });

  Meteor.publish('counts', function(testId) {
    publishCount(this, 'posts' + testId, Posts.find({ testId: testId }));
  });

  Meteor.methods({
    setup: function(testId) {
      Posts.insert({ testId: testId, name: "i'm a test post" });
      Posts.insert({ testId: testId, name: "i'm a test post" });
      Posts.insert({ testId: testId, name: "i'm a test post" });
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
  //   publishCount(pub, 'posts' + test.id, Posts.find({ testId: test.id }));
  //   test.equal(factsByPackage['mongo-livedata']['observe-handles'], 1);
  //   pub.stop();
  //   test.equal(factsByPackage['mongo-livedata']['observe-handles'], 0);
  // });

}

if (Meteor.isClient) {

  Tinytest.addAsync("Basic count is correct", function(test, done) {
    Meteor.call('setup', test.id, function() {
      Meteor.subscribe('counts', test.id, function() {
        test.equal(Counts.findOne('posts' + test.id).count, 3);
        done();
      });
    });
  });

  Tinytest.addAsync("Count changes on add and remove", function(test, done) {
    Meteor.call('setup', test.id, function() {
      Meteor.subscribe('counts', test.id, function() {
        test.equal(Counts.findOne('posts' + test.id).count, 3);

        Posts.insert({ testId: test.id, name: "i'm a test post" }, function(error, post1Id) {
          Posts.insert({ testId: test.id, name: "i'm a test post" }, function(error, post2Id) {
            test.equal(Counts.findOne('posts' + test.id).count, 5);
            Posts.remove(post1Id, function() {
              Posts.remove(post2Id, function() {
                test.equal(Counts.findOne('posts' + test.id).count, 3);
                done();
              });
            });
          });
        });
      });
    });
  });

}
