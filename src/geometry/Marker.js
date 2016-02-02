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
            'markerFile' : Z.prefix+'images/resource/marker.png',
            'markerHeight' : 26,
            'markerWidth' : 18
        }
    },

    initialize:function(coordinates,opts) {
        this._coordinates = new Z.Coordinate(coordinates);
        this._initOptions(opts);
    },

    /**
     * 是否是矢量渲染
     * @return {Boolean}
     */
    _canEdit:function() {
        return Z.symbolizer.VectorMarkerSymbolizer.test(this, this.getSymbol()) || Z.symbolizer.ImageMarkerSymbolizer.test(this, this.getSymbol());
    },

    _containsPoint: function(point) {
        var pxExtent = this._getPainter().getPixelExtent();
        return pxExtent.contains(point);
    },

    _computeExtent: function() {
        var coordinates = this.getCenter();
        if (!coordinates) {return null;}
        return new Z.Extent(coordinates,coordinates);
    },

    _computeGeodesicLength:function() {
        return 0;
    },

    _computeGeodesicArea:function() {
        return 0;
    }
});
