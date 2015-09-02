Z['MultiLineString']=Z['MultiPolyline']=Z.MultiPolyline = Z.MultiPoly.extend({
    GeometryType:Z.Polyline,

    type:Z.Geometry['TYPE_MULTILINESTRING']
});