Z['MultiPolygon'] = Z.MultiPolygon = Z.MultiPoly.extend({
    GeometryType:Z.Polygon,    

    type:Z.Geometry['TYPE_MULTIPOLYGON']
});