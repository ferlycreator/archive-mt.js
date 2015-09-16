/**
 * 多点类
 * @class maptalks.MultiPoint
 * @extends maptalks.MultiPoly
 * @author Maptalks Team
 */
Z['MultiPoint'] = Z.MultiPoint = Z.MultiPoly.extend({
    GeometryType:Z.Marker,    

    type:Z.Geometry['TYPE_MULTIPOINT']
});