var LabelPropertyPanel = function(){

};

LabelPropertyPanel.prototype = {
    /**
     * 打开label属性面板
     */
    addTo: function(label, el) {
        if(el) this._el = el;
        this._label = label;
        this._map = this._label._map;
        if(this._el.children.length===0) {
            this._panel = this._createPanel();
            el.appendChild(this._panel);
        }
        this._el.style.display='';
    },

    /**
     *隐藏label属性面板
     */
    hide: function() {
        this._el.style.display='none';
    },

    _createPanel: function() {
        var width = 160,height = 36;
        var labelHeight = this._label.strokeAndFill['markerHeight'];
        var viewPoint = this._map.coordinateToViewPoint(this._label._center).substract({left:width/2,top:(labelHeight+height)});
        var panel = maptalks.DomUtil.createEl('div');
        panel.style.cssText = 'background:#333333;padding-right:3px;position:absolute;top:'+viewPoint['top']+'px;left:'+viewPoint['left']+'px;z-index:1000;';
        //背景颜色设置部分
        var bgDom = this._createBgDom();
        panel.appendChild(bgDom);
        //边框颜色设置部分
        var borderDom = this._createBorderDom();
        panel.appendChild(borderDom);
        //文字大小
        var textSizeDom = this._createTextSizeDom();
        panel.appendChild(textSizeDom);
        //文字颜色
        var textColorDom = this._createTextColorDom();
        panel.appendChild(textColorDom);
        return panel;
    },

    _createBgDom: function() {
        var bgDom = maptalks.DomUtil.createEl('input');
        var fill = this._label.strokeAndFill['markerFill'];
        bgDom.style.cssText = 'margin:3px;border:0px;width:23px;height:23px;background-color:'+fill;
        bgDom.readOnly = true;
        return bgDom;
    },

    _createBorderDom: function() {
        var borderDom = maptalks.DomUtil.createEl('input');
        var borderColor = this._label.strokeAndFill['markerLineColor'];
        borderDom.style.cssText = 'width:20px;height:20px;background-color:#333333;border:1px solid'+borderColor;
        borderDom.readOnly = true;
        return borderDom;

    },

    _createTextSizeDom: function() {
        var textSizeDom = maptalks.DomUtil.createEl('input');
        var textSize = this._label.textStyle['textSize'];
        textSizeDom.style.cssText = 'background:#333333;border:0px;font-weight:bold;font-size:20px;width:32px;height:32px;color:#ffffff';
        textSizeDom.maxLength = 2;
        textSizeDom.value = textSize;
        return textSizeDom;
    },

    _createTextColorDom: function() {
        var textColorDom = maptalks.DomUtil.createEl('span');
        var textColor = this._label.textStyle['textFill'];
        textColorDom.style.cssText = 'width:32px;height:32px;;font-weight:bold;font-size:20px;color:'+textColor;
        textColorDom.innerText='A';
        return textColorDom;
    }

};
