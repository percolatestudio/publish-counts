Package.describe({
  name: 'tmeasday:publish-counts',
  summary: "Publish the count of a cursor, in real time",
  version: "0.3.0-rc0",
  git: "https://github.com/percolatestudio/publish-counts.git"
});

Package.on_use(function (api, where) {
  api.versionsFrom('METEOR@0.9.2-rc0');
  
  api.use(['ui', 'mongo']);
  api.add_files('publish-counts.js');
  api.export('Counts', 'client');
  api.export('publishCount', 'server');
});

Package.on_test(function (api) {
  api.use([
    'tmeasday:publish-counts',
    'tinytest',
    'facts']);

  api.add_files('publish-counts_tests.js');
});
