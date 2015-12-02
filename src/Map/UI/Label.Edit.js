Z.Label.include({
    /**
     * 开始编辑Label
     * @member maptalks.Label
     * @expose
     */
    startEditText: function() {
        //隐藏label标签
        this.hide();
        this._prepareEditor();
        this.editing = true;
    },

    _prepareEditor:function() {
        this._symbol = this.getSymbol();
        this._map = this.getMap();
        var viewPoint = this._computeViewPoint();
        this._container = Z.DomUtil.createEl('div');
        this._container.style.cssText='position:absolute;top:'+viewPoint['y']
                                    +'px;left:'+viewPoint['x']+'px;z-index:5000;';
        this._map._panels.mapPlatform.appendChild(this._container);
        this._textEditor = this._createInputDom();
        this._container.appendChild(this._textEditor);
    },

    _computeViewPoint: function() {
        var labelSize = this.getSize();
        var width = labelSize['width'];
        var height = labelSize['height'];
        this._symbol = this.getSymbol();
        var left = Z.Util.getValueOrDefault(this._symbol['textDx'],0),
            top = Z.Util.getValueOrDefault(this._symbol['textDy'],0);
            var hAlign = this._symbol['textHorizontalAlignment'];
            if (hAlign === 'left') {
                left -= width;
            } else if (hAlign === 'middle') {
                left -= width/2;
            }

            var vAlign = this._symbol['textVerticalAlignment'];
            if (vAlign === 'top') {
                top -= (height);
            } else if (vAlign === 'middle') {
                top -= height/2;
            } else {
                top -= rowHeight;
            }
        var viewPoint = this._map.coordinateToViewPoint(this.getCenter()).add({x:left,y:top});
        return viewPoint;
    },

    _createInputDom: function() {
        var labelSize = this.getSize();
        var width = labelSize['width'];
        var height = labelSize['height'];
        var textColor = this._symbol['textFill'];
        var textSize = this._symbol['textSize'];
        var fill = this._symbol['markerFill'];
        var lineColor = this._symbol['markerLineColor'];
        var spacing = Z.Util.getValueOrDefault(this._symbol['textLineSpacing'],0);
        var inputDom = Z.DomUtil.createEl('textarea');
        inputDom.style.cssText ='background:'+fill+';'+
            'border:1px solid '+lineColor+';'+
            'color:'+textColor+';'+
            'font-size:'+textSize+'px;'+
            'width:'+(width-spacing)+'px;'+
            'height:'+(height-spacing)+'px;';
        var content = this.getContent();
        inputDom.value = content;
        var me = this;
        Z.DomUtil.on(inputDom, 'blur', function(param){
             me.endEditText();
        });
        return inputDom;

    },

    /**
     * 结束编辑
     * @member maptalks.Label
     * @expose
     */
    endEditText: function() {
        var content = this._textEditor.value;
        this.setContent(content);
        this.show();
        Z.DomUtil.removeDomNode(this._container);
        this.editing = true;
    },

    /**
     * Label是否处于编辑状态中
     * @member maptalks.Label
     * @return {Boolean} 是否处于编辑状态
     * @expose
     */
    isEditing: function() {
        return this.editing;
    }

});
