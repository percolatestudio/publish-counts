# Publish Counts

A package to help you publish the count of a cursor, in real time.

## Installation

Intercom can be installed with [Meteorite](https://github.com/oortcloud/meteorite/). From inside a Meteorite-managed app:

``` sh
$ mrt add publish-counts
```

## API

Simply call `publishCount` within a publication, passing in a name and a cursor:

```
Meteor.publish('publication', function() {
  publishCount(this, 'name-of-counter', Posts.find());
});
```

On the client side, once you've subscribed to `'publication'`, you can call `Counts.get('name-of-couter')` to get the value of the counter, reactively.

### Readiness

If you publish a count within a publication that also returns cursor(s), you probably want to pass `{noReady: true}` as a final argument to ensure that the "data" publication sets the ready state. For example, the following publication sends down 10 posts, but allows us to see how many there are in total:

```
Meteor.publish('posts-with-count', function() {
  publishCount(this, 'posts-count', Posts.find(), {noReady: true});
  return Posts.find({}, {limit: 10});
});
```

It will be `.ready()` on the client side when the ten posts are loaded (but the counter may not yet be set). If you want more control, use two publications.

## Notes

The package includes a test that checks the number of observer handles opened and closed (to check for memory leaks). You need to run the `enable-publication-tests-0.7.0.1` branch of `percolatestudio/meteor` to run it however.

## License 

MIT. (c) Percolate Studio

Meteor Intercom was developed as part of the [Verso](http://versoapp.com) project.
