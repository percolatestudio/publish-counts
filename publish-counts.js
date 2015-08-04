if (Meteor.isServer) {
  Counts = {};
  Counts.publish = function(self, name, cursor, options) {
    var initializing = true;
    var handle;
    options = options || {};

    var extraField, countFn, additionalFields = options.fields || [];

    if (options.countFromField) {
      extraField = options.countFromField;
      if ('function' === typeof extraField) {
        countFn = Counts._safeAccessorFunction(extraField);
      } else {
        countFn = function(doc) {
          return doc[extraField] || 0;    // return 0 instead of undefined.
        }
      }
    } else if (options.countFromFieldLength) {
      extraField = options.countFromFieldLength;
      if ('function' === typeof extraField) {
        countFn = Counts._safeAccessorFunction(function (doc) {
          return extraField(doc).length;
        });
      } else {
        countFn = function(doc) {
          if (doc[extraField]) {
            return doc[extraField].length;
          } else {
            return 0;
          }
        }
      }
    }


    if (countFn && options.nonReactive)
      throw new Error("options.nonReactive is not yet supported with options.countFromFieldLength or options.countFromFieldSum");

    cursor._cursorDescription.options.fields = Counts._optimizeQueryFields(cursor._cursorDescription.options.fields, extraField, additionalFields);

    var count = 0;
    var observers = {
      added: function(doc) {
        if (countFn) {
          count += countFn(doc);
        } else {
          count += 1;
        }

        if (!initializing)
          self.changed('counts', name, {count: count});
      },
      removed: function(doc) {
        if (countFn) {
          count -= countFn(doc);
        } else {
          count -= 1;
        }
        self.changed('counts', name, {count: count});
      }
    };

    if (countFn) {
      observers.changed = function(newDoc, oldDoc) {
        if (countFn) {
          count += countFn(newDoc) - countFn(oldDoc);
        }

        self.changed('counts', name, {count: count});
      };
    }

    if (!countFn) {
      self.added('counts', name, {count: cursor.count()});
      if (!options.noReady)
        self.ready();
    }

    if (!options.nonReactive)
      handle = cursor.observe(observers);

    if (countFn)
      self.added('counts', name, {count: count});

    if (!options.noReady)
      self.ready();

    initializing = false;

    self.onStop(function() {
      if (handle)
        handle.stop();
    });

    return {
      stop: function() {
        if (handle) {
          handle.stop();
          handle = undefined;
        }
      }
    };
  };
  // back compatibility
  publishCount = Counts.publish;

  Counts._safeAccessorFunction = function safeAccessorFunction (fn) {
    // ensure that missing fields don't corrupt the count.  If the count field
    // doesn't exist, then it has a zero count.
    return function (doc) {
      try {
        return fn(doc) || 0;    // return 0 instead of undefined
      }
      catch (err) {
        if (err instanceof TypeError) {   // attempted to access property of undefined (i.e. deep access).
          return 0;
        } else {
          throw err;
        }
      }
    };
  }

  Counts._optimizeQueryFields = function optimizeQueryFields (fields, extraField, additionalFields) {
    switch (typeof extraField) {
      case 'function':      // accessor function used.
        if (undefined === fields) {
          // user did not place restrictions on cursor fields.
          console.warn('publish-counts: Collection cursor has no field limits and will fetch entire documents.  ' +
                      'consider specifying only required fields.');
          // if cursor field limits are empty to begin with, leave them empty.  it is the
          // user's responsibility to specify field limits when using accessor functions.
        }
        // else user specified restrictions on cursor fields.  Meteor will ensure _id is one of them.
        // WARNING: unable to verify user included appropriate field for accessor function to work.  we can't hold their hand ;_;

        return fields;

      case 'string':        // countFromField or countFromFieldLength has property name.
        // extra field is a property

        // automatically set limits if none specified.  keep existing limits since user
        // may use a cursor transform and specify a dynamic field to count, but require other
        // fields in the transform process  (e.g. https://github.com/percolatestudio/publish-counts/issues/47).
        fields = fields || {};
        // _id and extraField are required
        fields._id = true;
        fields[extraField] = true;

        _.each(additionalFields, function(field) {
          fields[field] = true;
        });

        if (2 < _.keys(fields).length)
          console.warn('publish-counts: unused fields detected in cursor fields option', _.omit(fields, _.union(['_id', extraField], additionalFields)));

        // use modified field limits.  automatically defaults to _id and extraField if none specified by user.
        return fields;

      case 'undefined':     // basic count
        if (fields && 0 < _.keys(_.omit(fields, _.union(['_id'], additionalFields)).length))
          console.warn('publish-counts: unused fields removed from cursor fields option.', _.omit(fields, ['_id']));

        // dispose of user field limits, only _id is required
        fields = { _id:  true };

        _.each(additionalFields, function(field) {
          fields[field] = true;
        });

        // use modified field limits.  automatically defaults to _id if none specified by user.
        return fields;

      default:
        throw new Error("unknown invocation of Count.publish() detected.");
    }
  }
}

if (Meteor.isClient) {
  Counts = new Mongo.Collection('counts');

  Counts.get = function(name) {
    var count = this.findOne(name);
    return count && count.count || 0;
  };

  if (Package.templating) {
    Package.templating.Template.registerHelper('getPublishedCount', function(name) {
      return Counts.get(name);
    });
  }
}
