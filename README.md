# Publish Counts

A package to help you publish the count of a cursor, in real time.

## Installation

``` sh
$ meteor add tmeasday:publish-counts
```

## API

### Counts.publish [server]

`Counts.publish(subscription, counter-name, cursor, options)`

Simply call `Counts.publish` within a publication, passing in a name and a cursor:

#### Example 1
##### JavaScript
```js
Meteor.publish('publication', function() {
  Counts.publish(this, 'name-of-counter', Posts.find());
});
```

##### Coffeescript
```coffeescript
Meteor.publish 'publication', ->
  Counts.publish this, 'name-of-counter', Posts.find()
  return undefined
```

The `Counts.publish` function returns the observer handle that's used to maintain the counter. You can call its `stop` method in order to stop the observer from running.

For more info regarding the `options` parameter, see [Options](#options).

### Counts.get [client]

`Counts.get(counter-name)`

Once you've subscribed to `'publication'` ([Ex 1](#example-1)), you can call `Counts.get('name-of-counter')` to get the value of the counter, reactively.

This function will always return an integer, `0` is returned if the counter is neither published nor subscribed to.

### Counts.has [client]

`Counts.has(counter-name)`

Returns true if a counter is both published and subscribed to, otherwise returns false.  This function is reactive.

Useful for validating the existence of counters.

### Counts.noWarnings [server]

`Counts.noWarnings()`

This function disables all development warnings on the server from publish-counts.

Not recommended for use by development teams, as warnings are meant to inform
library users of potential conflicts, inefficiencies, etc in their use of
publish-counts as a sanity check.  Suppressing all warnings precludes this
sanity check for future changes.  See the [`noWarnings`](#nowarnings) option
for fine-grained warning suppression.

## Options

### Readiness

If you publish a count within a publication that also returns cursor(s), you probably want to pass `{noReady: true}` as a final argument to ensure that the "data" publication sets the ready state. For example, the following publication sends down 10 posts, but allows us to see how many there are in total:

```js
Meteor.publish('posts-with-count', function() {
  Counts.publish(this, 'posts', Posts.find(), { noReady: true });
  return Posts.find({}, { limit: 10 });
});
```

### nonReactive

If you specify `{nonReactive: true}` the cursor won't be observed and only the initial count will be sent on initially subscribing. This is useful in some cases where reactivity is not desired, and can improve performance.

### countFromField

`countFromField` allows you to specify a field to calculate the sum of its numbers across all documents.
For example if we were to store page visits as numbers on a field called `visits`:

```
{ content: 'testing', visits: 100 },
{ content: 'a comment', visits: 50 }
```

We could then publish them like:

```js
Meteor.publish('posts-visits-count', function() {
  Counts.publish(this, 'posts-visits', Posts.find(), { countFromField: 'visits' });
});
```

And calling `Counts.get('posts-visits')` returns `150`

If the counter field is deeply nested, e.g.:

```
{ content: 'testing', stats: { visits: 100 } },
{ content: 'a comment', stats: { visits: 50 } }
```

Then use an accessor function instead like:

```js
Meteor.publish('posts-visits-count', function() {
  Counts.publish(this, 'posts-visits',
    Posts.find({}, { fields: { _id: 1, 'stats.visits': 1 }}),
    { countFromField: function (doc) { return doc.stats.visits; } }
  );
});
```

Note that when using an accessor function, you must limit the fields fetched if desired, otherwise Counts will fetch entire documents as it updates the count.

### countFromFieldLength

`countFromFieldLength` allows you to specify a field to calculate the sum of its **length** across all documents.
For example if we were to store the userIds in an array on a field called `likes`:

```
{ content: 'testing', likes: ['6PNw4GQKMA8CLprZf', 'HKv4S7xQ52h6KsXQ7'] },
{ content: 'a comment', likes: ['PSmYXrxpwg276aPf5'] }
```

We could then publish them like:

```js
Meteor.publish('posts-likes-count', function() {
  Counts.publish(this, 'posts-likes', Posts.find(), { countFromFieldLength: 'likes' });
});
```

If the counter field is deeply nested, e.g.:

```
{ content: 'testing', popularity: { likes: ['6PNw4GQKMA8CLprZf', 'HKv4S7xQ52h6KsXQ7'] } },
{ content: 'a comment', popularity: { likes: ['PSmYXrxpwg276aPf5'] } }
```

Then use an accessor function instead like:

```js
Meteor.publish('posts-likes-count', function() {
  Counts.publish(this, 'posts-likes',
    Posts.find({}, { fields: { _id: 1, 'popularity.likes': 1 }}),
    { countFromFieldLength: function (doc) { return doc.popularity.likes; } }
  );
});
```

Note that when using an accessor function, you must limit the fields fetched if desired, otherwise Counts will fetch entire documents as it updates the count.

### noWarnings

Pass the option, `noWarnings: true`, to `Counts.publish` to disable its warnings in
a development environment.

Each call to `Counts.publish` may print warnings to the console to inform
developers of non-fatal conflicts with publish-counts.  In some situations, a
developer may intentionally invoke `Counts.publish` in a way that generates a
warnings.  Use this option to disable warnings for a particular invocation of
`Counts.publish`.

This fine-grained method of warning suppression is recommended for development
teams that rely on warnings with respect to future changes.

## Template helper

To easily show the counter value within your templates, you can use the `getPublishedCount` template helper.

Example:
```html
<p>There are {{getPublishedCount 'posts'}} posts</p>
```

## Notes

The package includes a test that checks the number of observer handles opened and closed (to check for memory leaks). You need to run the `enable-publication-tests-0.7.0.1` branch of `percolatestudio/meteor` to run it however.

## License

MIT. (c) Percolate Studio

publish-counts was developed as part of the [Verso](http://versoapp.com) project.
