Z['Control']['Toolbar'] = Z.Control.Toolbar = Z.Control.extend({

    /**
    * 异常信息定义
    */
    exceptionDefs: {
        'en-US':{
            'NEED_ID':'You must set id to Toolbar Control.'
        },
        'zh-CN':{
            'NEED_ID':'您需要为Toolbar控件设置id。'
        }
    },

	options:{
		'position' : {
			'bottom': '0',
			'right': '0'
		}
	},

	statics: {

	},

	buildOn: function (map) {
		this._toolbarContainer = Z.DomUtil.createEl('div');
        Z.DomUtil.on(this._toolbarContainer, 'mousedown mousemove dblclick contextmenu', Z.DomUtil.stopPropagation);
		return this._toolbarContainer;
	}
});