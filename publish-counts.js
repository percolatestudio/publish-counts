if (Meteor.isServer) {
    Counts = {};
    Counts.publish = function(self, name, cursor, options) {
        var count = 0;
        var initializing = true;
        var handle;
        options = options || {};

        if ((options.countFromFieldLength || options.countFromFieldSum) && options.nonReactive)
            throw new Error("options.nonReactive is not yet supported with options.countFromFieldLength or options.countFromFieldSum");

        if (options.countFromFieldLength || options.countFromFieldSum)
            var prev = {};

        // ensure the cursor doesn't fetch more than it has to
        cursor._cursorDescription.options.fields = {_id: true};
        if (options.countFromFieldLength)
            cursor._cursorDescription.options.fields[options.countFromFieldLength] = true;

        if (options.countFromFieldSum)
            cursor._cursorDescription.options.fields[options.countFromFieldSum] = true;

        var observers = {
            added: function(id, fields) {
                if (options.countFromFieldLength) {
                    if (!fields[options.countFromFieldLength])
                        return;

                    count += fields[options.countFromFieldLength].length;
                    prev[id] = count;
                } else if (options.countFromFieldSum) {
                    if (!fields[options.countFromFieldSum])
                        return;
                    count += fields[options.countFromFieldSum];
                    prev[id] = count;
                } else {
                    count += 1;
                }

                if (!initializing)
                    self.changed('counts', name, {count: count});
            },
            removed: function(id, fields) {
                var subs = 1;
                if (options.countFromFieldLength) {
                    subs = fields[options.countFromFieldLength].length;
                }
                if (options.countFromFieldSum) {
                    subs = fields[options.countFromFieldSum];
                }
                count -= subs;
                self.changed('counts', name, {count: count});
            }
        };

        if (options.countFromFieldLength) {
            observers.changed = function(id, fields) {
                if (!fields[options.countFromFieldLength])
                    return;

                next = fields[options.countFromFieldLength].length;
                count += next - prev[id];
                prev[id] = next;

                self.changed('counts', name, {count: count});
            };
        }

        if (options.countFromFieldSum) {
            observers.changed = function(id, fields) {
                if (!fields[options.countFromFieldSum])
                    return;

                next = fields[options.countFromFieldSum];
                count += next - prev[id];
                prev[id] = next;

                self.changed('counts', name, {count: count});
            };
        }

        if (!options.countFromFieldLength && !options.countFromFieldSum && initializing) {
            self.added('counts', name, {count: cursor.count()});
            if (!options.noReady)
                self.ready();
        }

        if (!options.nonReactive)
            handle = cursor.observeChanges(observers);

        if (options.countFromFieldLength)
            self.added('counts', name, {count: count});

        if (options.countFromFieldSum)
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
