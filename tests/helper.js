this.Posts = new Mongo.Collection('posts');

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

  this.H.insertFactory = function insertFactory (collection) {
    // return a DRY function that inserts docs into one collection.
    return function insert (testId, docNum, doc) {
      var testDoc = _.extend({}, doc, {
        _id:    H.docId(testId, docNum),
        testId: testId,
      });
      collection.insert(testDoc);
    };
  }

  this.H.removeFactory = function removeFactory (collection) {
    // return a DRY function that removes docs from one collection.
    return function remove (testId, docNum) {
      collection.remove({_id: H.docId(testId, docNum)});
    };
  }

  this.H.updateFactory = function updateFactory (collection) {
    // return a DRY function that updates docs in one collection.
    return function update (testId, docNum, modifier) {
      // ensure testId is not modified.  it's used to segregrate documents to
      // keep tests isolated.
      if (hasModifiers(modifier)) {
        modifier.$set = modifier.$set || {};
        modifier.$set.testId = testId;
      } else {
        modifier.testId = testId;
      }

      collection.update(H.docId(testId, docNum), modifier);
    };
  }

  this.H.insert = this.H.insertFactory(Posts);
  this.H.remove = this.H.removeFactory(Posts);
  this.H.update = this.H.updateFactory(Posts);

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
  this.H.getCountFactory = function getCountFactory (name) {
    // return a DRY function that uses a consistent naming scheme.
    // {name} allows each test suite to define a unique name for their
    // respective counter.
    return function getCount (testId) {
      return Counts.get('' + name + testId);
    };
  }

  this.H.getCount = this.H.getCountFactory('posts');
}
