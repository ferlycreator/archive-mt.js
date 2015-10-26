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
            'NEED_TARGET':'You must set target to Label.',
            'INVALID_TARGET': 'Target must be geometry or coordinate.'
        },
        'zh-CN':{
            'NEED_TARGET':'你必须设置Label绑定的目标。',
            'INVALID_TARGET':'绑定目标只能是geometry或coordinate。'
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
        'target': null,//Geometry or Coordinate
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
        var target = this.options['target'];
        if(!target)  {throw new Error(this.exceptions['NEED_TARGET']);}
        if(!(target instanceof Z.Geometry) && !(target instanceof Z.Coordinate)) {
            throw new Error(this.exceptions['INVALID_TARGET']);
        }
        this._target = target;
        this._refreshLabel();
        return this;
    },

    _refreshLabel: function() {
        this.textStyle = this._translateTextStyle();
        this.strokeAndFill = this._translateStrokeAndFill();
        this.textContent = this.options['content'];
        var style = this.options.symbol;
        this.textSize = Z.Util.stringLength(this.textContent, style['textFaceName'],style['textSize']);
        this.labelSize = this._getLabelSize();
        this._initLabel(this._target);
        return this;
    },

    /**
     * 获取label样式
     */
    getSymbol: function() {
        return this.options.symbol;
    },

    /**
     * 设置label样式
     */
    setSymbol: function(symbol) {
        this.options.symbol = symbol;
        this.textStyle = this._translateTextStyle();
        this.strokeAndFill = this._translateStrokeAndFill();
//        this._textMarker.setSymbol(this.textStyle);
//        this._box.setSymbol(this.strokeAndFill);
        this._refreshLabel();
        this._layer.addGeometry(this._label.getGeometries());
    },

    /**
     * 获取label内容
     */
    getContent: function() {
        return this.options['content'];
    },

    /**
     * 设置label内容
     */
    setContent: function(content) {
        this.options['content'] = content;
        this._refreshLabel();
        this._layer.addGeometry(this._label.getGeometries());
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
     * @param {maptalks.Layer} layer
     */
    addTo: function (layer) {
        if(!layer) {return;}
        this._layer = layer;
        this._map = this._layer.getMap();
        this._layer.addGeometry(this._label.getGeometries());
        return this;
    },

    _initLabel: function(targetObj) {
        if(!targetObj || !this.options || !this.options['symbol']) {return;}
        if(targetObj instanceof Z.Coordinate) {
            this._center = targetObj;
            this._label = this._createLabel(this._center);
            if(this.options['draggable']) {
                this._label.startDrag();
            }
        } else {
            this._geometry = targetObj;
            if(!this._geometry) {throw new Error(this.exceptions['NEED_GEOMETRY']);}
            this._map = this._geometry.getMap();
            this._center = this._geometry.getCenter();
            this._label = this._createLabel(this._center);
            this._registerEvent();
        }
        if(this._label) {
            var me = this;
            this._label.on('mousedown mouseover mouseout click dblclick contextmenu', function(param){
                me.fire(param.type, param);
            });
        }
    },

    _registerEvent: function() {
        this.hide();
        this._geometry.on('shapechanged positionchanged symbolchanged', Z.Util.bind(this._changeLabelPosition, this), this)
                      .on('remove', this.remove, this);
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
            var linkerOptions = {
                linkSource:this._label,
                linkTarget:this._geometry,
                trigger: 'click',
                symbol:{
                    'lineColor' : '#ff0000',
                    'lineWidth' : 1,
                    'lineDasharray' : [20,5,2,5],
                    'lineOpacity' : 1
                }
            };
            var linker = new Z.Linker(linkerOptions);
            linker.addTo(this._map);
        }
        return this;
    },

    _changeLabelPosition: function(event) {
        var geometries = this._label.getGeometries();
        for(var i=0,len=geometries.length;i<len;i++) {
            var geometry = geometries[i];
            geometry.setCoordinates(this._geometry.getCenter());
        }
    },

    _createLabel: function(center) {
        this._textMarker = new Z.Marker(center);
        this._box = new Z.Marker(center);

        var dx=this.options['dx'],dy=this.options['dy'];
        this._textMarker.setSymbol(this.textStyle);

        var width = this.labelSize['width'];
        var height = this.labelSize['height'];
        var hAlign = this.options['horizontalAlignment'];
        if (hAlign === 'right') {
            dx += width/2;
        } else if (hAlign === 'middle') {
            dx += 0;
        } else {
            dx += -width/2;
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
        this.strokeAndFill['markerWidth'] = width;
        this.strokeAndFill['markerHeight'] = height;
        this._box.setSymbol(this.strokeAndFill);
        return new Z.GeometryCollection([this._box,this._textMarker]);
    },

    _getLabelSize: function() {
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
            wrapWidth = wrapWidth/texts.length;
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
        return new Z.Size(wrapWidth, height);
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
