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
        'autoPan'   : true,
        'width'     : 300,
        'custom'    : false,
        'title'     : '',
        'content'   : '',
        'offset'    : null
    },

    /**
     * 初始化信息窗口
     * @constructor
     * @param {Object} options
     * @return {maptalks.InfoWindow}
     */
    initialize:function(options) {
        Z.Util.setOptions(this,options);
    },

    /**
     * 将信息框添加到对象上
     * @param {maptalks.Map} map/geometry
     */
    addTo: function(target) {
        if(target instanceof Z.Map) {
            this._map = target;
        } else { //Geometry
            this._map = target.getMap();
        }
        this._target = target;
        this._registerEvent();
        return this;
    },

    getTarget:function() {
        return this._target;
    },

    setContent:function(content) {
        this.options['content'] = content;
        if (this.isOpen()) {
            delete this._map._infoWindow['dom'];
            this.show(this._coordinate);
        } else if (this._isOnStage()) {
            delete this._map._infoWindow['dom'];
        }
        return this;
    },

    getContent:function() {
        return this.options['content'];
    },

    setTitle:function(title) {
        this.options['title'] = title;
        if (this.isOpen()) {
            delete this._map._infoWindow['dom'];
            this.show(this._coordinate);
        } else if (this._isOnStage()) {
            delete this._map._infoWindow['dom'];
        }
        return this;
    },

    getTitle:function() {
        return this.options['title'];
    },

    /**
     * 移除infoWindow设置
     * @expose
     */
    remove: function() {
        this.hide();
        this._map.off('_zoomstart', this._onZoomStart, this);
        this._map.off('_zoomend', this._onZoomEnd, this);
        delete this._target;
        delete this._map;
        return this;
    },

    /**
     * 隐藏信息框
     * @expose
     */
    hide:function() {
        if (!this._target) {
            return;
        }
        if (this.isOpen()) {
            this._getDOM().style.display = 'none';
        }
    },

    /**
     * 判断信息框是否打开
     * @returns {Boolean} true|false
     * @expose
     */
    isOpen:function() {
        return this._isOnStage() && this._getDOM().style.display !== 'none';
    },

    /**
     * get pixel size of the infowindow
     * @return {[type]} [description]
     */
    getSize:function() {
        if (this._size) {
            return this._size.copy();
        } else {
            return null;
        }
    },

    /**
     * 显示infoWindow
     * @param {maptalks.Coordinate} 坐标
     * @expose
     */
    show: function(coordinate) {
        if (!this._target) {
            return;
        }
        this.fire('showstart');
        this._prepare();
        var anchor = this._getAnchor(coordinate),
            mapSize = this._map.getSize();
        var mapWidth = mapSize['width'],
            mapHeight = mapSize['height'];

        var dom = this._getDOM();
        dom.style.position = 'absolute';
        dom.style.left = anchor.x+'px';
        dom.style.top = anchor.y+'px';
        dom.style.display="";

        if (this.options['autoPan']) {
            //pan map if
            var containerPoint = this._map._viewPointToContainerPoint(anchor);
            var size = this.getSize(),
                clientWidth = dom.clientWidth,
                clientHeight = dom.clientHeight;
            var left=0,top=0;
            if ((containerPoint.x)<0) {
                left=-(containerPoint.x-parseInt(clientWidth)/2);
            } else if ((containerPoint.x+parseInt(clientWidth)-35)>mapWidth) {
                left=(mapWidth-(containerPoint.x+parseInt(clientWidth)*3/2));
            }
            if (containerPoint.y<0) {
                top=-containerPoint.y+50;
            } else if (containerPoint.y>mapHeight){
                top = (mapHeight-containerPoint.y-parseInt(clientHeight))-30;
            }
            if (top!==0 || left!==0) {
                this._map._panAnimation(new Z.Point(left,top),600);
            }
        }
        this._target.fire('showend');
        return this;
    },

    _prepare:function() {
        if (this._isOnStage() && this._map._infoWindow['dom']) {
            return;
        }
        var container = this._map._panels.tipContainer;
        container.innerHTML = '';
        this._map._infoWindow =  {
            'target' : this
        };
        var dom = this._map._infoWindow['dom'] = this._createDOM();
        Z.DomUtil.on(dom, 'mousedown dblclick', Z.DomUtil.stopPropagation);
        dom.style.position = 'absolute';
        dom.style.left = -99999+'px';
        dom.style.top = -99999+'px';
        container.appendChild(dom);
        this._size = new Z.Size(dom.clientWidth+6, dom.clientHeight);
        dom.style.display = "none";
    },

    //get anchor of infowindow to place
    _getAnchor: function(_coordinate) {
        var position;
        var coordinate = _coordinate;
        this._coordinate = _coordinate;
        if(!coordinate) {
            coordinate = this._target.getCenter();
        }
        var size = this.getSize();
        var anchor = this._map.coordinateToViewPoint(new Z.Coordinate(coordinate));
        anchor = anchor.add(new Z.Point(-size['width']/2, -size['height']));
        var offset = this.options['offset']?new Z.Point(this.options['offset']):null;
        if (offset) {
            anchor = anchor.add(offset);
        }
        if (!_coordinate && (this._target instanceof Z.Marker)) {
            var markerSize = this._target.getSize();
            anchor = anchor.add(new Z.Point(0, -markerSize['height']-20));
        }
        return anchor;
    },

    _isOnStage:function() {
        return (this._map._infoWindow && this._map._infoWindow['target'] == this);
    },

    _getDOM:function() {
        return this._map._infoWindow['dom'];
    },

    _getWidth:function() {
        var defaultWidth = 300;
        var width = this.options['width'];
        if (!width) {
            width = defaultWidth;
        }
        return width;
    },

    _createDOM: function(){
        if (this.options['custom']) {
            return this.options['content'];
        } else {
            var dom = Z.DomUtil.createEl('div');
            dom.className = 'maptalks-msgBox';
            dom.style.width = this._getWidth()+'px';
            var content = '<em class="maptalks-ico"></em>';
            if (this.options['title']) {
                content += '<h2>'+this.options['title']+'</h2>';
            }
            content += '<a href="javascript:;" onclick="this.parentNode.style.display=\'none\';" '+
            ' class="maptalks-close"></a><div class="maptalks-msgContent">'+this.options['content']+'</div>';
            dom.innerHTML = content;
            return dom;
        };
    },

    _registerEvent:function() {
        this._map.on('_zoomstart', this._onZoomStart, this);
        this._map.on('_zoomend', this._onZoomEnd, this);
    },

    _onZoomStart:function() {
        if (this.isOpen()) {
            this._getDOM().style.left = -99999+'px';
            this._getDOM().style.top = -99999+'px';
        }
    },

    _onZoomEnd:function() {
        if (this.isOpen()) {
            var anchor = this._getAnchor(this._coordinate);
            this._getDOM().style.left = anchor.x+'px';
            this._getDOM().style.top = anchor.y+'px';
        }
    }
});
