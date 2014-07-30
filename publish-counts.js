if (Meteor.isServer) {
  publishCount = function(self, name, cursor, options) {
    var count = 0;
    var initializing = true;
    options = options || {};
    if (options.countFromFieldLength)
      var prev = {};

    var observers = {
      added: function(id, fields) {
        if (options.countFromFieldLength) {
          count += fields[options.countFromFieldLength].length;
          prev[id] = count;
        } else {
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

    var handle = cursor.observeChanges(observers);

    initializing = false;
    self.added('counts', name, { count: count });
    if (! options.noReady) self.ready();

    self.onStop(function() {
      handle.stop();
    });
  };
}

if (Meteor.isClient) {
  Counts = new Meteor.Collection('counts');

  Counts.get = function(name) {
    var count = Counts.findOne(name);
    return count && count.count;
  };
  
  UI.registerHelper('getCount', function(name) {
    return Counts.get('name');
  });
}