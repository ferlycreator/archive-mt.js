/**
 * 多点类
 * @class maptalks.MultiPoint
 * @extends maptalks.MultiPoly
 * @author Maptalks Team
 */
Z.MultiPoint = Z.MultiPoly.extend({
    GeometryType:Z.Marker,

    type:Z.Geometry['TYPE_MULTIPOINT'],

    options:{
        'symbol':{
            'markerFile' : Z.prefix+'images/resource/marker.png',
            'markerHeight' : 30,
            'markerWidth' : 22
        }
    },

    initialize:function(data, opts) {
        this._initOptions(opts);
        this._initData(data);
    }
});
