Z.Map.include({
    /**
     * 将地图移动到指定的坐标
     * @param  {maptalks.Coordinate} coordinate 指定的坐标
     * @member maptalks.Map
     * @expose
     */
    panTo:function(coordinate) {
        var projection = this._getProjection();
        var p = projection.project(coordinate);
        var span = this._getPixelDistance(p);
        this.panBy(span);
        return this;
    },

    /**
     * 按指定的像素距离移动地图
     * @param  {maptalks.Point} point 点
     * @member maptalks.Map
     * @expose
     */
    panBy:function(offset) {
        if (offset.left || offset.top) {
            this._fireEvent('movestart');
            this.offsetPlatform(new Z.Point(offset['left'],offset['top']));
            this._offsetCenterByPixel(new Z.Point(-offset['left'],-offset['top']));
            this._fireEvent('moving');
        }
        this._onMoveEnd({'target':this});
        return this;
    },

    _animatePan:function(moveOffset) {
        this._getRender().panAnimation(moveOffset);
    }

});
