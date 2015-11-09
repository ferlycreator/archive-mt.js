var MonitorPropertyPanel = function(){

};

MonitorPropertyPanel.prototype = {
    /**
     * 打开label属性面板
     */
    addTo: function(imageMarker) {
        this._imageMarker = imageMarker;
        var symbol = this._imageMarker.getSymbol();
        this._width = symbol['markerWidth'];
        this._height = symbol['markerHeight'];
        this._dx = symbol['markerDx'];
        this._dy = symbol['markerDy'];
        this._map = this._imageMarker.getMap();
        this._layer = this._imageMarker.getLayer();
        this._panel = this._getPanelByKey(imageMarker);
        if(!this._panel) {
            this._panel = this._createPanel();
            this._registEvent();
            this._putPanelInMap(imageMarker, this._panel);
        }
        this._panel.show();
    },

    /**
     *显示label属性面板
     */
    show: function() {
        this._panel.show();
    },

    /**
     *隐藏label属性面板
     */
    hide: function() {
        this._panel.hide();
    },

    _registEvent: function() {
        var me = this;
        this._map.on('moving zoomend', this._setPanelPosition, this)
                 .on('movestart', this.hide, this);

        this._imageMarker.on('positionchanged', this._setPanelPosition, this)
                       .on('dragstart', this.hide, this)
                       .on('dragend', this.show, this);
    },

    _removeEvent: function() {
        var me = this;
        this._map.off('moving zoomend', this._setPanelPosition, this)
                 .off('movestart', this.hide, this);

        this._imageMarker.off('positionchanged', this._setPanelPosition, this)
                    .off('dragstart', this.hide, this)
                    .off('dragend', this.show, this);
    },

    _setPanelPosition: function() {
        this._panel.setPosition(this._getViewPoint());
    },

    _getViewPoint: function() {
        var mapOffset = this._map.offsetPlatform();
        var viewPoint = this._map.coordinateToViewPoint(this._imageMarker.getCenter())
                            .substract({left:this._width/2-this._dx,top:-5-this._dy})
                            .add(mapOffset);
        return viewPoint;
    },

    _createPanel: function() {
        var viewPoint = this._getViewPoint();
        var me = this;

        var bufferDom = this._createBufferDom();
        var panel = new maptalks.Toolbar({
            position : viewPoint,
            vertical : false,
            //工具项
            items: [{
                type : 'button',
                icon: '../../business/route/images/trash.png',
                click : function(){
                    if(confirm('您确认要删除该文本标签！')){
                        me._removeEvent();
                        me._imageMarker.remove();
                        me._panel.remove();
                    }
                }
            }, {
               type : 'button',
               content: bufferDom,

           }, {
                type : 'button',
                icon: '../../business/route/images/close.png',
                click : function(){
                    me._panel.hide();
                }
            }]
        });
        panel.addTo(this._map);
        return panel;
    },

    _createBufferDom: function() {
        var bufferDom = maptalks.DomUtil.createEl('input');
        bufferDom.style.cssText = 'border:1px solid #333;font-weight:bold;font-size:16px;width:50px;height:18px;color:#333';
        bufferDom.type='text';
        bufferDom.maxLength = 4;
        bufferDom.value = 500;
        var me = this;
        //添加默认缓冲区
        var bufferSymbol = {
            'lineColor' : '#d74555',
            'lineWidth' : 3,
            'lineOpacity' : 1,
            'lineDasharray' :[],
            'polygonFill': '#d74555',
            'polygonOpacity': 0.2
        };
        maptalks.DomUtil.on(bufferDom, 'blur', function(param){
            var target = param.target;
            var bufferValue = parseInt(target.value);
            // me._polygon.setSymbol(symbol);
            topoQuery.buffer({
                geometries:[me._imageMarker ],
                distance:bufferValue,
                success: function(geometries){
                    for(var i=0,len=geometries.length;i<len;i++) {
                        var geo = geometries[i];
                        geo.setSymbol(bufferSymbol);
                        //多边形属性面板
                        var polygonPropertyPanel = new PolygonPropertyPanel();
                        //绑定激活多边形属性面板事件
                        geo.on('click', function(){
                            polygonPropertyPanel.addTo(geo);
                        });
                    }
                    me._layer.addGeometry(geometries);
                }
            });
        });
        return bufferDom;
    },

    _putPanelInMap: function(key, value) {
        if(!this._panelMap) this._panelMap = {};
        this._panelMap[key] = value;
    },

    _getPanelByKey: function(key) {
        if(this._panelMap) {
            return this._panelMap[key];
        }
        return false;
    }
};
