/**
* 菜单类定义各种菜单
*/
Z['Menu'] = Z.Menu = Z.Class.extend({
    /**
    * 异常信息定义
    */
    exceptionDefs:{
        'en-US':{
            'ONLY_MAP_OR_GEOMETRY_CAN_ADD_MENU':'The menu only can add to  map or geometry.'
        },
        'zh-CN':{
            'ONLY_MAP_OR_GEOMETRY_CAN_ADD_MENU':'只有Map或Geometry对象才能添加菜单。'
        }
    },

    statics:{
        'template': "<div style=\"position:absolute;cursor:pointer;display:none;width:130px; background:#F0F0F0; color:#3C7796; border:solid 1px #CCCCCC; \"><ul style=\"list-style:none; padding:0px; margin:0px;\">" +
            "</ul></div>",
        'cssMenuItem': "padding:0; display:block; margin:1px; height:24px; line-height:24px;color:#3C7796; font-size:12px; padding:0px 0px 0px 21px;",
        'cssMenuItem_over': "border:solid 1px #CCCCCC; padding:0; display:block; margin:1px; height:22px; line-height:22px; color:#3C7796; font-size:12px; padding:0px 0px 0px 20px;"
    },

    /**
    * 初始化Menu
    * @param {Json} menuOption
    * menuOption:{"items":[], width:240, beforeopen:fn, showPostion:{coordinate/piexl}}
    * @return {Menu} menu
    */
    initialize: function(menuOption) {
        if(menuOption) {
            this.setOption(menuOption);
        }
        return this;
    },

    /**
    * 将菜单添加到目标对象上
    * @param {Object} map/geometry
    * @expose
    */
    addTo: function(target) {
        var map;
        if(target instanceof Z['Map']) {
            map = target;
        } else { //Geometry的情况
            map = target.getMap();
        }
        if(!map) {
            throw new Error(this.exceptions['ONLY_MAP_OR_GEOMETRY_CAN_ADD_MENU']);
        }
        this.target = target;
        this._addEvent(map);
        return map;
    },

    /**
    * 显示菜单前
    * @param 参数
    */
    beforeOpen: function(param) {
        var beforeopenFn = this.menuOption['beforeopen'];
        if(beforeopenFn){
            var argLen = beforeopenFn.length;
            if(argLen == 2) {
                beforeopenFn(param, Z.Util.bind(this.show, this));
            } else {
                beforeopenFn(param);
                this.show();
            }
        }
        return this;
    },

    /**
    * 菜单监听地图的事件
    * @param {Map} map
    */
    _addEvent:function(map) {
        this.map = map;
        this.map._panels.popMenuContainer.innerHTML = Z['Menu']['template'];
        this.menuDom = this.map._panels.popMenuContainer.firstChild;
        if(!this.menuDom.addEvent) {
            this.close();
            this._removeEvent(map);
            map.on('zoomstart', this.hide, this);
            map.on('zoomend', this.hide, this);
            map.on('movestart', this.hide, this);
            map.on('dblclick', this.hide, this);
            map.on('click', this.hide, this);
            this.menuDom.addEvent = true;
        }
    },

    /**
    * 菜单监听地图的事件
    * @param {Map} map
    */
    _removeEvent:function(map) {
        map.off('zoomstart', this.hide);
        map.off('zoomend', this.hide);
        map.off('movestart', this.hide);
        map.off('dblclick', this.hide);
        map.off('click', this.hide);
    },

    /**
    * 设置Map的右键菜单
    * @param {Array} menuOption 菜单项
    * {"items":[], width:240, beforeopen:fn}
    * @expose
    */
    setOption: function(menuOption) {
        if (!menuOption) {
            return;
        }
        if (!menuOption['width']) {
            menuOption['width'] = 240;
        }
        if(this.menuOption) {
            this.menuOption['width'] = menuOption['width'];
            this.menuOption['items'] = menuOption['items'];
            if(menuOption['beforeopen']) {
                this.menuOption['beforeopen'] = menuOption['beforeopen'];
            }
        } else {
            this.menuOption = menuOption;
        }
    },

    /**
    * 设置菜单项目
    * @param {Array} menuItems 菜单项
    * @return {Menu} 菜单
    * @expose
    */
    setItems: function(items) {
        this.menuOption['items'] = items;
        return this;
    },

   /**
    * 返回Map的菜单设置
    * @return {Object} 菜单设置
    * @expose
    */
    getOption: function() {
        return this.menuOption;
    },

    /**
     * 关闭Map的右键菜单
     * @return {[type]} [description]
     * @expose
     */
    close:function() {
        return this.hide();
    },

    /**
     * 移除Map的右键菜单设置
     * @expose
     */
    remove:function() {
        this.hide();
        delete this.menuOption;
        return this;
    },

    /**
    * 隐藏菜单
    * @expose
    */
    hide: function() {
        if (this.isOpen()) {
            this.menuDom.style.display="none";
            if (this.hasListeners && this.hasListeners('closemenu')) {
                /**
                 * 右键菜单关闭事件
                 * @event closemenu
                 * @param target {seegoo.maps.Geometry} 产生事件的Geometry
                 */
                this._executeListeners('closemenu',{"target":this});
            }
        }
    },

    /**
    *  判断菜单是否打开
    *  @expose
    *  @returns {Boolean}
    */
    isOpen:function() {
        return (this.menuDom.style.display!="none");
    },

    /**
    * 显示菜单
    * @expose
    * @param {Coordinate} 坐标
    */
    show:function(coordinate) {
        var menuOption = this.menuOption;
        var pxCoord = this._getShowPosition(coordinate);
        if (Z.Util.isNil(pxCoord) || Z.Util.isNil(menuOption)) {return;}
        this._clearDomAndBindEvent();
        this.hide();
        var me = this;
        var menuDom = me.menuDom;
        menuDom.style.width = menuOption['width']+'px';
        var ulDom = menuDom.firstChild;
        ulDom.innerHTML = '';
        var items = menuOption['items'];
        for (var i=0, len=items.length;i<len;i++) {
            var item = items[i];
            var menuItem = Z.DomUtil.createEl('li');
            menuItem.style.cssText = Z.Menu['cssMenuItem'];
            Z.DomUtil.removeDomNode(menuItem,'mouseover',function(e){
                this.style.cssText = Z.Menu['cssMenuItem_over'];
            });
            Z.DomUtil.removeDomNode(menuItem,'mouseout',function(e){
                this.style.cssText = Z.Menu['cssMenuItem'];
            });
            menuItem['callback'] = item['callback'];
            menuItem['index'] = i;
            Z.DomUtil.removeDomNode(menuItem,'click',function(e) {
                Z.DomUtil.stopPropagation(e);
                var result = this['callback']({'target':me,'index':this['index']});
                if (!Z.Util.isNil(result) && !result) {
                    return;
                }
                me.hide();
            });
            Z.DomUtil.removeDomNode(menuItem,'mousedown',function(e) {
                Z.DomUtil.stopPropagation(e);
                return false;
            });
            Z.DomUtil.removeDomNode(menuItem,'mouseup',function(e) {
                Z.DomUtil.stopPropagation(e);
                return false;
            });
            Z.DomUtil.removeDomNode(menuItem,'dblclick',function(e) {
                Z.DomUtil.stopPropagation(e);
                return false;
            });
            menuItem.innerHTML = item['item'];
            ulDom.appendChild(menuItem);
        }
        //添加菜单项
        menuDom['style']['top'] = pxCoord['top']+'px';
        menuDom['style']['left'] = pxCoord['left']+'px';
        menuDom.style.display = '';
        if (me.hasListeners && me.hasListeners('openmenu')) {
            /**
             * 右键菜单打开事件
             * @event openmenu
             * @param target {seegoo.maps.Geometry} 产生事件的Geometry
             */
            me.fire('openmenu',{'target':me});
        }
        return this;
    },

    /**
    * 清理之前的事件，并绑定新的事件
    */
    _clearDomAndBindEvent: function() {
        var firstChild = this.map._panels.popMenuContainer.firstChild;
        Z.DomUtil.removeDomNode(firstChild);
        this._addEvent(this.map);
    },


    /**
    * 获取菜单显示位置
    * @param {Coordinate} 菜单显示位置
    * @return {Pixel} 菜单显示位置像素坐标
    */
    _getShowPosition: function(coordinate) {
        var position;
        if(!coordinate) {
            coordinate = this.showPosition;
        }
        if(coordinate){
            if(coordinate instanceof Z.Coordinate) {
                position = this.coordinateToScreenPoint(coordinate);
            } else {
                position = coordinate;
            }
        } else {
            var center = this.target.getCenter();
            var projection = this.map._getProjection();
            if (!center || !projection) {return null;}
            var pcenter = projection.project(center);
            position = this.map._transformToOffset(pcenter);
        }
        return position;
    }

});
