Z.Geometry.include({
    /**
     * 设置Geometry的信息提示框设置
     * @param {Object} options 信息提示框设置
     * @member maptalks.Geometry
     * @expose
     */
    setInfoWindow:function(options) {
        if(this.getMap()) {
            this._bindInfoWindow(options);
        } else {
            this.on('addend', function() {
                this._bindInfoWindow(options);
            });
        }
        return this;

    },

    _bindInfoWindow: function(options) {
        this.map = this.getMap();
        this._infoWindow = new Z.InfoWindow(options);
        this._infoWindow.addTo(this);
        /*
        var beforeopenFn = options.beforeOpen;
        if(beforeopenFn) {
            this._beforeOpenInfoWindow();
        }*/
        return this;
    },

    /**
    * 信息窗口打开前
    */
    /*_beforeOpenInfoWindow: function() {
        var coordinate = this.getCenter();
        var position = this.getPostion();
        var param = {'coordinate':coordinate, 'pixel':position};
        this._infoWindow.options['position'] = position;
        this._infoWindow.beforeOpen(param);
        return this;
    },*/

    /**
     * 获取Geometry的信息提示框设置
     * @return {Object} 信息提示框设置
     * @member maptalks.Geometry
     * @expose
     */
    getInfoWindow:function() {
        if (!this._infoWindow) {return null;}
        return this._infoWindow;
    },

    /**
     * 打开geometry的信息提示框
     * @param  {Coordinate} coordinate 提示框位置,可以为空
     * @member maptalks.Geometry
     * @expose
     */
    openInfoWindow:function(coordinate) {
        if (this._infoWindow) {
            this._infoWindow.show(coordinate);
        }
        return this;
    },

    /**
     * 关闭Geometry的信息提示框
     * @member maptalks.Geometry
     * @expose
     */
    closeInfoWindow:function() {
        if (this._infoWindow) {
            this._infoWindow.hide();
        }
        return this;
    }

});
