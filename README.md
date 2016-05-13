# Publish Counts

A package to help you publish the count of a cursor, in real time.

Publish-counts is designed for counting a small number of documents around an
order of 100.  Due to the real-time capability, this package should not be used
to count all documents in large datasets.  Maybe some, but not all.  Otherwise
you will maximize your server's CPU usage as each client connects.

## Table of Contents

- [Installation](https://github.com/percolatestudio/publish-counts#installation)
- [API](https://github.com/percolatestudio/publish-counts#api)
  - [Counts.publish](https://github.com/percolatestudio/publish-counts#countspublish-server)
  - [Counts.get](https://github.com/percolatestudio/publish-counts#countsget-client)
  - [Counts.has](https://github.com/percolatestudio/publish-counts#countshas-client)
  - [Counts.noWarnings](https://github.com/percolatestudio/publish-counts#countsnowarnings-server)
- [Options](https://github.com/percolatestudio/publish-counts#options)
  - [noReady](https://github.com/percolatestudio/publish-counts#noready)
  - [nonReactive](https://github.com/percolatestudio/publish-counts#nonreactive)
  - [countFromField](https://github.com/percolatestudio/publish-counts#countfromfield)
  - [countFromFieldLength](https://github.com/percolatestudio/publish-counts#countfromfieldlength)
  - [noWarnings](https://github.com/percolatestudio/publish-counts#nowarnings)
- [Template helpers](https://github.com/percolatestudio/publish-counts#template-helpers)
- [Notes]()
  - [Observer handle leak testing](https://github.com/percolatestudio/publish-counts#observer-handle-leak-testing)
  - [Why doesn't this library count directly in Mongo?](https://github.com/percolatestudio/publish-counts#why-doesnt-this-library-count-directly-in-mongo)
- [License](https://github.com/percolatestudio/publish-counts#license)

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
  return undefined    # otherwise coffeescript returns a Counts.publish
                      # handle when Meteor expects a Mongo.Cursor object.
```

The `Counts.publish` function returns the observer handle that's used to maintain the counter. You can call its `stop` method in order to stop the observer from running.

Warning: Make sure you call *collection*`.find()` separately for `Counts.publish` and the `Meteor.publish` return value, otherwise you'll get empty documents on the client.

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

### noReady

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

## Template helpers

To easily show counter values within your templates, use the `getPublishedCount` or `hasPublishedCount` template helper.

Example:
```html
<p>There are {{getPublishedCount 'posts'}} posts.</p>
<p>
  {{#if hasPublishedCount 'posts'}}
    There are {{getPublishedCount 'posts'}} posts.
  {{else}}
    The number of posts is loading...
  {{/if}}
</p>
```

## Notes

### Observer handle leak testing

The package includes a test that checks the number of observer handles opened and closed (to check for memory leaks). You need to run the `enable-publication-tests-0.7.0.1` branch of `percolatestudio/meteor` to run it however.

### Why doesn't this library count directly in Mongo? or...
**Why does my MongoDB connection time-out with large (1000+) datasets?**

This package is designed primarily for correctness, not performance. That's why
it's aimed at counting smaller datasets and keeping the count instantly up to
date.

To achieve perfect correctness in Meteor data layer, we use a database observer
to know immediately if a relevant change has occurred. This approach does not
necessarily scale to larger datasets, as the observer needs to cache the entire
matching dataset (amongst other reasons).

Counting large datasets in this manner is suspected to cause database
connections to time out (see
[#86](https://github.com/percolatestudio/publish-counts/issues/86)).

An alternative approach would be to take a .count() of the relevant cursor (or
perform an aggregation in more complex use cases), and poll it regularly to
keep up to date. Bulletproof Meteor has a [proof of concept][proof-of-concept]
of this approach.

[proof-of-concept]: https://github.com/bulletproof-meteor/bullet-counter/blob/solution/lib/server.js

We'd love to see someone publish a package for this use case! If you do end up
making such a package, let us know and we'll link it here.

## License

MIT. (c) Percolate Studio

publish-counts was developed as part of the [Verso](http://versoapp.com) project.
