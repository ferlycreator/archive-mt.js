Z.Handler = Z.Class.extend({
	includes: Z.Eventable,

	initialize: function (map) {
		this.map = map;
	},

	/**
	 * 激活Handler
	 */
	enable:function(){
		this.addHooks();
	},

	/**
	 * 取消激活Handler
	 */
	disable:function(){
		this.removeHooks();
	}
});