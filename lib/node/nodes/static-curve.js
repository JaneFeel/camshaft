'use strict';

var Node = require('../node');

var TYPE = 'static-curve';

var PARAMS = {
  source: Node.PARAM.NODE(Node.GEOMETRY.ANY),
  src_lon: Node.PARAM.STRING(),
  src_lat: Node.PARAM.STRING(),
  dst_lon: Node.PARAM.STRING(),
  dst_lat: Node.PARAM.STRING(),
  distance: Node.PARAM.NUMBER()
};

var StaticCurve = Node.create(TYPE, PARAMS, { cache: true });

module.exports = StaticCurve;

var staticCurveQueryTemplate = Node.template([
  'SELECT',
  '  {{=it.columns}},',
  '  ST_SetSRID(' +
  '    ST_Segmentize(',
  '      ST_MakeLine(',
  '        ST_SetSRID(',
  '          ST_Point(',
  '            {{=it.src_lon}},',
  '            {{=it.src_lat}}',
  '          ),',
  '          4326',
  '        ),',
  '        ST_SetSRID(',
  '          ST_Point(',
  '            {{=it.dst_lon}},',
  '            {{=it.dst_lat}}',
  '          ),',
  '          4326',
  '        )',
  '      ),',
  '      {{=it.distance}}',
  '    ),',
  '    4326',
  '  ) AS the_geom',
  'FROM ({{=it.source}}) AS _camshaft_staic_curve_analysis'
].join('\n'));

StaticCurve.prototype.sql = function () {
  return staticCurveQueryTemplate({
    source: this.source.getQuery(),
    columns: this.source.getColumns({ ignoreGeomColumns: true }).join(', '),
    src_lat: this.src_lat,
    src_lon: this.src_lon,
    dst_lat: this.dst_lat,
    dst_lon: this.dst_lon,
    distance: this.distance
  });
};
