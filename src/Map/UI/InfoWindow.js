/**
 * 信息窗控件
 * @class maptalks.InfoWindow
 * @extends maptalks.Class
 * @author Maptalks Team
 */
Z['InfoWindow'] = Z.InfoWindow = Z.Class.extend({
    includes: [Z.Eventable],

    /**
     * @cfg {Object} options 信息窗属性
     */
    options: {
        'width' : 300,
        'title' : '',
        'content' : '',
        'style' : 'default',//black|white
        'position' : null
    },

    /**
     * 初始化信息窗口
     * @constructor
     * @param {Object} options
     * @return {maptalks.InfoWindow}
     */
    initialize:function (options) {
        this.setOptions(options);
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
        this._target = target;
        var tipContainer = this._map._panels.tipContainer;
        this._tipDom = tipContainer._tipDom;
        if (!this._tipDom) {
            this._tipDom = this._createTipDom();
            tipContainer.innerHTML = '';
            tipContainer.appendChild(this._tipDom);
            tipContainer._tipDom = this._tipDom;
            Z.DomUtil.on(this._tipDom, 'mousedown dblclick', Z.DomUtil.stopPropagation);
        }
        this._registerEvent();
        return this;
    },

    /**
     * 显示信息窗口前
     * @param {Object} param 参数
     */
    /*beforeOpen: function(param) {
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
    },*/

    /**
     * 设置InfoWindow窗口
     * @param {Array} options 项 {"items":[], width:240, beforeOpen:fn}
     * @expose
     */
    setOptions: function(options) {
        if(!options) {
            options = {};
        }
        if(Z.Util.isNil(options['style'])||options['style'] === 'default') {
            options['style'] = '';
        } else {
            options['style'] = '-' + options['style'];
        }
        Z.Util.setOptions(this,options);
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
        this._removeEvent();
        // delete this.options;
        return this;
    },

    /**
     * 隐藏信息框
     * @expose
     */
    hide:function() {
        this._tipDom._vis = false;
        this._hideTipDom();
    },

    _hideTipDom:function() {
        this._tipDom.style.display = 'none';
    },

    /**
     * 判断信息框是否打开
     * @returns {Boolean} true|false
     * @expose
     */
    isOpen:function() {
        return (this._tipDom._vis && this._tipDom._target === this);
    },

    /**
     * 显示infoWindow
     * @param {maptalks.Coordinate} 坐标
     * @expose
     */
    show: function(coordinate) {
        this._tipDom._vis = true;
        this._tipDom._target = this;
        this._fillInfoWindow();
        var tipCoord = this._offsetTipDom(coordinate);
        var size = this._map.getSize();
        var mapWidth = size['width'],
            mapHeight = size['height'];
        if (mapWidth===0||mapHeight===0) {return;}
        this._target.fire('beforeopeninfowindow');
        //只有当tip不是地图打开的时候，才做tip打开滑动操作
        var absolute = this._map._viewPointToContainerPoint(tipCoord);
        var left=0,top=0,tipDom=this._tipDom;
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
        if (top!==0 || left!==0) {
            /*this._tipSlidingExecutor = */this._map._animatePan(new Z.Point(left,top));
        }
        this._target.fire('openinfowindow');
        return this;
    },

    _getTipWidth:function() {
        var defaultWidth = 300;
        var tipWidth = this.options['width'];
        if (!tipWidth) {
            tipWidth = defaultWidth;
        }
        return tipWidth;
    },

    _fillInfoWindow:function() {
        var tipWidth = this._getTipWidth();
        this._tipDom.tipBoxDom.style.width = tipWidth+'px';

        var tipTitle = this.options['title'];
        if (Z.Util.isNil(tipTitle)) {
            tipTitle = '';
        }
        this._tipDom.titleDom.innerHTML= tipTitle;

        var tipContent = this.options['content'];
        if (Z.Util.isNil(tipContent)) {
            tipContent = '';
        }
        this._tipDom.contentDom.innerHTML= tipContent;
    },

    _createTipDom: function(){
        var tipContainer = Z.DomUtil.createEl('div');
        tipContainer.style.display = 'none';
        tipContainer.style.width = this._getTipWidth();+'px';
        var suffix = this.options['style'];
        Z.DomUtil.setClass(tipContainer, 'maptalks-infowindow');

        var tipBoxDom = this._createTipBoxDom();


        var titleDom = this._createTitleDom();
        var contentDom = this._createContentDom();
        var headerDom = this._createHeaderDom();
        headerDom.appendChild(titleDom);
        tipBoxDom.appendChild(headerDom);
        tipBoxDom.appendChild(contentDom);
        tipBoxDom.appendChild(this._createArrowDom());

        tipContainer.titleDom = titleDom;
        tipContainer.contentDom = contentDom;
        tipContainer.tipBoxDom = tipBoxDom;

        tipContainer.appendChild(tipBoxDom);
        return tipContainer;
    },

    _createTipBoxDom: function() {
        var tipBoxDom = Z.DomUtil.createEl('div');
        Z.DomUtil.setClass(tipBoxDom, 'maptalks-infowindow-box');
        /*if (this.options.width) {
            tipBoxDom.style.width = this.options.width+'px';
        }*/

        return tipBoxDom;
    },

    _createTitleDom:function() {
        var titleDom = Z.DomUtil.createEl('span');
        Z.DomUtil.setClass(titleDom, 'maptalks-infowindow-title');
        /*var title = this.options.title;
        if(title) {
            titleDom.innerHTML = title;
        }*/
        return titleDom;
    },

    _createHeaderDom: function() {
        var tipHeaderDom = Z.DomUtil.createEl('div');
        Z.DomUtil.setClass(tipHeaderDom, 'maptalks-infowindow-header');
        // tipHeaderDom.appendChild(titleDom);

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
        /*var content = this.options.content;
        if(content) {
            contentDom.innerHTML = content;
        }*/
        return contentDom;
    },

    _createArrowDom: function() {
        var arrowDom = Z.DomUtil.createEl('div');
        Z.DomUtil.setClass(arrowDom, 'maptalks-infowindow-arrow');
        return arrowDom;
    },

    _registerEvent:function() {
        this._map.on('_zoomstart', this._onZoomStart, this);
        this._map.on('_zoomend', this._onZoomEnd, this);
    },

    _removeEvent:function() {
        this._map.off('_zoomstart', this._onZoomStart, this);
        this._map.off('_zoomend', this._onZoomEnd, this);
    },

    _onZoomStart:function() {
        if (this.isOpen()) {
            this._hideTipDom();
        }
    },

    _onZoomEnd:function() {
        if (this.isOpen()) {
            this._offsetTipDom();
            this._tipDom.style.display='';
        }
    },

    //获取信息框打开位置
    _offsetTipDom: function(coordinate) {
        var pxCoord = this._getShowPosition(coordinate);
        var tipDom = this._tipDom;
        tipDom.style.display = '';
        console.log(tipDom.clientWidth+','+tipDom.clientHeight);
        console.log(this.options['width']);
        var tipCoord = new Z.Point(
            parseInt(pxCoord['left']-parseInt(tipDom.clientWidth)/2+45),
            parseInt(pxCoord['top']-parseInt(tipDom.clientHeight))
        );
        tipDom.style.top = tipCoord['top']+'px';
        tipDom.style.left = tipCoord['left']+'px';

        return tipCoord;
    },

    //获取显示位置
    _getShowPosition: function(coordinate) {
        var position;
        if(!coordinate) {
            coordinate = this.position;
        }
        if(coordinate){
            if (coordinate['containerPoint']) {
                coordinate = coordinate['containerPoint'];
            }
            if(coordinate instanceof Z.Coordinate) {
                position = this._map.coordinateToViewPoint(coordinate);
            } else {
                //是point类型坐标
                position = this._map._containerPointToViewPoint(new Z.Point(coordinate['left'],coordinate['top']));
            }
        } else {
            var center = this._target.getCenter();
            position = this._map.coordinateToViewPoint(center);
            //如果是标注, 则上移infowindow, 让箭头落在marker上沿
            if (this._target instanceof Z.Marker) {
                var size = this._target.getSize();
                position._add(new Z.Point(0, -size['height']));
            }
        }

        return position;
    }
});
