if (Meteor.isServer) {
  Tinytest.add("noReady: - when option is true, stop Counts.publish() from calling ready()", function(test) {
    var pub = new H.PubMock();
    Counts.publish(pub, 'posts' + test.id, Posts.find({ testId: test.id }));
    test.isTrue(pub._ready);

    pub = new H.PubMock();
    Counts.publish(pub, 'posts' + test.id, Posts.find({ testId: test.id }), {noReady: true});
    test.isFalse(pub._ready);
  });
}
