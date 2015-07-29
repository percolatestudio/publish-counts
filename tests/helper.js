this.Posts = new Meteor.Collection('posts');

// {this} is provided by IIFE that wraps this file
// H is for helper
this.H = {};

// added for use with console mock.  used to detect when a method call's first
// argument matches the regex.  use found() for later assertion test.
this.H.detectRegex = function (regex) {
  var found = false;

  fn = function (actual) {
    if (found) return actual;   // once regex passes, never reset the found flag.
    found = regex.test(actual);
    return actual
  }

  fn.found = function () { return found; }    // accessor for later assertion test.

  return fn;
}

// helper function to construct a unique, but consistent, id for each test
// document.
this.H.docId = function docId (testId, docNum) {
  return '' + testId + '-' + docNum;
}

// helper function to wrap console mock initialization and restoration around a
// code block.  to test warnings to user/devs.
this.H.withConsole = (function withConsole (conmock, fn) {
  var mock = function (from, to, backup) {
    backup = backup || {};

    _.each(from, function (v, k) {
      // only copy shallow properties
      if (from.hasOwnProperty(k)) {
        backup[k] = to[k];
        to[k] = from[k];
      }
    });
  };

  var backup = {};
  mock(conmock, this.console, backup);    // mock methods of console.
  fn();
  mock(backup, this.console)              // restore methods of console.
}).bind(this);


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
