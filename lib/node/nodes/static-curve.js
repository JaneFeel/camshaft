'use strict';

var Node = require('../node');

var TYPE = 'static-curve';

var PARAMS = {
  source: Node.PARAM.NODE(Node.GEOMETRY.POINT),
  epsilon: Node.PARAM.NUMBER()
};

var StaticCurve = Node.create(TYPE, PARAMS, { cache: true });

module.exports = StaticCurve;

var staticCurveQueryTemplate = Node.template([
  "select douglas_peucker.cartodb_id, ST_GeomFromText(douglas_peucker.the_geom, 4326) as the_geom",
  "from cdb_crankshaft.cdb_douglas_peucker($douglas_peucker_query${{=it.query}}$douglas_peucker_query$, {{=it.epsilon}}) douglas_peucker", // eslint-disable-line no-template-curly-in-string
].join('\n'));

DouglasPeucker.prototype.sql = function () {
  return staticCurveQueryTemplate({
    query: this.source.getQuery(),
    epsilon: this.epsilon
  });
};
