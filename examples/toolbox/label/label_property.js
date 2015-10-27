var LabelPropertyPanel = function(){

};

LabelPropertyPanel.prototype = {
    /**
     * 打开label属性面板
     */
    addTo: function(label) {
        this._width = 200;
        this._height = 38;
        this._label = label;
        this._map = this._label._map;
        this._panel = this._createPanel();
        this._registEvent();
    },

    /**
     *隐藏label属性面板
     */
    hide: function() {
        this._el.style.display='none';
    },

    _registEvent: function() {
        var me = this;
        this._map.on('moving zoomend', function(){
            var viewPoint = me._map.coordinateToViewPoint(me._label._center)
                            .substract({left:me._width/2,top:-5});
            me._panel.setPosition(viewPoint);
        });
        this._label.on('positionchanged', function(param){
            var viewPoint = me._map.coordinateToViewPoint(me._label._center)
                .substract({left:me._width/2,top:-5});
            me._panel.setPosition(viewPoint);
        });
    },

    _createPanel: function() {
        // var labelHeight = this._label.strokeAndFill['markerHeight'];
        var viewPoint = this._map.coordinateToViewPoint(this._label._center).substract({left:this._width/2,top:-5});
        //背景颜色设置部分
        var bgDom = this._createBgDom();
        //边框颜色设置部分
        var borderDom = this._createBorderDom();
        //文字大小
        var textSizeDom = this._createTextSizeDom();
        //文字颜色
        var textColorDom = this._createTextColorDom();
        var me = this;

        var panel = new maptalks.Toolbar({
            position : viewPoint,
            vertical : false,
            //工具项
            items: [{
                type : 'button',
                icon : 'paint.png',
                html: true,
                content: bgDom,
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.style['background-color'];
                    maptalks.DomUtil.setStyle(bgDom, 'background-color:'+color);
                    var symbol = me._label.getSymbol();
                    symbol['fill'] = color;
                    me._label.setSymbol(symbol);
                })
            }, {
                type : 'button',
                icon: 'stroke.png',
                html: true,
                content: borderDom,
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.style['background-color'];
                    maptalks.DomUtil.setStyle(borderDom, 'background-color:'+color);
                    var symbol = me._label.getSymbol();
                    symbol['lineColor'] = color;
                    me._label.setSymbol(symbol);
                })

            }, {
                type : 'button',
                icon: 'font.png',
                html: true,
                content: textColorDom,
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.style['background-color'];
                    maptalks.DomUtil.setStyle(textColorDom, 'background-color:'+color);
                    var symbol = me._label.getSymbol();
                    symbol['textFill'] = color;
                    me._label.setSymbol(symbol);
                })

            }, {
                type : 'button',
                content: textSizeDom,

            }, {
                type : 'button',
                icon: 'edit.png',
                click : function(){
                    me._label.startEdit();
                }
            }, {
                type : 'button',
                icon: 'stop_edit.png',
                click : function(){
                    me._label.endEdit();
                }
            }, {
                type : 'button',
                icon: 'close.png',
                click : function(){
                    // me._label.remove();
                    me._panel.remove();
                }
            }]
        });
        panel.addTo(this._map);
        return panel;
    },

    _colorItems: function (callback) {
        var fn = callback;
        return [{//子菜单
            content: this._createColorSpanDom('#cc0000'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: this._createColorSpanDom('#d56a00'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: this._createColorSpanDom('#a29900'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: this._createColorSpanDom('#55a455'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: this._createColorSpanDom('#3398cc'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: this._createColorSpanDom('#663399'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: this._createColorSpanDom('#cc0066'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: this._createColorSpanDom('#333333'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }];
    },

    _createColorSpanDom: function(color) {
        var spanDom = maptalks.DomUtil.createEl('span');
        spanDom.style.cssText = 'width:50px;height:50px;background-color:'+color+';';
        spanDom.innerText = '　　';
        return spanDom;
    },

    _createBgDom: function() {
        var fillColor = this._label.strokeAndFill['markerFill'];
        return this._createColorDom(fillColor);
    },

    _createBorderDom: function() {
        var borderColor = this._label.strokeAndFill['markerLineColor'];
        return this._createColorDom(borderColor);
    },

    _createTextColorDom: function() {
        var textColor = this._label.textStyle['textFill'];
        return this._createColorDom(textColor);
    },

    _createTextSizeDom: function() {
        var textSizeDom = maptalks.DomUtil.createEl('input');
        textSizeDom.style.cssText = 'border:1px solid #333;font-weight:bold;font-size:16px;width:20px;height:18px;color:#333';
        textSizeDom.type='text';
        textSizeDom.maxLength = 2;
        var textSize = this._label.textStyle['textSize'];
        textSizeDom.value = textSize;
        var me = this;
        Z.DomUtil.on(textSizeDom, 'blur', function(param){
            var target = param.target;
            var newSize = target.value;

            var symbol = me._label.getSymbol();
            symbol['textSize'] = newSize;
            me._label.setSymbol(symbol);
        });
        return textSizeDom;
    },

    _createColorDom: function(color) {
        var colorDom = maptalks.DomUtil.createEl('input');
        colorDom.style.cssText = 'width:3px;height:15px;background-color:'+color+';border:1px solid #333';
        colorDom.readOnly = true;
        return colorDom;
    }

};
