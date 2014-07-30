Package.describe({
  summary: "Publish the count of a cursor, in real time"
});

Package.on_use(function (api, where) {
  api.use('ui');
  api.add_files('publish-counts.js', ['client', 'server']);
  api.export('Counts', 'client');
  api.export('publishCount', 'server');
});

Package.on_test(function (api) {
  api.use(['publish-counts', 'tinytest', 'facts']);
  api.add_files('publish-counts_tests.js', ['client', 'server']);
});
