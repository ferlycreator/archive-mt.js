Z['Polyline']=Z.Polyline = Z.Vector.extend({
    includes:[Z.Geometry.Poly],

    type:Z.Geometry['TYPE_LINESTRING'],

    initialize:function(coordinates, opts) {

        this.setCoordinates(coordinates);
        this.initOptions(opts);
    },

    /**
     * 设置多折线的坐标值
     * @param {Array} coordinates 坐标数组
     * @expose
     */
    setCoordinates:function(coordinates) {
        this.points = Z.GeoJson.fromGeoJsonCoordinates(coordinates);
        if (this.getMap()) {
            this._setPrjPoints(this._projectPoints(this.points));
        }
        return this;
    },

    /**
     * 获取多折线坐标值
     * @return {Array} 多边形坐标数组
     * @expose
     */
    getCoordinates:function() {
        return this.points;
    },

    _containsPoint: function(point) {
        // TODO
        // get pixel extent

        // screen points
        var points = this._untransformToOffset(this._getPrjPoints());

        return false;
    },

    _assignPainter:function() {
        if (!this.layer) {return null;}
        if (this.layer instanceof Z.SVGLayer) {
            return new Z.Polyline.SVG(this);
        } else if (this.layer instanceof Z.CanvasLayer) {
            return new Z.Polyline.Canvas(this);
        }
        return null;
    }

});
