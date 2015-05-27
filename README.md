# Publish Counts

A package to help you publish the count of a cursor, in real time.

## Installation

``` sh
$ meteor add tmeasday:publish-counts
```

## API

Simply call `Counts.publish` within a publication, passing in a name and a cursor:

```js
Meteor.publish('publication', function() {
  Counts.publish(this, 'name-of-counter', Posts.find());
});
```

On the client side, once you've subscribed to `'publication'`, you can call `Counts.get('name-of-counter')` to get the value of the counter, reactively.

The `Counts.publish` function returns the observer handle that's used to maintain the counter. You can call its `stop` method in order to stop the observer from running.

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
 
### countFromFieldLength

`countFromFieldLength` allows you to specify a field to calculate the sum of its length across all documents.
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

### countFromFieldSum

`countFromFieldSum` allows you to specify a field to calculate the sum of its numbers across all documents.
For example if we were to store page visits as numbers on a field called `visits`:

```
{ content: 'testing', visits: 100 },
{ content: 'a comment', visits: 50 }
```

We could then publish them like:

```js
Meteor.publish('posts-visits-count', function() {
  Counts.publish(this, 'posts-visits', Posts.find(), { countFromFieldSum: 'visits' });
});
```


And calling `Counts.get('posts-visits')` returns `150`

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
