'use strict';

var assert = require('assert');

var Analysis = require('../../lib/analysis');

var BatchClient = require('../../lib/postgresql/batch-client');

describe('workflow', function() {

    var USERNAME = 'localhost';

    describe('create', function() {

        var QUERY_ATM_MACHINES = 'select * from atm_machines';
        var TRADE_AREA_WALK = 'walk';
        var TRADE_AREA_15M = 900;

        var sourceAnalysisDefinition = {
            type: 'source',
            params: {
                query: QUERY_ATM_MACHINES
            }
        };

        var tradeAreaAnalysisDefinition = {
            type: 'trade-area',
            params: {
                source: sourceAnalysisDefinition,
                kind: TRADE_AREA_WALK,
                time: TRADE_AREA_15M
            }
        };

        it('should work for basic source analysis', function(done) {
            Analysis.create(USERNAME, sourceAnalysisDefinition, function(err, analysis) {
                assert.ok(!err, err);
                assert.equal(analysis.getQuery(), QUERY_ATM_MACHINES);


                done();
            });
        });

        it('should have same ids for same queries', function(done) {
            var enqueueFn = BatchClient.prototype.enqueue;

            var enqueueCalled = false;
            BatchClient.prototype.enqueue = function(query, callback) {
                enqueueCalled = true;
                return callback(null, {status: 'ok'});
            };

            Analysis.create(USERNAME, tradeAreaAnalysisDefinition, function(err, analysis) {
                BatchClient.prototype.enqueue = enqueueFn;

                assert.ok(enqueueCalled);

                assert.ok(!err, err);
                assert.ok(analysis.getQuery().match(/select\s\*\sfrom analysis_trade_area/));

                done();
            });
        });

        it('should fail for invalid types', function(done) {
            var analysisType = 'wadus';
            Analysis.create(USERNAME, {type: analysisType}, function(err) {
                assert.ok(err);
                assert.equal(err.message, 'Unknown analysis type: "' + analysisType + '"');
                done();
            });
        });

    });

});
