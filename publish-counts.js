if (Meteor.isServer) {
  publishCount = function(self, name, cursor, options) {
    var count = 0;
    var initializing = true;
    options = options || {};
    if (options.countFromFieldLength)
      var prev = {};

    // ensure the cursor doesn't fetch more than it has to
    cursor._cursorDescription.options.fields = {_id: true};
    if (options.countFromFieldLength)
      cursor._cursorDescription.options.fields[options.countFromFieldLength] = true;
    
    var observers = {
      added: function(id, fields) {
        if (options.countFromFieldLength) {
          count += fields[options.countFromFieldLength].length;
          prev[id] = count;
        } else {
          if (! initializing)
            count += 1;
        }
        
        if (! initializing)
          self.changed('counts', name, { count: count });
      },
      removed: function(id, fields) {
        count -= options.countFromFieldLength ? fields[options.countFromFieldLength].length : 1;
        self.changed('counts', name, { count: count });
      }
    };

    if (options.countFromFieldLength) {
      observers.changed = function(id, fields) {
        if (! fields[options.countFromFieldLength])
          return;

        next = fields[options.countFromFieldLength].length;
        count += next - prev[id];
        prev[id] = next;
        
        self.changed('counts', name, { count: count });
      };
    }

    if (initializing)
      count = cursor.count();

    self.added('counts', name, { count: count });

    if (! options.noReady)
      self.ready();

    if (! options.nonReactive)
      var handle = cursor.observeChanges(observers);

    initializing = false;

    self.onStop(function() {
      if (handle)
        handle.stop();
    });

    return {
      stop: function() {
        if (handle){
          handle.stop();
          handle = undefined;
        }
      }
    }
  };
}

if (Meteor.isClient) {
  Counts = new Meteor.Collection('counts');

  Counts.get = function(name) {
    var count = this.findOne(name);
    return count && count.count;
  };
  
  UI.registerHelper('getPublishedCount', function(name) {
    return Counts.get(name);
  });
}
