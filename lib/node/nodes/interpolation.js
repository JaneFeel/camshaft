'use strict';

var Node = require('../node');

var TYPE = 'interpolation';

var PARAMS = {
    source: Node.PARAM.NODE(Node.GEOMETRY.POINT),
    z_col: Node.PARAM.STRING()
};

var Interpolation = Node.create(TYPE, PARAMS, { cache: true });

module.exports = Interpolation;

var krigingQueryTemplate = Node.template([
    "select interploation.cartodb_id, ST_SetSRID(interploation.the_geom, 4326) as the_geom",
    "from cdb_crankshaft.cdb_kriging($interploation_query${{=it.query}}$interploation_query$, '{{=it.z_col}}') interploation", // eslint-disable-line no-template-curly-in-string
].join('\n'));

Interpolation.prototype.sql = function () {
    return krigingQueryTemplate({
        query: this.source.getQuery(),
        z_col: this.z_col
    });
};
