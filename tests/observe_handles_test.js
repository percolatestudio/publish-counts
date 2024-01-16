if (Meteor.isServer) {
  const factsByPackage = Package['facts-base']?.Facts?._factsByPackage;
  if ('undefined' !== typeof factsByPackage) {
    Tinytest.add("Confirm observe handles start and stop", async function(test) {
      var pub = new H.PubMock();
      await Counts.publish(pub, 'posts' + test.id, Posts.find({ testId: test.id }));
      test.equal(factsByPackage['mongo-livedata']['observe-handles'], 1);
      pub.stop();
      test.equal(factsByPackage['mongo-livedata']['observe-handles'], 0);
    });
  }
}
