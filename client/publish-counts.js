Counts = {};
if (Package.templating) {
  Package.templating.Template.registerHelper('getPublishedCount', function(name) {
    return CountsCollection.get(name);
  });

  Package.templating.Template.registerHelper('hasPublishedCount', function(name) {
    return CountsCollection.has(name);
  });
}
