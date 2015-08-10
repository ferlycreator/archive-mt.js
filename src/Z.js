var Z = window['Z'] = Z || {};

Z.DEBUG=true;

Z.loadModule=function(module,callback,context) {
    var suffix = '.min.js';
    if (Z.DEBUG) {
        suffix = '.js';
    }
    var url = Z.host+'/engine/js/build/v2/modules/'+module+suffix;
    Z.Util.Ajax.getScript(url,function() {
            callback.call(context);
        });
};
