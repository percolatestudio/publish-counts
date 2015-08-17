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
    // ensure testId is not modified.  it's used to segregrate documents to
    // keep tests isolated.
    if (hasModifiers(modifier)) {
      modifier.$set = modifier.$set || {};
      modifier.$set.testId = testId;
    } else {
      modifier.testId = testId;
    }

    Posts.update(H.docId(testId, docNum), modifier);
  }

  // helper function to modify node environment variables then restore them after testing.
  this.H.withNodeEnv = (function withNodeEnv (env, fn) {
    var backup = process.env;
    process.env = _.extend({}, backup, env);
    fn();
    process.env = backup;
  }).bind(this);

  // helper function to disable then restore the global state for Counts.noWarnings().
  this.H.withNoWarnings = (function withNoWarnings (fn) {
    Counts.noWarnings();
    fn();
    Counts.noWarnings(false);
  }).bind(this);

  // helper function to modify Counts._warn() then restore it after testing.
  this.H.withWarn = (function withWarn (warn, fn) {
    var backup = Counts._warn;
    Counts._warn = warn;
    fn();
    Counts._warn = backup;
  }).bind(this);

  function hasModifiers (mongoModifier) {
    return _.keys(mongoModifier).some(function (key) {
      return /^\$/.test(key);
    });
  }
}

if (Meteor.isClient) {
  this.H.getCount = function getCount (testId) {
    return Counts.get('posts' + testId);
  }
}
