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
            'markerFile' : (function(){
                if (Z.runningInNode) {
                    return 'images/marker.png';
                } else {
                    return Z.prefix+'images/marker.png';
                }
            })(),
            'markerHeight' : 30,
            'markerWidth' : 22
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
        return Z.VectorMarkerSymbolizer.test(this, this.getSymbol()) || Z.ImageMarkerSymbolizer.test(this, this.getSymbol());
    },

    _containsPoint: function(point) {
        var pxExtent = this._getPainter().getPixelExtent();
        return pxExtent.contains(point);
    },

    _computeExtent: function(projection) {
        var coordinates = this.getCenter();
        if (!coordinates) {return null;}
        return new Z.Extent(coordinates,coordinates);
    },

    _computeGeodesicLength:function(projection) {
        return 0;
    },

    _computeGeodesicArea:function(projection) {
        return 0;
    }
});
