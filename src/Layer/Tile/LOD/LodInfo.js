Z['LodInfo']={
    'crs3857':{
        'projection':'ESPG:3857', //gcj02 | gcj02ll | 4326 | 3857 | bd09
        'maxZoomLevel':18,
        'minZoomLevel':1,
        'resolutions':[
            156543.0339,
            78271.51695,
            39135.758475,                                             
            19567.8792375,
            9783.93961875,
            4891.969809375,
            2445.9849046875,
            1222.99245234375,
            611.496226171875,
            305.7481130859375,
            152.87405654296876,
            76.43702827148438,
            38.21851413574219,
            19.109257067871095,
            9.554628533935547,
            4.777314266967774,
            2.388657133483887,
            1.1943285667419434,
            0.5971642833709717
        ],
        'origin': {
            "top":20037508.34,
            "left":-20037508.34,
            "bottom":-20037508.34,
            "right":20037508.34
        },
        'tileSize':{
            'width':256,
            'height':256
        }
    },
    'globalmercator':{
        'projection':'ESPG:3857', //gcj02 | gcj02ll | 4326 | 3857 | bd09
        'maxZoomLevel':18,
        'minZoomLevel':1,
        'resolutions':[
            156543.0339,
            78271.51695,
            39135.758475,
            19567.8792375,
            9783.93961875,
            4891.969809375,
            2445.9849046875,
            1222.99245234375,
            611.496226171875,
            305.7481130859375,
            152.87405654296876,
            76.43702827148438,
            38.21851413574219,
            19.109257067871095,
            9.554628533935547,
            4.777314266967774,
            2.388657133483887,
            1.1943285667419434,
            0.5971642833709717
        ],
        'origin': {
            "top":20037508.34,
            "left":-20037508.34,
            "bottom":-20037508.34,
            "right":20037508.34
        },
        'tileSize':{
            'width':256,
            'height':256
        }
    },
    'baidu':{
        'projection':'BAIDU',
        'maxZoomLevel':19,
        'minZoomLevel':1,
        'resolutions':(function() {
            var res = Math.pow(2,18);
            var resolutions = [];
            for (var i = 0; i < 20; i++){
                resolutions[i] = res;
                res *= 0.5;
            }
            return resolutions;
        })(),
        'origin':{
            "top":33554432,
            "left":-33554432,
            "bottom":-33554432,
            "right":33554432
        },
        'tileSize':{
            'width':256,
            'height':256
        }
    }
};

//其他类似google地图结构的地图lodinfo的初始化
// Z['LodInfo']['mapabc']={};
// Z.Util.extend(Z['LodInfo']['mapabc'],Z['LodInfo']['google']);
// Z['LodInfo']['mapabc']['getTileUrl']=function(x,y,z) {
//  return "http://emap"+Math.round(Math.random()*(3-1)+1)+".mapabc.com/mapabc/maptile?&x=" + x + "&y=" + y + "&z=" + z;
// };
