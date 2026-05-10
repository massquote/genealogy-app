<?php

/**
 * Regression guard: makes sure the test suite never points at the dev database.
 * If this fails it means phpunit.xml lost its <server> overrides — fix that
 * before letting any other test run, or you'll wipe local development data.
 */
it('runs against the testing database, never the dev database', function () {
    expect(config('app.env'))->toBe('testing');
    expect(config('database.connections.mysql.database'))->toBe('familyknot_testing');
});
