Z.Map.include({
    /**
     * 将地图移动到指定的坐标
     * @param  {maptalks.Coordinate} coordinate 指定的坐标
     * @member maptalks.Map
     * @expose
     */
    panTo:function(coordinate, options) {
        //TODO 动画
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
        //TODO 动画
        this._fireEvent('movestart');
        if (!options) {
            options = {};
        }
        if (typeof(options['animation']) === 'undefined' || options['animation']) {
            this._panAnimation(offset, options['duration']);
        } else {
            this.offsetPlatform(new Z.Point(offset['left'],offset['top']));
            this._offsetCenterByPixel(new Z.Point(-offset['left'],-offset['top']));
            this._fireEvent('moving');
            this._onMoveEnd();
        }
        return this;
    },

    _panAnimation:function(moveOffset, t) {
        this._getRender().panAnimation(moveOffset, t);
    }

});
