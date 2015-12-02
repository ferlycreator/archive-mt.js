Z.Map.include({
    /**
     * 将地图移动到指定的坐标
     * @param  {maptalks.Coordinate} coordinate 指定的坐标
     * @member maptalks.Map
     * @expose
     */
    panTo:function(coordinate, options) {
        var projection = this._getProjection();
        var p = projection.project(new Z.Coordinate(coordinate));
        var span = this._getPixelDistance(p);
        this.panBy(span, options);
        return this;
    },

    /**
     * 按指定的像素距离移动地图
     * @param  {maptalks.Point} point 点
     * @member maptalks.Map
     * @expose
     */
    panBy:function(offset, options) {
        this._fireEvent('movestart');
        if (!options) {
            options = {};
        }
        if (typeof(options['animation']) === 'undefined' || options['animation']) {
            this._panAnimation(offset, options['duration']);
        } else {
            this.offsetPlatform(offset);
            this._offsetCenterByPixel(new Z.Point(-offset.x,-offset.y));
            this._fireEvent('moving');
            this._onMoveEnd();
        }
        return this;
    },

    _panAnimation:function(offset, t) {
        this._getRender().panAnimation(offset, t);
    }

});
