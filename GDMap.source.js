/**
 * Created by Richie on 3/28/14.
 */
if (typeof WAIMAICOS == "undefined") WAIMAICOS = {};
WAIMAICOS.GDMap = function (a) {
    this.options = $.extend({
            center:[116.404, 39.915],
            zoom:10,
            container:"map"
        },
        a);
    this.overlay = this.GdMap = null;
    this.wrap = $("#" + this.options.container)//.parent();
    this.mouseTool=null;
    this.init();

};

WAIMAICOS.GDMap.prototype = {
    init:function () {
        this.createMap();
        return this;
    },
    createMap:function () {
        this.GdMap = new AMap.Map(this.options.container,{center:new AMap.LngLat(this.options.center[0],this.options.center[1]),  level:this.options.zoom});
    },
    addToolBar:function(){
        var mapnow=this.getMap();
        mapnow.plugin(["AMap.ToolBar"],function(){
            //加载工具条
            var tool = new AMap.ToolBar();
            mapnow.addControl(tool);
        });
        return this;
    },
    drawPlygon:function(PlygonOptions,callback){
        var mapnow=this.getMap();
        var mousetool=this.mouseTool;
        mapnow.plugin(["AMap.MouseTool"],function(){
            mousetool = new AMap.MouseTool(mapnow);
            mousetool.polygon(PlygonOptions);
            AMap.event.addListener(mousetool,"draw",function(e){
                var drawObj = e.obj;  //obj属性就是绘制完成的覆盖物对象。
                var pointsCount = e.obj.getPath().length; //获取节点个数
                var polygonPath=e.obj.getPath();
                //alert(polygonPath);
                //console.log(polygonPath);
                if(callback){
                    callback(e,drawObj);
                }
                //添加编辑控件
                mapnow.plugin(["AMap.PolyEditor"], function() {
                    editorTool = new AMap.PolyEditor(mapnow, drawObj);
                    editorTool.open();
                });

                mousetool.close(false);
                return drawObj;
                // document.getElementById('resultInfo').innerHTML ="多边形节点数："+pointsCount+"<br>节点坐标："+e.obj.getPath();
            });
        });
    },
    showPlygon:function(){

    },
    showRadius:function(){

    },
    addMarkerinCenter:function(){

    },
    getMap:function(){
        return this.GdMap;
    },
    addMarker:function (poi,imageUrl){
        if(!imageUrl){
            imageUrl="http://waimai.sankuai.com/static/img/poi_marker.png";
        }
        poiMarker=new AMap.Marker({
            icon:new AMap.Icon({//定制图标
                size:new AMap.Size(36,36),//图标大小
                image:imageUrl, //大图地址
                imageOffset:new AMap.Pixel(0,0)//相对于大图的取图位置
            }),
            draggable:false,
            position:new AMap.LngLat(poi['lng'],poi['lat'])
        });
        console.log('ok');
        poiMarker.setMap(this.GdMap);  //在地图上添加点
        return this;
    }
}
