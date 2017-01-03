CountsCollection = new Mongo.Collection('counts');

Counts.get =  function countsGet (name) {

  var count = CountsCollection.findOne(name);
  return count && count.count || 0;
};

Counts.has  =   function countsHas (name) {
  return !!CountsCollection.findOne(name);
};