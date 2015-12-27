Z.Control.Toolbar = Z.Control.extend({

    options:{
        'position' : Z.Control['top_right'],
        'items'     : {
            //default buttons
        }
    },

    buildOn: function (map) {
        this._map = map;
        var dom = Z.DomUtil.createEl('div');
        var ul = Z.DomUtil.createEl('ul','maptalks-toolbar-hx');
        dom.appendChild(ul);

        if(this.options['vertical']) {
            Z.DomUtil.addClass(dom, 'maptalks-toolbar-vertical');
        } else {
            Z.DomUtil.addClass(dom, 'maptalks-toolbar-horizonal');
        }
        var me = this;
        function onButtonClick(fn, index, childIndex) {
            return function(e) {
                    Z.DomUtil.stopPropagation(e);
                    return fn({'target':me, 'index':index, 'childIndex': childIndex});
                }
        }
        function onMenuHover(index) {
            return function(e) {
                    if (dom._childrenMenu) {
                        return;
                    }
                    var menuDom = Z.DomUtil.createEl('div','maptalks-dropMenu');
                    menuDom.appendChild(Z.DomUtil.createEl('em','maptalks-ico'));
                    var menuUL = Z.DomUtil.createEl('ul');
                    menuDom.appendChild(menuUL);
                    var children = me._getItems()[index]['children'];
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        var li = Z.DomUtil.createEl('li');
                        li.innerHTML = '<a href="javascript:;">'+child['item']+'</a>'
                        li.style.cursor = 'pointer';
                        Z.DomUtil.on(li,'mouseout',Z.DomUtil.stopPropagation);
                        Z.DomUtil.on(li.childNodes[0],'click',(onButtonClick)(child['click'], index, i));
                        menuUL.appendChild(li);
                    }
                    Z.DomUtil.on(menuDom,'mouseout',function(e) {
                        //TODO mouseout解决不完美, 鼠标移出menuDom时, mouseout并不能随时响应
                        if (e.target.nodeName.toLowerCase() === 'div') {
                            Z.DomUtil.removeDomNode(menuDom);
                            delete dom._childrenMenu;
                        }
                    });
                    this.appendChild(menuDom);
                    dom._childrenMenu = menuDom;
                }
        }
        var items = this.options['items'];
        if(Z.Util.isArrayHasData(items)) {
            for(var i=0,len=items.length;i<len;i++) {
                var item = items[i];
                var li = Z.DomUtil.createEl('li');
                li.innerHTML = item['item'];
                li.style.cursor='pointer';
                if (item['click']) {
                    Z.DomUtil.on(li,'click',(onButtonClick)(item['click'], i, null));
                }
                if (Z.Util.isArrayHasData(item['children'])) {
                    Z.DomUtil.on(li,'mouseover',(onMenuHover)(i));
                }
                ul.appendChild(li);
            }
        }
        return dom;
    },

    _getItems:function() {
        return this.options['items'];
    }
});
