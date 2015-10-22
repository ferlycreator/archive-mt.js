/**
 * 信息窗控件
 * @class maptalks.InfoWindow
 * @extends maptalks.Class
 * @author Maptalks Team
 */
Z['InfoWindow'] = Z.InfoWindow = Z.Class.extend({

    /**
     * @cfg {Object} exceptionDefs 异常信息定义
     */
    exceptionDefs:{
        'en-US':{
            'MUST_PROVIDE_OBJECT':'You must provide object which infowindow add to.'
        },
        'zh-CN':{
            'MUST_PROVIDE_OBJECT':'必须提供添加信息框的对象。'
        }
    },

    /**
     * @cfg {Object} options 信息窗属性
     */
    options: {
        'width' : 300,
        'title' : '',
        'content' : '',
        'style' : 'default',//black|white
        'position' : null,
        'beforeOpen': null
    },

    /**
     * 初始化信息窗口
     * @constructor
     * @param {Object} options
     * @return {maptalks.InfoWindow}
     */
    initialize:function (options) {
        if(options) {
            this.setOptions(options);
        }
        this._tipDom = this._createTipDom();
        return this;
    },

    /**
     * 将信息框添加到对象上
     * @param {maptalks.Map} map/geometry
     */
    addTo: function(target) {
        if(target instanceof Z.Map) {
            this._map = target;
        } else { //Geometry的情况
            this._map = target.getMap();
        }
        if(!this._map) {
            throw new Error(this.exceptions['MUST_PROVIDE_OBJECT']);
        }
        this._target = target;
        var tipContainer = this._map._panels.tipContainer;
        tipContainer.innerHTML = '';
        tipContainer.appendChild(this._tipDom);
        this._addEvent();
        return this;
    },

    /**
     * 显示信息窗口前
     * @param {Object} param 参数
     */
    beforeOpen: function(param) {
        var beforeOpenFn = this.options.beforeOpen;
        if(beforeOpenFn){
            var argLen = beforeOpenFn.length;
            if(argLen == 2) {
                beforeOpenFn(param, Z.Util.bind(this.show, this));
            } else {
                beforeOpenFn(param);
                this.show();
            }
        }
        return this;
    },

    /**
     * 设置InfoWindow窗口
     * @param {Array} options 项 {"items":[], width:240, beforeOpen:fn}
     * @expose
     */
    setOptions: function(options) {
        if (!options) {
            return;
        }
        if(!options.style||options.style === 'default') {
            options.style = '';
        } else {
            options.style = '-' + options.style;
        }
        if(this.options) {
            this.options.title = options.title;
            this.options.content = options.content;
            this.options.style = options.style;
            if(options.beforeOpen) {
                this.options.beforeOpen = options.beforeOpen;
            }
        } else {
            this.options = options;
        }
    },

    /**
     * 返回infoWindow设置
     * @return {Object} infoWindow设置
     * @expose
     */
    getOptions: function() {
        return this.options;
    },

    /**
     * 移除infoWindow设置
     * @expose
     */
    remove: function() {
        this.hide();
        delete this.options;
        return this;
    },

    /**
     * 隐藏信息框
     * @expose
     */
    hide:function() {
        this._visible = false;
        this._tipDom.style.display = 'none';
    },

    /**
     * 判断信息框是否打开
     * @returns {Boolean} true|false
     * @expose
     */
    isOpen:function() {
        return this._visible;
    },

    /**
     * 显示infoWindow
     * @param {maptalks.Coordinate} 坐标
     * @expose
     */
    show: function(coordinate) {
        var tipCoord = this._offsetTipDom(coordinate);
        var size = this._map.getSize();
        var mapWidth = size['width'],
            mapHeight = size['height'];
        if (mapWidth===0||mapHeight===0) {return;}
        //只有当tip不是地图打开的时候，才做tip打开滑动操作
        var absolute = this._map._viewPointToContainerPoint(tipCoord);
        var left=0,top=0,tipDom=this._tipDom;;
        if ((absolute['left'])<0) {
            left=-(absolute['left']-parseInt(tipDom.clientWidth)/2);
        } else if ((absolute['left']+parseInt(tipDom.clientWidth)-35)>mapWidth) {
            left=(mapWidth-(absolute['left']+parseInt(tipDom.clientWidth)*3/2));
        }
        if (absolute['top']<0) {
            top=-absolute['top']+10;
        } else if (absolute['top']>mapHeight){
            top = (mapHeight-absolute['top']-parseInt(tipDom.clientHeight))-30;
        }
        if (top!==0||left!==0) {
            this.tipSlidingExecutor = this._map._animatePan({'left':left, 'top' :top});
        }
        return this;
    },

    _createTipDom: function(){
        var tipContainer = Z.DomUtil.createEl('div');
        tipContainer.style.display = 'none';
        tipContainer.style.width = this.options.width+'px';
        var suffix = this.options.style;
        Z.DomUtil.setClass(tipContainer, 'maptalks-infowindow');
        var tipBoxDom = this._createTipBoxDom();
        tipContainer.appendChild(tipBoxDom);
        return tipContainer;
    },

    _createTipBoxDom: function() {
        var tipBoxDom = Z.DomUtil.createEl('div');
        Z.DomUtil.setClass(tipBoxDom, 'maptalks-infowindow-box');
        if (this.options.width) {
            tipBoxDom.style.width = this.options.width+'px';
        }
        tipBoxDom.appendChild(this._createHeaderDom());
        tipBoxDom.appendChild(this._createContentDom());
        tipBoxDom.appendChild(this._createArrowDom());
        return tipBoxDom;
    },

    _createHeaderDom: function() {
        var tipHeaderDom = Z.DomUtil.createEl('div');
        Z.DomUtil.setClass(tipHeaderDom, 'maptalks-infowindow-header');

        var titleDom = Z.DomUtil.createEl('span');
         Z.DomUtil.setClass(titleDom, 'maptalks-infowindow-title');
        var title = this.options.title;
        if(title) {
            titleDom.innerHTML = title;
        }
        tipHeaderDom.appendChild(titleDom);

        var closeDom = Z.DomUtil.createEl('a');
        var me = this;
        Z.DomUtil.setClass(closeDom, 'maptalks-infowindow-close');
        Z.DomUtil.addDomEvent(closeDom, 'click', function(event){
            Z.DomUtil.stopPropagation(event);
            me.hide();
        });
        var closeImage = Z.DomUtil.createElOn('img', 'border:none;');
        closeImage.src = Z.prefix+'images/tip_close.gif';
        closeDom.appendChild(closeImage);
        tipHeaderDom.appendChild(closeDom);
        return tipHeaderDom;
    },

    _createContentDom: function() {
        var contentDom = Z.DomUtil.createEl('div');
        Z.DomUtil.setClass(contentDom, 'maptalks-infowindow-content');
        var content = this.options.content;
        if(content) {
            contentDom.innerHTML = content;
        }
        return contentDom;
    },

    _createArrowDom: function() {
        var arrowDom = Z.DomUtil.createEl('div');
        Z.DomUtil.setClass(arrowDom, 'maptalks-infowindow-arrow');
        return arrowDom;
    },

    _addEvent:function() {
        if(!this._tipDom.addEvent) {
            this._removeEvent();
            Z.DomUtil.on(this._tipDom, 'mousedown dblclick', Z.DomUtil.stopPropagation);
            this._map.on('_zoomstart', this._onZoomStart, this);
            this._map.on('_zoomend', this._onZoomEnd, this);
            this._tipDom.addEvent = true;
        }
    },

    _removeEvent:function() {
        Z.DomUtil.off(this._tipDom, 'mousedown dblclick', Z.DomUtil.stopPropagation);
        this._map.off('_zoomstart', this._onZoomStart, this);
        this._map.off('_zoomend', this._onZoomEnd, this);
    },

    _onZoomStart:function() {
        this.hide();
    },

    _onZoomEnd:function() {
        if (this._visible) {
            this._tipDom.style.display='';
            this._offsetTipDom();
        }
    },

    //获取信息框打开位置
    _offsetTipDom: function(coordinate) {
        var pxCoord = this._getShowPosition(coordinate);
        var tipDom = this._tipDom;
        tipDom.style.display = '';
        var tipCoord = new Z.Point(
            parseInt(pxCoord.left-parseInt(tipDom.clientWidth+38)/2),
            parseInt(pxCoord.top-parseInt(tipDom.clientHeight))
        );
        tipDom.style.top = tipCoord.top+'px';
        tipDom.style.left = tipCoord.left+'px';
        return tipCoord;
    },

    //获取显示位置
    _getShowPosition: function(coordinate) {
        var position;
        if(!coordinate) {
            coordinate = this.position;
        }
        if(coordinate){
            if(coordinate instanceof Z.Coordinate) {
                position = this.coordinateToViewPoint(coordinate);
            } else {
                position = coordinate;
            }
        } else {
            var center = this._target.getCenter();
            position = this._map.coordinateToViewPoint(center);
        }
        return position;
    }
});
