this.Posts = new Meteor.Collection('posts');

// {this} is provided by IIFE that wraps this file
// H is for helper
this.H = {}


// helper function to construct a unique, but consistent, id for each test
// document.
this.H.docId = function docId (testId, docNum) {
  return '' + testId + '-' + docNum;
}


if (Meteor.isServer) {
  Posts.allow({
    insert: function() {
      return true;
    },
    remove: function() {
      return true;
    }
  });

  var PubMock = function() { this._ready = false; };
  PubMock.prototype.added = function(name, id) {};
  PubMock.prototype.removed = function(name, id) {};
  PubMock.prototype.changed = function(name, id) {};
  PubMock.prototype.onStop = function(cb) { this._onStop = cb; };
  PubMock.prototype.stop = function() { if (this._onStop) this._onStop(); };
  PubMock.prototype.ready = function() { this._ready = true; };
  this.H.PubMock = PubMock;

  this.H.insert = function insert (testId, docNum, doc) {
    var testDoc = _.extend({}, doc, {
      _id:    H.docId(testId, docNum),
      testId: testId,
    });
    Posts.insert(testDoc);
  }

  this.H.remove = function remove (testId, docNum) {
    Posts.remove({_id: H.docId(testId, docNum)});
  }

  this.H.update = function update (testId, docNum, modifier) {
    Posts.update(H.docId(testId, docNum), modifier);
  }
}

if (Meteor.isClient) {
  this.H.getCount = function getCount (testId) {
    return Counts.get('posts' + testId);
  }
}
