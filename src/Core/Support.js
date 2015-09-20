(function(){
    //解析host地址，插入css和vml定义
    var head= document.getElementsByTagName('head')[0];

    var headChildren = head.childNodes;
    var viewPortMeta = null;
    for (var i=0, len = headChildren.length;i<len;i++) {
        if ("meta" === headChildren[i].nodeName.toLowerCase()) {
            var metaName = (headChildren[i].getAttribute?headChildren[i].getAttribute("name"):null);
            if ("viewport" === metaName) {
                viewPortMeta = headChildren[i];
            }
        }
    }

    //根据script查找
    Z.prefix = '';
    var scriptTags = document.getElementsByTagName('script');
    var regex = /[\/^]maptalks(?:\.min)?\.js/;
    for (var i = 0, len = scriptTags.length; i < len; i++) {
        var src = scriptTags[i].src || '';
        if (src.match(regex)) {
            var p = src.split(regex)[0];
            Z.prefix = p ? p + '/' : '';
            Z.host = new Z.Host(Z.prefix);
            break;
        }
    }

    if (Z.Browser.mobile) {
        if (viewPortMeta === null) {
            viewPortMeta=document.createElement('meta');
            viewPortMeta.setAttribute("viewport");
            viewPortMeta.setAttribute("content","user-scalable=no");
            head.appendChild(viewPortMeta);
        } else {
            var viewPortContent = viewPortMeta.getAttribute("content");
            if (viewPortContent.indexOf("user-scalable=no") < 0) {
                viewPortMeta.setAttribute("content",viewPortContent+",user-scalable=no");
            }
        }
    }

    var controlStyle=document.createElement('link');
    controlStyle.href=Z.prefix+"css/maptalks.css";
    controlStyle.rel='stylesheet';
    controlStyle.type='text/css';
    head.appendChild(controlStyle);

    //ie插入vml定义
    if (Z.Browser.ielt9) {
        //chrome frame meta标签
        var cfMeta = document.createElement('meta');
        cfMeta.setAttribute("http-equiv","X-UA-Compatible");
        cfMeta.setAttribute("content","IE=edge,chrome=1");
        head.appendChild(cfMeta);
        //<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    }
    if (!window['JSON']) {
        var script = document.createElement("script");
        script['type'] = "text/javascript";
        script['src'] = Z.prefix + "lib/json3.min.js";
        head.appendChild(script);
    }
})();

Z.Url = function(prefix) {
    this.prefix = prefix;
    var parts = this.prefix.split('/');
    var hostIndex = 2;
    if (this.prefix.indexOf('http') < 0) {
        hostIndex = 0;
    }
    var hostport = parts[hostIndex];
    var hostParts = hostport.split(':');
    this.host = hostParts[0];
    if (hostParts.length > 1) {
        this.port = hostParts[1];
    } else {
        this.port = 80;
    }
};

Z.Url.prototype = {
    getHost:function() {
        return this.host;
    },

    getPort:function() {
        return this.port;
    }
};