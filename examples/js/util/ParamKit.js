var ParamKit = function(){
	
};

ParamKit.prototype = {
	/**
	 * 获取url参数,para为参数名
	 */
	getParameterStr : function(key){
		var url = window.location.href;
		var ret = this._getQuery(url, key);
		if (ret != null && this._endWith(ret,"#")) {
			ret = ret.substring(0,ret.length-1);
		}
		if (ret == "undefined") {
			return null;
		}
		return ret;
	},
	_getQuery : function(str,name)
	{
		var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
		var r = str.substr(str.indexOf("\?")+1).match(reg);
		if (r!=null) return r[2]; return null;
	},
	_endWith : function(thisStr,str){     
	    var reg = new RegExp(str+"$");     
	    return reg.test(thisStr);        
	}
};