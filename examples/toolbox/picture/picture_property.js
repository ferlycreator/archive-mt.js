var PicturePropertyPanel = function(){

};

PicturePropertyPanel.prototype = {
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
        this._panel = this._getPanelByKey(imageMarker);
        if(!this._panel) {
            this._panel = this._createPanel();
            this._registEvent();
            this._putPanelInMap(imageMarker, this._panel);
        }
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
        var mapOffset = this._map.offsetPlatform();
        var viewPoint = this._map.coordinateToViewPoint(this._imageMarker.getCenter())
                            .substract({left:this._width/2-this._dx,top:-5-this._dy})
                            .add(mapOffset);
        this._panel.setPosition(viewPoint);
    },

    _createPanel: function() {
        var viewPoint = this._map.coordinateToViewPoint(this._imageMarker.getCenter())
                        .substract({left:this._width/2-this._dx,top:-5-this._dy});
        var me = this;
        var panel = new maptalks.Toolbar({
            position : viewPoint,
            vertical : false,
            //工具项
            items: [{
                type : 'button',
                icon: 'trash.png',
                click : function(){
                    if(confirm('您确认要删除该文本标签！')){
                        me._removeEvent();
                        me._imageMarker.remove();
                        me._panel.remove();
                    }
                }
            }, {
                type : 'button',
                html: true,
                trigger: 'click',
                content: this._createUploadInput(),
                click : function(){

                }
            },
            /**{
                type : 'button',
                icon: 'edit.png',
                click : function(){

                }
            }, {
                type : 'button',
                icon: 'stop_edit.png',
                click : function(){

                }
            },*/
             {
                type : 'button',
                icon: 'close.png',
                click : function(){
                    me._panel.hide();
                }
            }]
        });
        panel.addTo(this._map);
        return panel;
    },

    _createUploadInput: function() {
        var aDom = maptalks.DomUtil.createEl('a');
        aDom.href='javascript:;'
        aDom.style.cssText='position:relative;display:inline-block;overflow:hidden;';
        var imageDom = maptalks.DomUtil.createEl('img');
        imageDom.border=0;
        imageDom.src = 'upload.png';
        aDom.appendChild(imageDom);
        var inputDom = maptalks.DomUtil.createEl('input');
        inputDom.style.cssText = 'background-image:url(upload.png)';
        inputDom.type = 'file';
        inputDom.accept='.gif,.jpg,.svg,.jpeg,.png';
        inputDom.style.cssText = 'position:absolute;font-size:100px;right:0;top:0;opacity:0;';
        inputDom.readOnly = true;
        aDom.appendChild(inputDom);
        var me = this;
        Z.DomUtil.on(inputDom, 'change', function(param){
            var target = param.target;
            var fileName = target.value;
            if(fileName) {
                var extName = fileName.substring(fileName.lastIndexOf('.')+1).toLowerCase();
                if('.gif,.jpg,.svg,.jpeg,.png'.indexOf(extName)<0){
                    alert('您上传的文件不合法，系统只接受后缀为：.gif,.jpg,.svg,.jpeg,.png的图形！');
                    return;
                }
            }
            var url = me._getRealPath(target);
            var symbol = me._imageMarker.getSymbol();
            symbol['markerFile'] = url;
            me._imageMarker.setSymbol(symbol);
        });
        return aDom;
    },

    _getRealPath: function(dom) {
        var realPath;
        if (dom) {
            if(dom.files &&dom.files[0]){
                realPath =  window.URL.createObjectURL(dom.files[0]);
            } else {
                dom.select();
                realPath = document.selection.createRange().text;
                document.selection.empty();
            }
        }
        return realPath;
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
