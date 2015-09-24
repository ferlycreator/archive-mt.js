Z.Geometry.include({
    /**
     * 设置Geometry的信息提示框设置
     * @param {Object} options 信息提示框设置
     * @member maptalks.Geometry
     * @expose
     */
    setInfoWindow:function(options) {
        if(this.getMap()) {
            this._setInfoWindow(options);
        } else {
            this.on('addend', function() {
                this._setInfoWindow(options);
            });
        }
        return this;

    },

    _setInfoWindow: function(options) {
        this.map = this.getMap();
        this.infoWindow = new Z.InfoWindow(options);
        this.infoWindow.addTo(this);
        var beforeopenFn = options.beforeOpen;
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
        this.infoWindow.options['position'] = position;
        this.infoWindow.beforeOpen(param);
        return this;
    },

    /**
     * 获取Geometry的信息提示框设置
     * @return {Object} 信息提示框设置
     * @member maptalks.Geometry
     * @expose
     */
    getInfoWindow:function() {
        if (!this.infoWindow) {return null;}
        return this.infoWindow;
    },

    /**
     * 打开geometry的信息提示框
     * @param  {Coordinate} coordinate 提示框位置,可以为空
     * @member maptalks.Geometry
     * @expose
     */
    openInfoWindow:function(coordinate) {
        this.infoWindow.show(coordinate);
    },

    /**
     * 关闭Geometry的信息提示框
     * @member maptalks.Geometry
     * @expose
     */
    closeInfoWindow:function() {
        if (this.infoWindow) {
            this.infoWindow.hide();
        }
    }

});
