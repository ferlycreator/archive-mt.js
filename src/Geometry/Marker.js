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
            'marker-file' : Z.prefix+'images/marker.png',
            'marker-height' : 30,
            'marker-width' : 22
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
    },

    _assignPainter:function() {
        if (!this.layer) {return null;}
        if (this.layer.isCanvasRender()) {
            return new Z.Marker.Canvas(this);
        } else {
            return new Z.Marker.SVG(this);
        }
        return null;
    }
});
