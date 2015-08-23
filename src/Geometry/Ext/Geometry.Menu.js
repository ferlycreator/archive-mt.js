Z.Geometry.include({
    /**
    * 设置Geometry的菜单
    * @param {Array} menuOption 菜单项
    * {"items":[], width:240, beforeopen:fn}
    * @expose
    */
    setMenu: function(menuOption) {
        this.map = this.getMap();
        this.menu = new Z.Menu(menuOption);
        this.menu.addTo(this);
        var beforeopenFn = menuOption['beforeopen'];
        if(beforeopenFn) {
            this._beforeOpenMenu();
        }
        return this;
    },

    /**
    * 菜单打开前
    */
    _beforeOpenMenu: function() {
        var coordinate = this.getCenter();
        var position = this.map.coordinateToScreenPoint(coordinate);
        var param = {'coordinate':coordinate, 'pixel':position};
        this.menu.showPosition = position;
        this.menu.beforeOpen(param);
        return this;
    },

    /**
    * 打开geometry菜单
    * @param {Coordinate} 坐标
    * @expose
    */
    openMenu: function(coordinate) {
        if(!coordinate) {
            coordinate = this.showPostion;
        }
        this.menu.show(coordinate);
    },

    /**
    * 添加菜单项目
    * @param {Array} 菜单项数组
    * @expose
    */
    setMenuItem: function(items) {
        this.menu.setItems(items);
        return this;
    },

    /**
    * 关闭geometry菜单
    * @expose
    */
    closeMenu: function() {
        if(this.menu) {
            this.menu.close();
        }
    }
});
