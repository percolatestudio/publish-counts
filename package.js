Package.describe({
  summary: "Publish the count of a cursor, in real time",
  version: "0.3.0",
  git: "https://github.com/percolatestudio/publish-counts.git"
});

Package.on_use(function (api, where) {
  api.use('ui@1.0.0');
  api.add_files('publish-counts.js');
  api.export('Counts', 'client');
  api.export(['Counts', 'publishCount'], 'server');
});

Package.on_test(function (api) {
  api.use([
    'tmeasday:publish-counts',
    'tinytest',
    'facts']);

  api.add_files('publish-counts_tests.js');
});
