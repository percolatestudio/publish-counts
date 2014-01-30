Package.describe({
  summary: "publish a count"
});

Package.on_use(function (api, where) {
  api.add_files('publish-counts.js', ['client', 'server']);
  api.export('Counts', 'client');
  api.export('publishCount', ['client', 'server']);
});

Package.on_test(function (api) {
  api.use(['publish-counts', 'tinytest']);
  api.add_files('publish-counts_tests.js', ['client', 'server']);
});
