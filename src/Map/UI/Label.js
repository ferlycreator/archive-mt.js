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
            'NEED_GEOMETRY':'You must set target to Label.'
        },
        'zh-CN':{
            'NEED_GEOMETRY':'你必须设置Label绑定的Geometry目标。'
        }
    },

    /**
     * @cfg {Object} options label属性
     */
    options: {
        'symbol': {
            'lineColor': '#ffffff',
            'lineWidth': 1,
            'lineOpacity': 0.9,
            'lineDasharray': null,
            'fill': '#4e98dd',
            'fillOpacity': 0.9,

            'textFaceName': 'arial',
            'textSize': 12,
            'textFill': '#ebf2f9',
            'textOpacity': 1,
            'textSpacing': 30,
            'textWrapWidth': 100,
            'textWrapBefore': false,
            'textWrapCharacter': '',
            'textLineSpacing': 8
        },
        'draggable': true,
        'content': '',
        'trigger': '',//click|hover
        'horizontalAlignment': 'middle',//left middle right
        'verticalAlignment': 'middle',//top middle bottom
        'dx': 0,
        'dy': 0
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
        this.textStyle = this._translateTextStyle();
        this.strokeAndFill = this._translateStrokeAndFill();
        this.textContent = this.options['content'];
        var style = this.options.symbol;
        this.textSize = Z.Util.stringLength(this.textContent, style['textFaceName'],style['textSize']);
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
        this._geometry = geometry;
        if(!this._geometry) {throw new Error(this.exceptions['NEED_GEOMETRY']);}
        this._registerEvent();
    },

    _registerEvent: function() {
        this._label = this._createLabel();
        this.hide();
        this._geometry.on('shapechanged positionchanged symbolchanged', Z.Util.bind(this._changeLabelPosition, this), this)
                      .on('remove', this.removeLabel, this);

        var trigger = this.options['trigger'];
        var me = this;
        if(trigger === 'hover') {
            this._geometry.on('mouseover', function showLabel() {
                 me.show();
             }, this)
             .on('mouseout', function hideLabel() {
                setTimeout(function(){
                    me.hide();
                }, 1000);
             }, this);
        } else if(trigger === 'click') {
            this._geometry.on('click', function showLabel() {
                 me.show();
             }, this);
        } else {
            this.show();
        }
        if(this.options['draggable']) {
            this._label.startDrag();
        }
        this._geometry.getLayer().addGeometry(this._label.getGeometries());
        return this;
    },

    /**
     * 获取label端点数组
     */
    getVertexs: function() {
        var points = [];
        var painter = this._label._getPainter();
        var textSize = painter.measureTextMarker();
        var width = 0,
            height = 0;
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
        var placement = this.options['symbol']['vertical-alignment'];
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
        var geometries = this._label.getGeometries();
        for(var i=0,len=geometries.length;i<len;i++) {
            var geometry = geometries[i];
            geometry.setCoordinates(this._geometry.getCenter());
        }
    },

    _createLabel: function() {
        var center = this._geometry.getCenter();
        var textMarker = new Z.Marker(center);
        var box = new Z.Marker(center);

        var style = this.options.symbol;
        var font = style['textFaceName'];
        var fontSize = style['textSize'];
        var textWidth = Z.Util.stringLength(this.textContent,font,fontSize).width;
        var wrapWidth = style['textWrapWidth'];
        var wrapChar = style['textWrapCharacter'];
        var lineSpacing = style['textLineSpacing'];
        if(!wrapWidth) wrapWidth = textWidth;
        var rowNum = 1;
        if(wrapChar) {
            var texts = this.textContent.split(wrapChar);
            var textRows = [];
            for(var i=0,len=texts.length;i<len;i++) {
                var t = texts[i];
                var textWidth = Z.Util.stringLength(t,font,fontSize).width;
                if(textWidth>wrapWidth) {
                    var contents = Z.Util.splitContent(t, textWidth, fontSize, wrapWidth);
                    textRows = textRows.concat(contents);
                } else {
                    textRows.push(t);
                }
            }
            rowNum = textRows.length;
        } else {
            if(textWidth>=wrapWidth){
                rowNum = Math.ceil(textWidth/wrapWidth);
            }
        }
        var height = rowNum*(fontSize+lineSpacing);

        var hAlign = this.options['horizontalAlignment'];
        var dx=this.options['dx'],dy=this.options['dy'];
        textMarker.setSymbol(this.textStyle);
        if (hAlign === 'right') {
            dx += wrapWidth/2;
        } else if (hAlign === 'middle') {
            dx += 0;
        } else {
            dx += -wrapWidth/2;
        }

        var vAlign = this.options['verticalAlignment'];
        if (vAlign === 'top') {
            dy += -height/2;
        } else if (vAlign === 'middle') {
            dy += 0;;
        } else {
            dy += height/2;
        }
        this.strokeAndFill['markerDx'] = dx;
        this.strokeAndFill['markerDy'] = dy;
        this.strokeAndFill['markerWidth'] = wrapWidth;
        this.strokeAndFill['markerHeight'] = height;
        box.setSymbol(this.strokeAndFill);
        return new Z.GeometryCollection([box,textMarker]);
    },

    _translateTextStyle: function() {
        var symbol = this.options.symbol;
        var result = {
            'textName': this.options['content'],
            'textFaceName': Z.Util.setDefaultValue(symbol['textFaceName'],'arial'),
            'textSize': Z.Util.setDefaultValue(symbol['textSize'],12),
            'textFill': Z.Util.setDefaultValue(symbol['textFill'],'#ebf2f9'),
            'textOpacity': Z.Util.setDefaultValue(symbol['textOpacity'],1),
            'textSpacing': Z.Util.setDefaultValue(symbol['textSpacing'],0),
            'textWrapWidth': symbol['textWrapWidth'],
            'textWrapBefore': Z.Util.setDefaultValue(symbol['textWrapBefore'],false),
            'textWrapCharacter': symbol['textWrapCharacter'],
            'textLineSpacing': Z.Util.setDefaultValue(symbol['textLineSpacing'],0),
            'textHorizontalAlignment' : Z.Util.setDefaultValue(this.options['horizontalAlignment'],'middle'),
            'textVerticalAlignment'   : Z.Util.setDefaultValue(this.options['verticalAlignment'],'middle'),
            'textAlign'               : Z.Util.setDefaultValue(symbol['textAlign'],'center'),
            'textDx': Z.Util.setDefaultValue(this.options['dx'],0),
            'textDy': Z.Util.setDefaultValue(this.options['dy'],0)
        };
        return result;
    },

    _translateStrokeAndFill:function() {
        var symbol = this.options.symbol;
        var result = {
            'markerType': 'square',
            'markerLineColor': Z.Util.setDefaultValue(symbol['lineColor'],'#ffffff'),
            'markerLineWidth': Z.Util.setDefaultValue(symbol['lineWidth'],1),
            'markerLineOpacity': Z.Util.setDefaultValue(symbol['lineOpacity'],0.9),
            'markerLineDasharray': symbol['lineDasharray'],
            'markerFill':  Z.Util.setDefaultValue(symbol['fill'],'#4e98dd'),
            'markerFillOpacity':  Z.Util.setDefaultValue(symbol['fillOpacity'],0.9)
        };
        return result;
     }

});
