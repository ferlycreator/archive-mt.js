/**
 * 点类
 * @class maptalks.Marker
 * @extends maptalks.Geometry
 * @mixins maptalks.Geometry.Center
 * @author Maptalks Team
 */
Z['Marker']=Z.Marker=Z.Geometry.extend({
    includes:[Z.Geometry.Center],

    type: Z.Geometry['TYPE_POINT'],

    options:{
        'symbol':{
            'markerFile' : Z.prefix+'images/marker.png',
            'markerHeight' : 30,
            'markerWidth' : 22
        }
    },

    initialize:function(coordinates,opts) {
        this._coordinates = new Z.Coordinate(coordinates);
        this._initOptions(opts);
    },

    _containsPoint: function(point) {
        var pxExtent = this._getPainter().getPixelExtent();
        return pxExtent.contains(point);
    },

    //TODO 针对vector与text类型marker需要特殊处理
    _computeExtent:function(projection) {
        var coordinates = this.getCenter();
        if (!coordinates) {return null;}
        return new Z.Extent({'x':coordinates.x,'y':coordinates.y},{'x':coordinates.x,'y':coordinates.y});
    },

    _computeGeodesicLength:function(projection) {
        return 0;
    },

    _computeGeodesicArea:function(projection) {
        return 0;
    }
});
