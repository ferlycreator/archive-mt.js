/**
 * 面板控件
 * @class maptalks.Panel
 * @extends maptalks.Control
 * @mixins maptalks.Eventable
 * @author Maptalks Team
 */
Z['Panel'] = Z.Panel = Z.Control.extend({
    includes: [Z.Eventable],

    /**
     * @cfg {Object} options 面板属性
     */
    options:{
        'position' : {
            'top': '0',
            'right': '0'
        },
        'style': 'default',
        'draggable': true,
        'title': '',
        'html': true,
        'content': ''
    },

    /**
    * 隐藏panel
    * @expose
    */
    hide: function() {
        var parentDom = this._panelContainer['parentNode'];
        Z.DomUtil.setStyle(parentDom, 'display: none');
    },

    /**
    * 显示panel
    * @expose
    */
    show: function() {
        var parentDom = this._panelContainer['parentNode'];
        Z.DomUtil.setStyle(parentDom, 'display: block');
    },

    /**
    * 移除panel
    * @expose
    */
    removePanel: function() {
        this.remove();
    },

    _buildOn: function (map) {
        if(!map || !this.options || !this.options['content']) {return;}
        this._map = map;
        this._internalLayer = this._getInternalLayer(map, Z.internalLayerPrefix+'panel_link');
        this._panelContainer = Z.DomUtil.createElOn('div', 'cursor:default;');
        var divCss = 'maptalks-panel-default';
        var titleCss = 'maptalks-panel-title-default';
        var contentCss = 'maptalks-panel-content-default';
        var style = this.options['style'];
        if(style) {
            divCss = 'maptalks-panel-' + style;
            titleCss = 'maptalks-panel-title-' + style;
            contentCss = 'maptalks-panel-content-' + style;
        }
        Z.DomUtil.addClass(this._panelContainer, divCss);
        this._appendTitleDom(titleCss);
        this._appendContentDom(contentCss);
        Z.DomUtil.on(this._panelContainer, 'click dblclick contextmenu mousemove mousedown mouseup', Z.DomUtil.stopPropagation);
        if(this.options['draggable']) {
            Z.DomUtil.on(this._panelContainer, 'mousedown', this._onMouseDown, this)
                     .on(this._panelContainer, 'mouseup', this._disableMoveAndEnableDrag, this)
                     .on(this._panelContainer, 'mouseout', this._disableMove, this);
        }
        return this._panelContainer;
    },

    _appendTitleDom: function(titleCss) {
        if(this.options['title']) {
            var _titleDom = Z.DomUtil.createEl('div');
            Z.DomUtil.addClass(_titleDom, titleCss);
            _titleDom.innerHTML = this.options['title'];
            this._panelContainer.appendChild(_titleDom);
        }
    },

    _appendContentDom: function(contentCss) {
        if(this.options['content']) {
            var _contentDom = Z.DomUtil.createEl('div');
            Z.DomUtil.addClass(_contentDom, contentCss);
            if(this.options['html']) {
                _contentDom.innerHTML = this.options['content'];
            } else {
                _contentDom.innerTEXT = this.options['content'];
            }
            this._panelContainer.appendChild(_contentDom);
        }
    },

    /**
     * 获取panel端点数组
     */
    getLinkAnchors: function() {
        var points = [];
        var containerPoint = this._topLeftPoint();
        var width = this._panelContainer['clientWidth'],
            height = this._panelContainer['clientHeight'];
        var topLeftPoint = this._map.containerPointToCoordinate(containerPoint);

        var topCenterPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + Math.round(width/2),
                containerPoint['top']
            )
        );
        var topCenterBufferPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + Math.round(width/2),
                containerPoint['top'] - 20
            )
        );
        var topRightPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + width,
                containerPoint['top']
            )
        );
        var bottomLeftPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'],
                containerPoint['top'] + height
            )
        );
        var bottomCenterPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + Math.round(width/2),
                containerPoint['top'] + height
            )
        );
        var bottomCenterBufferPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + Math.round(width/2),
                containerPoint['top'] + height + 20
            )
        );
        var bottomRightPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + width,
                containerPoint['top'] + height
            )
        );
        var middleLeftPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'],
                containerPoint['top'] + Math.round(height/2)
            )
        );
        var middleLeftBufferPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] - 20,
                containerPoint['top'] + Math.round(height/2)
            )
        );
        var middleRightPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + width,
                containerPoint['top'] + Math.round(height/2)
            )
        );
        var middleRightBufferPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + width + 20,
                containerPoint['top'] + Math.round(height/2)
            )
        );
        var vertexs = [topCenterPoint,middleRightPoint,bottomCenterPoint,middleLeftPoint];
        return vertexs;
    },

    _topLeftPoint: function() {
        var parentDom = this._panelContainer['parentNode'];
        var domStyle = parentDom['style'];
        var top = Z.DomUtil.getPixelValue(domStyle['top']),
            left = Z.DomUtil.getPixelValue(domStyle['left']),
            bottom = Z.DomUtil.getPixelValue(domStyle['bottom']),
            right = Z.DomUtil.getPixelValue(domStyle['right']);
        var width = this._map._containerDOM.clientWidth,
            height = this._map._containerDOM.clientHeight;
        var panelWidth = this._panelContainer['clientWidth'],
            panelHeight = this._panelContainer['clientHeight'];
        if(left===0&&right>=0) {
            left = width-right-panelWidth;
        }
        if(top===0&&bottom>=0) {
            top = height-bottom-panelHeight;
        }
        return new Z.Point(left,top);
    },

    _onMouseDown: function(event) {
        Z.DomUtil.setStyle(this._panelContainer,'cursor: move');
        this._map.options['draggable']=false;
        Z.DomUtil.on(this._panelContainer,'mousemove',this._onMouseMove, this);
        this._startOffset = new Z.Point(parseInt(event.offsetX,0),parseInt(event.offsetY,0));
        /**
         * 触发panel的mousedown事件
         * @event mousedown
         * @return {Object} params: {'target': this, 'position': {'top':0,'left':0}}}
         */
        this.fire('mousedown',{'target': this,'position':this._startOffset});
        /**
         * 触发panel的dragstart事件
         * @event dragstart
         * @return {Object} params: {'target': this, 'position': {'top':0,'left':0}}}
         */
        this.fire('dragstart',{'target': this,'position':this._startOffset});
    },

    _onMouseMove: function(event) {
        this._endOffset = new Z.Point(parseInt(event.offsetX, 0),parseInt(event.offsetY, 0));
        var offsetTop = this._endOffset['top']-this._startOffset['top'];
        var offsetLeft = this._endOffset['left']-this._startOffset['left'];
        var parentDom = this._panelContainer['parentNode'];
        var domStyle = parentDom['style'];
        var domTop = Z.DomUtil.getPixelValue(domStyle['top']);
        var domLeft = Z.DomUtil.getPixelValue(domStyle['left']);
        var domBottom = Z.DomUtil.getPixelValue(domStyle['bottom']);
        var domRight = Z.DomUtil.getPixelValue(domStyle['right']);

        if(domTop) {
            domTop = domTop + offsetTop;
            if(domTop <= 0) {domTop = 1;}
            Z.DomUtil.setStyle(parentDom, 'top: ' + domTop+'px');
        }
        if(domLeft) {
            domLeft = domLeft + offsetLeft;
            if(domLeft <= 0) {domLeft = 1;}
            Z.DomUtil.setStyle(parentDom, 'left: ' + domLeft+'px');
        }
        if(domBottom) {
            domBottom = domBottom - offsetTop;
            if(domBottom <= 0) {domBottom = 1;}
            Z.DomUtil.setStyle(parentDom, 'bottom: ' + domBottom+'px');
        }
        if(domRight) {
            domRight = domRight - offsetLeft;
            if(domRight <= 0) {domRight = 1;}
            Z.DomUtil.setStyle(parentDom, 'right:' +  domRight+'px');
        }
        /**
         * 触发panel的dragging事件
         * @event dragging
         * @return {Object} params: {'target': this, 'position': {'top':0,'left':0}}}
         */
        this.fire('dragging',{'position': this._endOffset});
        /**
         * 触发panel的positionchanged事件
         * @event positionchanged
         * @return {Object} params: {'target': this, 'position': {'top':0,'left':0}}}
         */
        this.fire('positionchanged',{'position': this._endOffset});
    },

    _disableMoveAndEnableDrag: function() {
        this._disableMove();
        this._map.options['draggable']=true;
    },

    _disableMove: function() {
        Z.DomUtil.setStyle(this._panelContainer, 'cursor: default');
        Z.DomUtil.off(this._panelContainer, 'mousemove', this._onMouseMove, this);
        /**
         * 触发panel的mouseup事件
         * @event mouseup
         * @return {Object} params: {'target': this, 'position': {'top':0,'left':0}}}
         */
        this.fire('mouseup',{'target': this,'position':this._endOffset});
        /**
         * 触发panel的dragend事件
         * @event dragend
         * @return {Object} params: {'target': this, 'position': {'top':0,'left':0}}}
         */
        this.fire('dragend',{'position': this._endOffset});
    },

    _getInternalLayer: function(map, layerId, canvas) {
         if(!map) {return;}
         var layer = map.getLayer(layerId);
         if(!layer) {
             if(canvas) {
                 layer = new Z.VectorLayer(layerId,{'render':'canvas'});
             } else {
                 layer = new Z.VectorLayer(layerId);
             }
             map.addLayer(layer);
         }
         return layer;
     }


});
