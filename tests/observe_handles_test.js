if (Meteor.isServer) {

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

  // this test will only run with the forked Meteor described above.
  if ('undefined' !== typeof factsByPackage) {
    Tinytest.add("Confirm observe handles start and stop", function(test) {
      var pub = new H.PubMock();
      Counts.publish(pub, 'posts' + test.id, Posts.find({ testId: test.id }));
      test.equal(factsByPackage['mongo-livedata']['observe-handles'], 1);
      pub.stop();
      test.equal(factsByPackage['mongo-livedata']['observe-handles'], 0);
    });
  }
}
