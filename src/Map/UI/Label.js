/**
 * label控件
 * @class maptalks.Label
 * @extends maptalks.Class
 * @mixins maptalks.Eventable
 * @author Maptalks Team
 */
Z.Label = Z.Class.extend({
    includes: [Z.Eventable],

    /**
     * @cfg {Object} exceptionDefs 异常信息定义
     */
    'exceptionDefs':{
        'en-US':{
            'NEED_TARGET':'You must set target to Label.'
        },
        'zh-CN':{
            'NEED_TARGET':'你必须设置Label绑定的Geometry目标。'
        }
    },

    /**
     * @cfg {Object} options label属性
     */
    options:{
        "label-box" : "tip",
        "label-box-style": {
            'line-color': '#000000',
            'line-width': 1,
            'line-opacity': 1,
            'polygon-opacity': 1,
            'polygon-fill': '#ffffff',
            'size': 12,
            'text-fill': '#ff0000',
            'placement': 'point', //point line vertex interior
            'spacing': 30,
            'wrap-width': 100,
            'wrap-before': false,
            'wrap-character': '',
            'character-spacing': 0,
            'line-spacing': 8,
            'text-dx': 0,
            'text-dy': 0,
            'dx': 0,
            'dy': 0,
            'text-opacity': 1,
            'horizontal-alignment': 'right',//left middle right
            'vertical-alignment': 'top',//top middle bottom
            'justify-alignment': 'center'//left center right
        },
        "label-text-style" : {
            "text-face-name": "Serif",
        },
        'draggable': true,
        'trigger': 'hover'//click|hover
    },

    /**
     * 初始化Label
     * @constructor
     * @param {Object} options
     * @return {maptalks.Label}
     * @expose
     */
    initialize: function (options) {
        this.setOptions(options);
        return this;
    },

    /**
     * 设置属性
     * @param {Object} options
     * @expose
     */
    setOptions: function(options) {
        Z.Util.setOptions(this, options);
        return this;
    },

    /**
    * 隐藏label
    * @expose
    */
    hide: function() {
        this._label.hide();
        /**
         * 触发label的hide事件
         * @event hide
         * @return {Object} params: {'target': this}
         */
        this.fire('hide', {'target': this});
    },

    /**
    * 显示label
    * @expose
    */
    show: function() {
        this._label.show();
        /**
         * 触发label的show事件
         * @event show
         * @return {Object} params: {'target': this}
         */
        this.fire('show', {'target': this});
    },

    /**
    * 移除label
    * @expose
    */
    remove: function() {
        this._label.remove();
        /**
         * 触发label的remove事件
         * @event remove
         * @return {Object} params: {'target': this}
         */
        this.fire('remove', {'target': this});
    },

    /**
     * 将Label添加到对象上
     * @param {maptalks.Geometry} geometry
     */
    addTo: function (geometry) {
        if(!geometry || !this.options || !this.options['symbol']) {return;}
        this._map = geometry.getMap();
        this._labelContrainer = this._map._containerDOM;
        this._target = geometry;
        if(!this._target) {throw new Error(this.exceptions['NEED_TARGET']);}
        this._internalLayer = this._getInternalLayer(this._target);
        var targetCenter = this._target.getCenter();
        this._label = new Z.Marker(targetCenter);
        this._label.setProperties(geometry.getProperties());
        this._label['target'] = this._target;
        this._label.setSymbol(this.options['symbol']);
        this._internalLayer.addGeometry(this._label);
        this._label.hide();

        this._target.on('shapechanged positionchanged symbolchanged', Z.Util.bind(this._changeLabelPosition, this), this)
                    .on('remove', this.removeLabel, this);

        this._label.on('click dblclick rightclick', Z.DomUtil.stopPropagation, this);


        var trigger = this.options['trigger'];
        var me = this;
        if(trigger === 'hover') {
            this._target.on('mouseover', function showLabel() {
                 me.show();
                 me._map.disableDrag();
                 me._map.disableDoubleClickZoom();
             }, this)
             .on('mouseout', function hideLabel() {
                setTimeout(function(){
                    me.hide();
                    me._map.enableDrag();
                    me._map.enableDoubleClickZoom();
                }, 1000);
             }, this);
        } else if(trigger === 'click') {
            this._target.on('click', function showLabel() {
                 me.show();
                 me._map.disableDrag();
                 me._map.disableDoubleClickZoom();
             }, this);
        } else {
            this.show();
        }
        if(this.options['draggable']) {
             this._label.on('mousedown', this._onMouseDown, this)
                        .on('dragend', this._endMove, this)
                        .on('mouseout', this._recoverMapEvents, this);
        }
        return null;
    },

    /**
     * 获取label端点数组
     */
    getVertexs: function(coordinate) {
        var points = [];
        var painter = this._label._getPainter();
        var textSize = painter.measureTextMarker();
        var width = 0, //textSize['width'],
            height = 0; //textSize['height'];
        var containerPoint = this._topLeftPoint(width, height);
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

    _topLeftPoint: function(width, height) {
        var placement = this.options['symbol']['shield-vertical-alignment'];
        var center = this._label.getCenter();
        var point = this._map.coordinateToViewPoint(center);
        var mapOffset = this._map.offsetPlatform();
        if (placement === 'left') {
            return new Z.Point(
                point['left'] - width + mapOffset['left'],
                point['top'] - Math.round(height/2) + mapOffset['top']
            );
        } else if (placement === 'top') {
            return new Z.Point(
                point['left'] - Math.round(width/2) + mapOffset['left'],
                point['top'] - height + mapOffset['top']
            );
        } else if (placement === 'right') {
            return new Z.Point(
                point['left'] + mapOffset['left'],
                point['top'] - Math.round(height/2) + mapOffset['top']
            );
        } else if(placement === 'bottom') {
            return new Z.Point(
                point['left'] - Math.round(width/2) + mapOffset['left'],
                point['top'] + mapOffset['top']
            );
        } else {//center
            return new Z.Point(
                point['left'] - Math.round(width/2) + mapOffset['left'],
                point['top'] - Math.round(height/2) + mapOffset['top']
            );
        }
    },

    _changeLabelPosition: function(event) {
        this._target = event['target'];
        this._label.setCoordinates(this._target.getCenter());
    },

    _onMouseDown: function(event) {
        Z.DomUtil.setStyle(this._labelContrainer, 'cursor: move');
        this._label.startDrag();
        this._map.disableDrag();
        this._map.disableDoubleClickZoom();
        /**
         * 触发label的dragstart事件
         * @event dragstart
         * @return {Object} params: {'target': this}
         */
        this.fire('dragstart', {'target': this});
    },

    _endMove: function(event) {
        Z.DomUtil.setStyle(this._labelContrainer, 'cursor: default');
        /**
         * 触发label的dragend事件
         * @event dragend
         * @return {Object} params: {'target': this}
         */
        this.fire('dragend', {'target': this});
    },

    _recoverMapEvents: function() {
        this._map.enableDrag();
        this._map.enableDoubleClickZoom();
    },

    _getInternalLayer: function(target) {
        var layerId = Z.internalLayerPrefix+'label';
        var layer = this._map.getLayer(layerId);
        if(!layer) {
            var targetLayer = target.getLayer();
            if(targetLayer.isCanvasRender()) {
                layer = new Z.VectorLayer(layerId,{'render':'canvas'});
            } else {
                layer = new Z.VectorLayer(layerId);
            }
            this._map.addLayer(layer);
        }
        return layer;
    }

});
