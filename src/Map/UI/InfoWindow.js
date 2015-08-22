Z['InfoWindow'] = Z.InfoWindow = Z.Class.extend({

        /**
        * 异常信息定义
        */
        exceptionDefs:{
            'en-US':{
                'MUST_PROVIDE_OBJECT':'You must provide object which infowindow add to.'
            },
            'zh-CN':{
                'MUST_PROVIDE_OBJECT':'必须提供添加信息框的对象。'
            }
        },

        statics:{
           'template': "<div class=\"MAP_CONTROL_api MAP_CONTROL_msg\" style=\"z-index:10;cursor:default;display:none;padding:0 0 35px 15px;\">"+
                        "<div style=\"width:345px; height:auto !important;height:150px;min-height:150px; border:1px solid #999; background:#fff;\">"+
                            "<div style=\"font-size:14px; height:30px; line-height:30px; background:#f9f9f9; border-bottom:1px solid #ccc; font-weight:bold; padding-left:15px;\">" +
                                "<span style=\"display:block; float:left;\"></span>" +
                                '<div style="position:relative;float:right;height:30px;width:20px;padding-top:10px;line-height: 0px;">'+
                                    "<a href=\"javascript:void(0)\" class=\"MAP_CONTROL_close\" onclick=\"this.parentNode.parentNode.parentNode.parentNode.m.hide()\"><img width=\"10px\" height=\"10px\" src=\""+Z.host+"/engine/images/tip_close.gif\" style=\"border:none;\"/></a>" +
                                '</div>'+
                            "</div>"+
                            "<div style=\"padding:10px; line-height:20px; color:#444\">"+
                            "</div>"+
                        "</div>"+
                        "<div class=\"MAP_CONTROL_api MAP_CONTROL_jiantou\"></div>"+
                        //"<div style=\"position:absolute;top:0px;left:0px;z-index:10;\"><img src=\""+seegoo.maps.config.host+"/engine/images/shadow.png\" style=\"border:none;\"/></div>"+
                     "</div>"
        },

        /**
        * 初始化信息窗口
        * @return {InfoWindow}
        */
        initialize:function (tipOption) {
            if(tipOption) {
                this.setOption(tipOption);
            }
            return this;
        },

        /**
        * 将信息框添加到对象上
        * @param {Object} map/geometry
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
            return this;
        },

        /**
        * 显示信息窗口前
        * @param 参数
        */
        beforeOpen: function(param) {
            var beforeopenFn = this.tipOption['beforeopen'];
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
            if (!this.map) {
                return;
            }
            this.map._panels.tipContainer.innerHTML = Z.InfoWindow['template'];
            this.tipDom = this.map._panels.tipContainer.childNodes[0];
            this.tipDom["m"] = this;
            this.msgBox = this.tipDom.childNodes[0].childNodes[1];
            //onmousedown事件解决弹出框内容无法选中的问题
            if(!this.msgBox.addEvent) {
                this._removeEvent();
                Z.DomUtil.addDomEvent(this.msgBox,'mousedown', this.stopPropagation);
                Z.DomUtil.addDomEvent(this.msgBox,'dblclick', this.stopPropagation);
                this.map.on('zoomstart', this._onZoomStart, this);
                this.map.on('zoomend', this._onZoomEnd, this);
                this.msgBox.addEvent = true;
            }
        },

        /**
        * 菜单监听地图的事件
        * @param {Map} map
        */
        _removeEvent:function() {
            Z.DomUtil.removeDomEvent(this.msgBox,'mousedown', this.stopPropagation);
            Z.DomUtil.removeDomEvent(this.msgBox,'dblclick', this.stopPropagation);
            this.map.off('zoomstart', this._onZoomStart, this);
            this.map.off('zoomend', this._onZoomEnd, this);
        },

        stopPropagation: function(event) {
            Z.DomUtil.stopPropagation(event);
        },

        _onZoomStart:function() {
            this.map._panels.tipContainer.style.display='none';
        },

        _onZoomEnd:function() {
            if (this.visible) {
                //style.display=''必须要在调用 offsetTipDom之前, 要不然tipDom.clientHeight和clientWidth取到的值为0
                this.map._panels.tipContainer.style.display='';
                this.offsetTipDom();
            }
        },

        /**
        * 设置InfoWindow窗口
        * @param {Array} tipOption 项
        * {"items":[], width:240, beforeopen:fn}
        * @expose
        */
        setOption: function(tipOption) {
            if (!tipOption) {
                return;
            }
            if(this.tipOption) {
                this.tipOption['title'] = tipOption['title'];
                this.tipOption['content'] = tipOption['content'];
                if(tipOption['beforeopen']) {
                    this.tipOption['beforeopen'] = tipOption['beforeopen'];
                }
            } else {
                this.tipOption = tipOption;
            }
        },

        /**
        * 隐藏信息框
        * @expose
        */
        hide:function() {
            this.visible = false;
            this.tipDom.style.display="none";
        },

        /**
         * 判断信息框是否打开
         * @expose
         * @returns {Boolean}
         */
        isOpen:function() {
            return this.visible;
        },

        /**
        * 显示信息框
        * @expose
        * @param {Coordinate} 信息框打开坐标
        */
        show:function(coordinate) {
            if (!this.map) {
                return;
            }
            if (!this.map.options['enableInfoWindow']) return;
            this.hide();
            this.visible = true;
            var map = this.map;
            var tipDom = this.tipDom;
            tipDom.style.display='';
            this.map._panels.tipContainer.style.display='';
            var tipOption = this.tipOption;
            if (tipOption['width']) {
                tipDom.childNodes[0].style.width = tipOption['width']+'px';
            }
            var titleNode = tipDom.childNodes[0].childNodes[0].childNodes[0];
            var contentNode =tipDom.childNodes[0].childNodes[1];
            if (tipOption['title']) {
                titleNode.style.display = '';
                titleNode.innerHTML = tipOption['title'];
            } else {
                titleNode.style.display = 'none';
            }
            if (tipOption['content']) {
                contentNode.innerHTML = tipOption['content'];
            }

            var tipCoord = this.offsetTipDom(coordinate);
            var size = this.map.getSize();
            var mapWidth = size['width'],
                mapHeight = size['height'];
            if (0 === mapWidth || 0 === mapHeight) {return;}
            //只有当tip不是地图打开的时候，才做tip打开滑动操作
            var absolute = map._domOffsetToScreen(tipCoord);
            var left = 0;
            var top=0;
            if ((absolute["left"])<0) {
                left=-(absolute["left"]-parseInt(tipDom.clientWidth)/2);
            } else if ((absolute["left"]+parseInt(tipDom.clientWidth)-35)>mapWidth) {
                left=(mapWidth-(absolute["left"]+parseInt(tipDom.clientWidth)*3/2));
            }
            if (absolute["top"]<0) {
                top=-absolute["top"]+10;
            } else if (absolute["top"] > mapHeight){
                top = (mapHeight-absolute["top"]-parseInt(tipDom.clientHeight))-30;
            }

            if (top !== 0 || left !== 0) {
                this.tipSlidingExecutor = map._animatePan({"left":left,"top":top});
            }
            return this;
        },

        /**
        * 获取信息框打开位置
        * @param {Coordiante} 信息框对象所在坐标
        * @return {Pixel} 信息框打开位置
        */
        offsetTipDom: function(coordinate) {
            var pxCoord = this._getShowPosition(coordinate);
            var tipDom = this.tipDom;
            var tipCoord = {
                'top':parseInt(pxCoord.top-parseInt(tipDom.clientHeight)),
                'left':parseInt(pxCoord.left-parseInt(tipDom.clientWidth)/2+38)
            };
            tipDom['style']['top'] = tipCoord["top"]+"px";
            tipDom['style']['left'] = tipCoord["left"]+"px";
            return tipCoord;
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
                if(coordinate instanceof Z['Coordinate']) {
                    position = this.coordinateToScreenPoint(coordinate);
                } else {
                    position = coordinate;
                }
            } else {
                var center = this.target.getCenter();
                var projection = this.map._getProjection();
                if (!center || !projection) return null;
                var pcenter = projection.project(center);
                var geoTipPos = this.map._untransformToOffset(pcenter);
                position = {
                    'left': geoTipPos['left'],
                    'top' : geoTipPos['top']
                };
            }
            return position;
        }
});