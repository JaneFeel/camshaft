'use strict';

var dot = require('dot');
dot.templateSettings.strip = false;

var Moran = require('./moran');
var debug = require('../../util/debug')(Moran.TYPE);

module.exports.create = function(definition, factory, databaseService, callback) {
    factory.create(definition.params.source, function(err, node) {
        if (err) {
            return callback(err);
        }

        var moran = new Moran(definition.params, {source: node});

        createCacheTable(databaseService, node.getQuery(), moran.getTargetTable(), moran, function(err) {
            if (err) {
                return callback(err);
            }

            databaseService.getColumnNames(moran.getQuery(), function(err, columnNames) {
                if (err) {
                    return callback(err);
                }

                moran.setColumns(columnNames);
                return callback(null, moran);
            });
        });
    });
};


var moranAnalysisQuery = dot.template([
    'WITH',
    'input_query as (',
    '    {{=it._query}}',
    '),',
    'moran as (',
    '    SELECT * FROM',
    '    cdb_crankshaft.cdb_moran_local_rate(',
    '        \'{{=it._query}}\',',
    '        \'{{=it._numeratorColumn}}\',',
    '        \'{{=it._denominatorColumn}}\',',
    '        {{=it._significance}},',
    '        {{=it._neighbours}},',
    '        {{=it._permutations}},',
    '        \'the_geom\',',
    '        \'cartodb_id\',',
    '        \'{{=it._wType}}\'',
    '    )',
    ')',
    'select input_query.*, moran.* from input_query join moran',
    'on moran.ids = input_query.cartodb_id'
].join('\n'));


function populateCacheTableQuery(targetTableName, outputQuery) {
    return [
        'INSERT INTO ' + targetTableName,
        outputQuery
    ].join('\n');
}

function createCacheTable(databaseService, inputQuery, targetTableName, moranNode, callback) {
    databaseService.run('select * from ' + targetTableName + ' limit 0', function(err) {
        // check if table already exists, otherwise it proceed to create and populate it
        if (!err) {
            return callback(null);
        }

        debug('For moran=%j', moranNode.toJSON());
        var outputQuery = moranAnalysisQuery({
            _query: inputQuery,
            _numeratorColumn: moranNode.numerator_column,
            _denominatorColumn: moranNode.denominator_column,
            _significance: moranNode.significance,
            _neighbours: moranNode.neighbours,
            _permutations: moranNode.permutations,
            _wType: moranNode.w_type
        });

        databaseService.createTable(targetTableName, outputQuery, function(err) {
            if (err) {
                return callback(err);
            }
            var populateQuery = populateCacheTableQuery(targetTableName, outputQuery);
            databaseService.enqueue(populateQuery, function(err, result) {
                return callback(err, result);
            });
        });
    });
}