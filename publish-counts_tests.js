Posts = new Meteor.Collection('posts');

if (Meteor.isServer) {

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
