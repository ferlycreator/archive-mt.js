Z.GeometryExt.InfoWindow={
    /**
     * 设置Geometry的信息提示框设置
     * @param {Object} tipOption 信息提示框设置
     * @export
     */
    setInfoWindow:function(tipOption) {
        this.map = this.getMap();
        this.infoWindow = new Z.InfoWindow(tipOption);
        this.infoWindow.addTo(this);
        var beforeopenFn = tipOption['beforeopen'];
        if(beforeopenFn) {
            this._beforeOpenInfoWindow();
        }
        return this;
    },

    /**
    * 信息窗口打开前
    */
    _beforeOpenInfoWindow: function() {
        var coordinate = this.getCenter();
        var position = this.getPostion();
        var param = {'coordinate':coordinate, 'pixel':position};
        this.infoWindow.tipOption['showPosition'] = position;
        this.infoWindow.beforeOpen(param);
        return this;
    },

    /**
     * 获取Geometry的信息提示框设置
     * @return {Object} 信息提示框设置
     * @export
     */
    getInfoWindow:function() {
        if (!this.infoWindow) {return null;}
        return this.infoWindow;
    },

    /**
     * 打开geometry的信息提示框
     * @param  {Coordinate} coordinate 提示框位置,可以为空
     * @export
     */
    openInfoWindow:function(coordinate) {
        this.infoWindow.show(coordinate);
    },

    /**
     * 关闭Geometry的信息提示框
     * @export
     */
    closeInfoWindow:function() {
        if (this.infoWindow) {
            this.infoWindow.hide();
        }
    }

};