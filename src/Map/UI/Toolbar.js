/**
 * 工具栏控件
 * @class maptalks.Toolbar
 * @extends maptalks.Control
 * @author Maptalks Team
 */
Z['Toolbar'] = Z.Toolbar = Z.Control.extend({

    /**
     * @cfg {Object} options 工具栏属性
     */
	options:{
		"position" : {
			"bottom": 0,
			"right": 0
		},
		"classname": "",
		"vertical" : false,
		"items": []
	},

	_buildOn: function (map) {
		this._map = map;
		var dom = Z.DomUtil.createEl('div');
        var ul = Z.DomUtil.createEl('ul');
        dom.appendChild(ul);
		if(this.options['className']) {
			Z.DomUtil.addClass(dom, this.options['className']);
		} else {
			if(this.options['vertical']) {
				Z.DomUtil.addClass(dom, 'maptalks-toolbar-vertical');
			} else {
				Z.DomUtil.addClass(dom, 'maptalks-toolbar-horizonal');
			}
		}
		var items = this.options['items'];
		if(Z.Util.isArrayHasData(items)) {
			for(var i=0,len=items.length;i<len;i++) {
				var item = items[i];
				if(!item['hidden']) {
                    // item['vertical'] = this.options['vertical'];
                    // item['position'] = this.options['position'];
                    var buttonDom = new Z.Button(item).getDom();
                    ul.appendChild(buttonDom);
				}
			}
		}
		return dom;
	}
});
