Package.describe({
  name: "tmeasday:publish-counts",
  summary: "Publish the count of a cursor, in real time",
  version: "0.5.1",
  git: "https://github.com/percolatestudio/publish-counts.git"
});

Package.on_use(function (api, where) {
  api.versionsFrom("METEOR@0.9.2");
  api.use(['blaze', 'templating'], 'client', { weak: true });
  api.use('mongo', 'client');
  api.add_files('publish-counts.js');
  api.export('Counts');
  api.export('publishCount', 'server');
});

Package.on_test(function (api) {
  api.use([
    'tmeasday:publish-counts',
    'tinytest',
    'facts']);

  api.add_files([
    'tests/helper.js',
    'tests/has_count_test.js',
    'tests/count_test.js',
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
    'tests/observe_handles_test.js',
  ]);
});
