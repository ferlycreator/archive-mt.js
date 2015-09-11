var Z = window['Z'] = Z || {};

Z.VERSION='2.0.0-dev';

Z.DEBUG=true;

Z.loadModule=function(module,callback,context) {
    var suffix = '.min.js';
    if (Z.DEBUG) {
        suffix = '.js';
    }
    var url = Z.prefix+'lib/'+module+suffix;
    Z.Util.Ajax.getScript(url,function() {
            callback.call(context);
        });
};
