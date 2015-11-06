Z.Map.include({
    /**
     * 将地图移动到指定的坐标
     * @param  {maptalks.Coordinate} coordinate 指定的坐标
     * @member maptalks.Map
     * @expose
     */
    panTo:function(coordinate) {
        //TODO 动画
        var projection = this._getProjection();
        var p = projection.project(new Z.Coordinate(coordinate));
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
        //TODO 动画
        if (Z.Util.isNumber(offset.left) && Z.Util.isNumber(offset.top) && (offset.left !==0 || offset.top !== 0)) {
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
