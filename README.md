# Publish Counts

A package to help you publish the count of a cursor, in real time.

## Installation

publish-counts can be installed with [Meteorite](https://github.com/oortcloud/meteorite/). From inside a Meteorite-managed app:

``` sh
$ mrt add publish-counts
```

## API

Simply call `publishCount` within a publication, passing in a name and a cursor:

```js
Meteor.publish('publication', function() {
  publishCount(this, 'name-of-counter', Posts.find());
});
```

On the client side, once you've subscribed to `'publication'`, you can call `Counts.get('name-of-counter')` to get the value of the counter, reactively.

## Options

### Readiness

If you publish a count within a publication that also returns cursor(s), you probably want to pass `{noReady: true}` as a final argument to ensure that the "data" publication sets the ready state. For example, the following publication sends down 10 posts, but allows us to see how many there are in total:

```js
Meteor.publish('posts-with-count', function() {
  publishCount(this, 'posts-count', Posts.find(), { noReady: true });
  return Posts.find({}, { limit: 10 });
});
```

### countFromFieldLength

`countFromFieldLength` allows you to specify a field to calculate the sum of its length across all documents.
For example if we were to store the userIds in an array on a field called `likes`:

```json
{ content: 'testing', likes: ['6PNw4GQKMA8CLprZf', 'HKv4S7xQ52h6KsXQ7'] },
{ content: 'a comment', likes: ['PSmYXrxpwg276aPf5'] }
```

We could then publish them like:

```js
Meteor.publish('posts-likes-count', function() {
  publishCount(this, 'posts-likes-count', Posts.find(), { countFromFieldLength: 'likes' });
});
```

And calling `Counts.get('posts-likes-count')` returns `3`

## Notes

The package includes a test that checks the number of observer handles opened and closed (to check for memory leaks). You need to run the `enable-publication-tests-0.7.0.1` branch of `percolatestudio/meteor` to run it however.

## License 

MIT. (c) Percolate Studio

publish-counts was developed as part of the [Verso](http://versoapp.com) project.
