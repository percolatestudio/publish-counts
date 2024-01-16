Package.describe({
  name: "tmeasday:publish-counts",
  summary: "Publish the count of a cursor, in real time",
  version: "1.0.0",
  git: "https://github.com/percolatestudio/publish-counts.git"
});

Package.onUse(function (api, where) {
  api.versionsFrom('3.0-beta.0');
  api.use(['blaze', 'templating'], 'client', { weak: true });
  api.use('mongo', 'client');
  api.use('underscore', 'server');
  api.addFiles('client/publish-counts.js', 'client');
  api.addFiles('server/publish-counts.js', 'server');
  api.export('Counts');
  api.export('publishCount', 'server');
});

// meteor test-packages tmeasday:publish-counts --driver-package test-in-console
Package.onTest(function (api) {
  api.use([
    'tmeasday:publish-counts',
    'underscore',
    'tinytest',
    'mongo',
    'facts-base'
  ]);

  api.use([
    'jquery',
    'blaze-html-templates'
  ], 'client');

  api.addFiles([
    'tests/helper.js',
    'tests/has_count_test.js',
    'tests/count_test.js',
    'tests/count_local_collection_test.js',
    'tests/count_non_reactive_test.js',
    'tests/count_from_field_shallow_test.js',
    'tests/count_from_field_fn_shallow_test.js',
    'tests/count_from_field_fn_deep_test.js',
    'tests/count_from_field_length_shallow_test.js',
    'tests/count_from_field_length_fn_shallow_test.js',
    'tests/count_from_field_length_fn_deep_test.js',
    'tests/field_limit_count_test.js',
    'tests/field_limit_count_from_field_test.js',
    'tests/field_limit_count_from_field_fn_test.js',
    'tests/field_limit_count_from_field_length_test.js',
    'tests/field_limit_count_from_field_length_fn_test.js',
    'tests/no_ready_test.js',
    'tests/no_warn_test.js',
    'tests/observe_handles_test.js',
  ]);
});
