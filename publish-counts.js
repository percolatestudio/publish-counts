if (Meteor.isServer) {
  Counts = {};
  Counts.publish = function(self, name, cursor, options) {
    var initializing = true;
    var handle;
    options = options || {};

    var extraField, countFn;

    if (options.countFromField) {
      extraField = options.countFromField;
      countFn = function(doc) {
        return doc[extraField];
      }
    } else if (options.countFromFieldLength) {
      extraField = options.countFromFieldLength;
      countFn = function(doc) {
        return doc[extraField].length;
      }
    }


    if (countFn && options.nonReactive)
      throw new Error("options.nonReactive is not yet supported with options.countFromFieldLength or options.countFromFieldSum");

    if (countFn)
      var prev = {};

    // ensure the cursor doesn't fetch more than it has to
    cursor._cursorDescription.options.fields = {_id: true};
    if (extraField)
      cursor._cursorDescription.options.fields[extraField] = true;

    var count = 0;
    var observers = {
      added: function(id, fields) {
        if (countFn) {
          if (!fields[extraField])
            return;

          prev[id] = countFn(fields);
          count += prev[id];
        } else {
          count += 1;
        }

        if (!initializing)
          self.changed('counts', name, {count: count});
      },
      removed: function(id, fields) {
        if (countFn) {
          if (!fields[extraField])
            return;

          count -= countFn(fields);
          delete prev[id];
        } else {
          count -= 1;
        }
        self.changed('counts', name, {count: count});
      }
    };

    if (countFn) {
      observers.changed = function(id, fields) {
        if (countFn) {
          if (!fields[extraField])
            return;

          var next = countFn(fields);
          count += next - (prev[id] || 0);
          prev[id] = next;
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
      handle = cursor.observeChanges(observers);

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