/**
 * 文本基础工具类
 * @class maptalks.Util
 * @author Maptalks Team
 */
Z.StringUtil = {
    /**
     * 全局替换字符
     * @param {String} str 字符串
     * @param {String} replaceStr 被替换的字符串
     * @param {String} newStr 替换的字符串
     * @return {String} 处理后的字符串
     */
    replaceAll: function (str, replaceStr, newStr) {
        var reg = new RegExp(replaceStr, 'g');
        return str.replace(reg, newStr);
    },

    /**
     * 去除字符串某位空格
     * @param {String} str 字符串
     * @return {String} 处理后的字符串
     */
    trim: function (str) {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    },

    /**
     * 分割字符串
     * @param {String} str 字符串
     * @return {String} 处理后的字符串
     */
    splitWords: function (str) {
        return Z.StringUtil.trim(str).split(/\s+/);
    },

    /**
     * 获取字符串长度
     * @param {String} str 字符串
     * @return {Number} 长度
     */
    /*getLength : function(str) {
        var len = 0;
        for (var i = 0; i < str.length; i++) {
            var a = str.charAt(i);
            if (a.match(/[^\x00-\xff]/ig) != null) {
                len += 2;
            } else {
                len += 1;
            }
        }
        return len;
    },*/

    /**
     * 获取文本像素尺寸
     * @param {String} text 文本
     * @param {String} font 字体
     * @param {String} fontSize 字体大小
     * @return {maptalks.Size} size对象
     */
    stringLength:function(text, font, fontSize) {
        //TODO 该函数在非浏览器环境下无法执行
        var ruler = Z.StringUtil._getStrRuler();
        ruler.style.fontFamily = font;
        ruler.style.fontSize = fontSize+'px';
        ruler.style.fontWeight = 'bold';
        ruler.innerHTML = text;
        return new Z.Size(ruler.clientWidth, ruler.clientHeight);
    },

    _getStrRuler:function(){
        if (!Z.StringUtil._strRuler) {
            var span = document.createElement("span");
            span.style.cssText="position:absolute;left:-10000px;top:-10000px;";
            document.body.appendChild(span);
            Z.StringUtil._strRuler = span;
        }

        return Z.StringUtil._strRuler;
    },

    _strRuler:null,

    /**
     * 根据长度分割文本
     * @param {String} content 文本
     * @param {Number} textLength 文本长度
     * @param {Number} size 字符大小
     * @param {Number} wrapWidth 限定宽度
     * @return {String[]} 分割后的字符串数组
     */
    splitContent: function(content, textLength, size, wrapWidth) {
        if(!Z.Util.isString(content)) {
            content = String(content);
        }
        var rowNum = Math.ceil(textLength/wrapWidth);
        var fontSize = parseInt(wrapWidth/size);
        var result = [];
        for(var i=0;i<rowNum;i++) {
            if(i < rowNum -1 ) {
                result.push(content.substring(i*fontSize, (i+1)*fontSize));
            } else {
                result.push(content.substring(i*fontSize));
            }
        }
        return result;
    },
    /**
     * 获取属性值替换后的文本内容
     * @param {String} str 包含替换符的文本
     * @param {Object} props 属性值对
     * @return {String} 替换后的文本
     */
    content: function (str, props) {
        if (!Z.Util.isObject(props)) {
            return str;
        }
        return str.replace(Z.StringUtil._contentExpRe, function (str, key) {
            var value = props[key];
            if (Z.Util.isNil(value)) {
                return str;
            }
            return value;
        });
    },

    _contentExpRe: /\[([\w_]+)\]/g,

    /**
     * 将文本marker分割成数组
     * @param {String} text 文本内容
     * @param {Object} style textMarker样式
     * @return {Object} 分割后的文本信息{rowNum: rowNum, textSize: textSize, rows: textRows};
     */
    splitTextToRow: function(text, style) {
        var font = Z.Util.getValueOrDefault(style['textFaceName'],'arial');
        var fontSize = Z.Util.getValueOrDefault(style['textSize'],12);
        var lineSpacing = Z.Util.getValueOrDefault(style['textLineSpacing'],0);
        var rawTextSize = Z.StringUtil.stringLength(text,font,fontSize);
        var textWidth = rawTextSize['width'];
        var textHeight = rawTextSize['height'];
        var wrapChar = Z.Util.getValueOrDefault(style['textWrapCharacter'],null);
        var wrapWidth = style['textWrapWidth'];
        if(!wrapWidth || wrapWidth > textWidth) {wrapWidth = textWidth;}
        var textRows = [];

        if(wrapChar&&text.indexOf(wrapChar)>=0){
            var texts = text.split(wrapChar);
            //wrapWidth = textWidth/texts.length;
            for(var i=0,len=texts.length;i<len;i++) {
                var t = texts[i];
                //TODO stringLength是个比较昂贵的操作, 需降低其运行频率
                var tSize = Z.StringUtil.stringLength(t,font,fontSize);
                var tWidth = tSize['width'];
                if(tWidth>wrapWidth) {
                    var contents = Z.StringUtil.splitContent(t, tWidth, fontSize, wrapWidth);
                    for (var ii = 0; ii < contents.length; ii++) {
                        textRows.push({'text':contents[ii],'size':Z.StringUtil.stringLength(contents[ii],font,fontSize)});
                    }
                } else {
                    textRows.push({'text':t,'size':tSize});
                }
            }
        } else {
            if(textWidth>wrapWidth) {
                var splitted = Z.StringUtil.splitContent(text, textWidth, fontSize, wrapWidth);
                for (var iii = 0; iii < splitted.length; iii++) {
                    textRows.push({'text':splitted[iii],'size':Z.StringUtil.stringLength(splitted[iii],font,fontSize)});
                }
            } else {
                textRows.push({'text':text,'size':rawTextSize});
            }
        }
        var rowNum = textRows.length;
        var textSize = new Z.Size(wrapWidth, textHeight*rowNum+lineSpacing*(rowNum-1));
        return {'total': rowNum, 'size': textSize, 'rows': textRows, 'rawSize':rawTextSize};
    },

    /**
     * 根据对齐方式和给定的size值, 计算偏移量
     * @param  {Size} size                [description]
     * @param  {String} horizontalAlignment [description]
     * @param  {String} verticalAlignment   [description]
     * @return {[type]}                     [description]
     */
    getAlignPoint:function(size, horizontalAlignment, verticalAlignment) {
        var width = size['width'], height = size['height'];
        var alignW, alignH;
        if (horizontalAlignment === 'left') {
            alignW = -width;
        } else if (horizontalAlignment === 'middle') {
            alignW = -width/2;
        } else if (horizontalAlignment === 'right') {
            alignW = 0;
        }
        if (verticalAlignment === 'top') {
            alignH = -height;
        } else if (verticalAlignment === 'middle') {
            alignH = -height/2;
        } else if (verticalAlignment === 'bottom') {
            alignH = 0;
        }
        return new Z.Point(alignW, alignH);
    }
};