Z['Polyline']=Z.Polyline = Z.Vector.extend({
    includes:[Z.Geometry.Poly],
    initialize:function(path, opts) {
        this.type=Z.Geometry['TYPE_POLYLINE'];
        this.setPath(path);
        this.initOptions(opts);
    },

    /**
     * 设置多折线的坐标值
     * @param {Array} path 坐标数组
     * @expose
     */
    setPath:function(path) {
        this.points = path;
        if (this.getMap()) {
            this.setPrjPoints(this.projectPoints(this.points));
        }
        return this;
    },

    /**
     * 获取多折线坐标值
     * @return {Array} 多边形坐标数组
     * @expose
     */
    getPath:function() {
        return this.getPoints();
    },

    getPoints:function() {
        return this.points;
    },


    assignPainter:function() {
        if (!this.layer) {return;}
        if (this.layer instanceof Z.SVGLayer) {
            return new Z.Polyline.SVG(this);
        } else if (this.layer instanceof Z.CanvasLayer) {
            return new Z.Polyline.Canvas(this);
        }
    },

    exportJson:function(opts) {
        return {
            'type':Z.Geometry['TYPE_POLYLINE'],
            'path':this.getPoints()
        };
    },

    exportGeoJson:function(opts) {
        var points = this.getPoints();
        return {
            'type':'LineString',
            'coordinates':this.toGeoJsonCoordinates(points)
        };
    }

});