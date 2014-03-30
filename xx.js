/**
 * Created by Richie on 3/28/14.
 */
if (typeof PGY == "undefined") PGY = {};
PGY.Map = function (a) {
    this.options = $.extend({
            center:[39.904667, 116.408198],
            zoom:10,
            container:"BaiduMapContainer"
        },
        a);
    this.overlay = this.BaiduMap = null;
    this.wrap = $("#" + this.options.container)//.parent();
    this.init();
};
PGY.Map.prototype = {
    init:function () {
        this.createMap();
    },
    createMap:function () {
        this.BaiduMap = new BMap.Map(this.options.container);
        this.BaiduMap.centerAndZoom(new BMap.Point(this.options.center[0], this.options.center[1]), this.options.zoom);
        this.BaiduMap.addControl(new BMap.NavigationControl());
        //this.BaiduMap.enableScrollWheelZoom();
    },
    clearOverlays:function () {
        this.BaiduMap.clearOverlays();
    },
    addOverlay:function(m){
        this.BaiduMap.addOverlay(m);
    }
}


function XQMarker(E, A, C, D,Aid) {
    //E:坐标点
    //A:默认显示文字
    //C:鼠标划过显示的文字
    //D:marker的id
    this._xid = D;
    this._point = E;
    this._text = A;
    this._overText = C;
    this._areaid=Aid;
}
XQMarker.prototype = new BMap.Overlay();
XQMarker.prototype.initialize = function (D) {
    this._mark = this;
    this._map = D;
    var A = this._div = document.createElement("div");
    A.id = this._xid;
    A.style.position = "absolute";
    A.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
    A.style.background = "url(http://www.sooker.com/zhuanti/label2.png) no-repeat left top";
    A.style.color = "white";
    A.style.height = "33px";
    A.style.cursor = "hand";
    A.style.paddingLeft = "8px";
    A.style.lineHeight = "18px";
    A.style.whiteSpace = "nowrap";
    A.style.MozUserSelect = "none";
    A.style.fontSize = "12px";
    A.setAttribute("position", this._point.lat + "|" + this._point.lng);
    A.setAttribute("areaid", this._areaid);
    var C = this._span = document.createElement("span");
    C.style.cursor = "pointer";
    C.style.background = "url(http://www.sooker.com/zhuanti/label3.png) no-repeat right top";
    C.style.height = "25px";
    C.style.paddingRight = "8px";
    C.style.lineHeight = "25px";
    C.style.whiteSpace = "nowrap";
    C.style.display = "block";
    A.appendChild(C);
    C.appendChild(document.createTextNode(this._text));
    var B = this;



    A.onmouseover = function () {
        //this.style.backgroundColor = "#6BADCA";
        //this.style.borderColor = "#0000ff";
        this.getElementsByTagName("span")[0].innerHTML = B._overText;
        this.style.cursor = "pointer";
        A.style.background = "url(http://www.sooker.com/zhuanti/label2.png) no-repeat left -37px";
        C.style.background = "url(http://www.sooker.com/zhuanti/label3.png) no-repeat right -45px";
        A.style.zIndex = BMap.Overlay.getZIndex(-1000);
        //E.style.backgroundPosition = "0px -20px";
        $("#list" + this.id).addClass("current")
        $("#arealist").scrollTo($("#list" + this.id), 100);

        //alert($("#list"+this.id).html());
    };
    A.onmouseout = function () {
        //this.style.backgroundColor = "#EE5D5B";
        //this.style.borderColor = "#BC3B3A";
        this.getElementsByTagName("span")[0].innerHTML = B._text ;
        A.style.background = "url(http://www.sooker.com/zhuanti/label2.png) no-repeat left top";
        C.style.background = "url(http://www.sooker.com/zhuanti/label3.png) no-repeat right top";
        A.style.zIndex = BMap.Overlay.getZIndex(1);
        //E.style.backgroundPosition = "0px 0px"
        $("#list" + this.id).removeClass("current");
    };
    A.onclick = function () {
        //alert("ok");
        //alert(this.prototype._mark)
        //alert(this.getAttribute("position"));
        /*
         document.getElementById("mappopwindow").style.display = "block";
         $("#mappopwindow").find(".info").html("ajax 获取内容" + "当前坐标:" + this.getAttribute("position"));
         $("#mappopwindow").find(".close").bind("click", function () {
         $("#mappopwindow").css({display:"none"})
         })*/
        showpopinfo.call(this,true);
    };
    D.getPanes().labelPane.appendChild(A);
    return;
};
XQMarker.prototype.draw = function () {
    var B = this._map;
    var A = B.pointToOverlayPixel(this._point);
    this._div.style.left = A.x + "px";
    this._div.style.top = A.y - 30 + "px"
};
//定义全局变量
var locMapCity = "全国",trafficStopData;
var _route_type = '1',_route_type_val=1;
var busLineNum,busLineType,taxiLineType,taxiLineNum,_driving_type=1,_driving_type_val=1;



function getblurpoi(value,type,linetype,areaname) {
    $(".map-asideB .result").html('<p><img src="http://hotel.kuxun.cn/images/ajax-loader.gif" width="32" height="32" class="loader" /><span>正在查询...</span></p>');

    //var local = new BMap.LocalSearch(map);
    var local = new BMap.LocalSearch(bdmap.BaiduMap, {
        renderOptions:{map:bdmap.BaiduMap},
        pageCapacity:7
    });
    //var num = local.getPageCapacity();//返回方案数
    local.setSearchCompleteCallback(function (results) {
        var num = results.getCurrentNumPois();
        //alert(toJSONString(results));
        if (local.getStatus() == BMAP_STATUS_SUCCESS) {
            var trafficLinesData = '';
            var stopType = '';
            var selectValue = '';
            if (type == "areato") {
                selectValue = '选为起点';
                stopType = "areaend";
                $(".map-asideB .zd").removeClass("dis").html("终点:<strong>"+areaname+"</strong>");
                $(".map-asideB .qd").addClass("dis");
                $(".map-asideB .map-asideB-title").html("请从列表中选择最合适的起点");

            } else {
                selectValue = '选为终点';
                stopType = "areastart";
                $(".map-asideB .qd").removeClass("dis").html("起点:<strong>"+areaname+"</strong>");
                $(".map-asideB .zd").addClass("dis");
                $(".map-asideB .map-asideB-title").html("请从列表中选择最合适的终点");
            }
            if (linetype == 'bus') {
                //console.log(results);
                //console.log(num);
                for (var i = 0; i < num; i++) {

                    var trafficData = results.getPoi(i);
                    // alert(trafficData);
                    // trafficLinesData += '<li style="background: url(\'markers1.png\') no-repeat scroll -21px ' + i * (-25) + 'px transparent;"><input class="xwqd" id="busTabsEnd_' + i + '" onClick="searchBus(' + i + ',\'' + stopType + '\')" value="' + selectValue + '" type="button" /><span style="padding-left:32px;">' + trafficData.title + ":" + trafficData.address + '</span></li>';
                    trafficLinesData+='<li><span class="num"  style="background: url(\'images/markers1.png\') no-repeat scroll -21px ' + i * (-25) + 'px transparent;width:23px;height:25px;"></span><div class="addinfo"><p class="area">'+trafficData.title+'</p><p class="add">地址：'+trafficData.address+'</p></div><div class="qdbtn dis"><a href="javascript:void(0)" onclick="searchbus('+i+',\''+stopType+'\')">'+selectValue+'</a></div></li>';
                    // console.log(trafficLinesData);
                }
            } else {
                for (var i = 0; i < num; i++) {
                    var trafficData = results.getPoi(i);
                    //trafficLinesData += '<li style="background: url(\'markers1.png\') no-repeat scroll -21px ' + i * (-25) + 'px transparent;"><input class="xwqd" id="taxiTabsEnd_' + i + '" onClick="searchTaxi(' + i + ',\'' + stopType + '\')" value="' + selectValue + '" type="button" /><span style="padding-left:32px;">' + trafficData.title + ":" + trafficData.address + '</span></li>';
                    trafficLinesData+='<li><span class="num"  style="background: url(\'images/markers1.png\') no-repeat scroll -21px ' + i * (-25) + 'px transparent;width:23px;height:25px;"></span><div class="addinfo"><p class="area">'+trafficData.title+'</p><p class="add">地址：'+trafficData.address+'</p></div><div class="qdbtn dis"><a href="javascript:void(0)" onclick="searchtaxi('+i+',\''+stopType+'\')">'+selectValue+'</a></div></li>';
                }
            }
            //alert(toJSONString(results));
            trafficStopData = results;
            $(".map-asideB .result").html("<ul class='list' >"+trafficLinesData+"</ul>");
            $("#popinfo").addClass("dis");
            var $mapSideBListhover = $(".map-asideB .list li");
            $mapSideBListhover.hover(function () {
                $(this).toggleClass("current")
                $(this).find(".qdbtn").toggleClass("dis")
            });

        } else {
            alert("暂无查询结果!请尝试输入其他关键词!");
            return;
        }
    });
    local.search(value);
}

function searchbus(i,type){
    //alert("测试："+i);
    busLineNum = i;
    busLineType = type;
    /*
     var infodata = mapjson[trafficHotelid];
     if(infodata == undefined){
     var infodata = mapjsonList[trafficHotelid];
     }
     */
    var maplnglat = curpoi;
    var areaName = curareaname;
    var lnglat = maplnglat.split("|");
    var lng = lnglat[1];
    var lat = lnglat[0];
    //console.log(trafficStopData);
    var selectBusData = trafficStopData.getPoi(i);
    var locname = selectBusData.title;
    var lngBus = selectBusData.point.lng;
    var latBus = selectBusData.point.lat;

    if (type == "areastart") {
        _start_lng = lng;
        _start_lat = lat;
        //console.log("起点:"+_start_lng+","+_start_lat);
        _end_lng = lngBus;
        _end_lat = latBus;
    } else {
        _start_lng = lngBus;
        _start_lat = latBus;
        _end_lng = lng;
        _end_lat = lat;
    }
    //console.log("startlat:"+_start_lat+",start_lng:"+_start_lng);
    //console.log("_end_lat:"+_end_lat+",_end_lng:"+_end_lng);
    var pointHotel = new BMap.Point(lng, lat);
    var pointBus = new BMap.Point(lngBus, latBus);
    var transit = new BMap.TransitRoute('全国');
    //alert("fangan:"+_route_type);

    if (_route_type_val == 1) {
        _route_type = BMAP_TRANSIT_POLICY_LEAST_TIME;
    }
    if (_route_type_val == 2) {
        _route_type = BMAP_TRANSIT_POLICY_AVOID_SUBWAYS;
    }
    if (_route_type_val == 3) {
        _route_type = BMAP_TRANSIT_POLICY_LEAST_TRANSFER;
    }
    if (_route_type_val == 4) {
        _route_type = BMAP_TRANSIT_POLICY_LEAST_WALKING;
    }
    //alert(_route_type);
    //transit.setPolicy(_route_type);
    var dataCall = '';
    var datas = [];
    var startname = areaName;
    var endname = locname;
    //alert(toJSONString(trafficStopData.getPoi(i)));
    var transit = new BMap.TransitRoute(bdmap.BaiduMap, {
        //renderOptions:{policy:_route_type}
    });
    transit.setPolicy(_route_type);
    //获取酒店经纬度,进行公交,驾车路线
    transit.setSearchCompleteCallback(function (results) {
        //alert(transit.getStatus());
        if (transit.getStatus() == BMAP_STATUS_SUCCESS) {
            busData = results;
            var businfo=[];
            for (i = 0; i < results.getNumPlans(); i++) {
                var lines = results.getPlan(i);
                //console.log(lines)
                var planarr=getplandesc(lines, results.getStart().title, results.getEnd().title);
                //console.log(planarr[0]);
                if(i==0){
                    businfo.push('<li class="current">');
                }else{
                    businfo.push('<li>');
                }
                var plantitle=planarr[1];
                plantitle=plantitle.replace(/\([^\)]*\)/g,"");
                plantitle=plantitle.substring(0,plantitle.length-4);
                businfo.push('<div class="lx-list">');
                businfo.push('<div class="num fn">'+(i+1)+'</div>');
                businfo.push('<div class="addbox">');
                businfo.push(plantitle);
                businfo.push('</div><p class="txt dis">全程约'+lines.getDuration(true)+'/'+lines.getDistance(true)+'</p></div>');
                businfo.push(planarr[0]);
                businfo.push('</li>')
                //console.log(plantitle)
                //console.log(lines.getDescri;ption());

                //console.log(businfo.join(''));

                datas.push(lines);
            }
            //businfo=[];
            //console.log(businfo.join(''));
            drawBuschangeLine('0');
            $(".gjbox").find(".list").html(businfo.join(''));
            /*
             $.ajax({
             type: "post",
             url: '/map.php',
             data: dataCall,
             success: function(hoteldata){
             if(hoteldata)
             {
             $(".Cb_cont_1").hide();
             $(".Cb_ch_ct").hide();
             $(".gjlx").html(hoteldata);
             $(".gjlx").show();
             $(".dclx").hide();
             }
             }
             });
             */
            //
            $(".map-asideB").addClass("dis");
            $(".map-asideC").removeClass("dis");
            $('#tab1_c1').removeClass("dis");
            $('#tab1_c2').addClass("dis");
            $('#tab1_1').addClass("hover_style");
            $('#tab1_2').removeClass("hover_style");
        } else {
            alert("暂无数据,请尝试输入其他地点!");
            return false;
        }
    });

    if (type == "areastart") {
        $(".map-asideC .qdadd").text(areaName);
        $(".map-asideC .zdadd").text(locname);
        $(".gjfcbtn").unbind();
        $(".gjfcbtn").click(function(){
            searchbus(busLineNum,"areaend");
        })
        transit.search(pointHotel, pointBus);
        //console.log(pointHotel);
        //console.log(pointBus);

    } else {
        $(".map-asideC .qdadd").text(locname);
        $(".map-asideC .zdadd").text(areaName);
        $(".gjfcbtn").unbind();
        $(".gjfcbtn").click(function(){
            searchbus(busLineNum,"areastart")
        })
        transit.search(pointBus, pointHotel);
        //alert("ok");
        //transit.search("中关村", "国贸桥");
        //console.log(pointHotel);
        //console.log(pointBus);
    }

};


function drawBuschangeLine(num) {
    //alert("选择了"+num);
    bdmap.BaiduMap.clearOverlays();
    var firstPlan = busData.getPlan(num);
    var points = [];
    for (var i = 0; i < firstPlan.getNumRoutes(); i++) {
        // 步行线路有可能为0
        var walk = firstPlan.getRoute(i);
        //console.log(walk);
        bdmap.BaiduMap.addOverlay(new BMap.Polyline(walk.getPath(), {strokeColor:"green", strokeStyle:"dashed"}));
        //points.push(walk.getPoints());
    }
    for (i = 0; i < firstPlan.getNumLines(); i++) {
        // 绘制公交线路
        var line = firstPlan.getLine(i);
        var busType = line.type;    //0:公交,1:地铁
        var getOnStop = line.getGetOnStop();
        var getOnStopPoints = getOnStop.point;  //获取起始点坐标
        bdmap.BaiduMap.addOverlay(new BMap.Polyline(line.getPath(), {strokeColor:"#3a6bdb"}));
        mapInBusIcon(busType, getOnStopPoints);
    }
    setMapBusIcon('default');
}

function mapInBusIcon(type, points) {
    if (type == 0) {
        var myIcon = new BMap.Icon("http://api.map.baidu.com/img/trans_icons.png", new BMap.Size(21, 21), {
            offset:new BMap.Size(0, 0),
            imageOffset:new BMap.Size(0, -55)
        });
    } else {
        var myIcon = new BMap.Icon("http://api.map.baidu.com/img/trans_icons.png", new BMap.Size(21, 21), {
            offset:new BMap.Size(0, 0),
            imageOffset:new BMap.Size(0, -76)
        });
    }
    var marker = new BMap.Marker(points);
    marker.setIcon(myIcon);
    bdmap.BaiduMap.addOverlay(marker);
}
function setMapBusIcon(type) {
    //console.log("起点icon:"+_start_lng+","+_start_lat);
    var point2 = new BMap.Point(_start_lng, _start_lat);
    var point1 = new BMap.Point(_end_lng, _end_lat);
    bdmap.BaiduMap.setViewport(new Array(point1, point2));
    var myIconStart = new BMap.Icon("http://api.map.baidu.com/img/dest_markers.png", new BMap.Size(45, 34), {
        offset:new BMap.Size(0, 0),
        imageOffset:new BMap.Size(0, 0)
    });
    var myIconEnd = new BMap.Icon("http://api.map.baidu.com/img/dest_markers.png", new BMap.Size(45, 34), {
        offset:new BMap.Size(0, 0),
        imageOffset:new BMap.Size(0, -32)
    });
    var markerStart = new BMap.Marker(point2);
    var markerEnd = new BMap.Marker(point1);
    markerStart.setIcon(myIconStart);
    markerEnd.setIcon(myIconEnd);
    bdmap.BaiduMap.addOverlay(markerStart);
    bdmap.BaiduMap.addOverlay(markerEnd);
}

function busTypeChange(type) {
    //alert("type:"+type);
    //document.getElementById("results").innerHTML = "";
    _route_type_val = type;
    searchbus(busLineNum, busLineType);
}
////TAXI
function searchtaxi(i,type){
    taxiLineNum = i;
    taxiLineType = type;
    /*
     var infodata = mapjson[trafficHotelid];
     if(infodata == undefined){
     var infodata = mapjsonList[trafficHotelid];
     }
     var maplnglat = infodata[1];
     var hotelName = infodata[2];
     */
    var maplnglat = curpoi;
    var areaName = curareaname;
    var lnglat = maplnglat.split("|");
    var lng = lnglat[1];
    var lat = lnglat[0];
    //console.log("jiache:"+trafficStopData);
    var selectTaxiData = trafficStopData.getPoi(i);
    var locname = selectTaxiData.title;
    var lngTaxi = selectTaxiData.point.lng;
    var latTaxi = selectTaxiData.point.lat;
    if (type == "areastart") {
        _start_lng = lng;
        _start_lat = lat;
        _end_lng = lngTaxi;
        _end_lat = latTaxi;
    } else {
        _start_lng = lngTaxi;
        _start_lat = latTaxi;
        _end_lng = lng;
        _end_lat = lat;
    }
    var pointHotel = new BMap.Point(lng, lat);
    var pointTaxi = new BMap.Point(lngTaxi, latTaxi);
    var driving = new BMap.DrivingRoute(bdmap.BaiduMap, {});
    // alert(_driving_type_val);
    if (_driving_type_val == 1) {
        _driving_type = BMAP_TRANSIT_POLICY_LEAST_TIME;
    }
    if (_driving_type_val == 2) {
        _driving_type = BMAP_DRIVING_POLICY_LEAST_DISTANCE;
    }
    if (_driving_type_val == 3) {
        _driving_type = BMAP_DRIVING_POLICY_AVOID_HIGHWAYS;
    }
    driving.setPolicy(_driving_type);
    var dataCall = '';
    var datas = [];
    var startname = areaName;
    var endname = locname;
    //alert(toJSONString(trafficStopData.getPoi(i)));
    driving.setSearchCompleteCallback(function (results) {
        if (driving.getStatus() == BMAP_STATUS_SUCCESS) {
            drivingData = results;
            datas = results.getPlan(0);
            $(".dcfy").text(results.taxiFare.day.totalFare);
            var html=[];
            html.push('<div class="lx-list"> <p class="txt dis">全程约'+datas.getDuration(true)+'/'+datas.getDistance(true)+'</p></div>');
            html.push('<div class="lx-list-cont dis">');
            for(i=0;i<datas.getNumRoutes();i++){
                var route = datas.getRoute(i);
                for (var j =0; j < route.getNumSteps(); j ++) {
                    var curStep = route.getStep(j);
                    html.push('<div class="line"></div><div class="list-c"><div class="num">'+(j+1)+'</div>');
                    html.push('<p class="info">'+curStep.getDescription()+'</p></div>');
                    //console.log(curStep.getDescription());
                }
            }
            html.push('</div>');

            html=html.join('');
            //console.log(html);
            //alert($(".jcbox").find(".current").html());
            $(".jcbox").find(".current").html(html);
            /*
             if(type == "hotelEndStop"){
             dataCall = "op=taxisearch&city="+locMapCity+"&startname="+startname+"&endname="+endname+"&data=" + encodeURIComponent(toJSONString(datas))+"&taxitype="+_driving_type;
             }else{
             dataCall = "op=taxisearch&city="+locMapCity+"&startname="+endname+"&endname="+startname+"&data=" + encodeURIComponent(toJSONString(datas))+"&taxitype="+_driving_type;
             }*/
            drawTaxichangeLine();
            /*
             $.ajax({
             type: "post",
             url: '/map.php',
             data: dataCall,
             success: function(hoteldata){
             if(hoteldata)
             {
             $(".Cb_cont_1").hide();
             $(".Cb_ch_ct").hide();
             $(".gjlx").html(hoteldata);
             $(".gjlx").show();
             $(".dclx").hide();
             }
             }
             });*/
            $(".map-asideB").addClass("dis");
            $(".map-asideC").removeClass("dis");
            $('#tab1_c2').removeClass("dis");
            $('#tab1_c1').addClass("dis");
            $('#tab1_2').addClass("hover_style");
            $('#tab1_1').removeClass("hover_style");

        } else {
            alert("暂无数据,请尝试输入其他地点!");
            return false;
        }
    });

    if (type == "areastart") {
        $(".map-asideC .qdadd").text(areaName);
        $(".map-asideC .zdadd").text(locname);
        $(".jcfcbtn").unbind();
        $(".jcfcbtn").click(function(){
            searchtaxi(taxiLineNum,"areaend");
        })
        driving.search(pointHotel, pointTaxi);
        // console.log(pointHotel);
        // console.log(pointTaxi);

    } else {
        $(".map-asideC .qdadd").text(locname);
        $(".map-asideC .zdadd").text(areaName);
        $(".jcfcbtn").unbind();
        $(".jcfcbtn").click(function(){
            searchtaxi(taxiLineNum,"areastart")
        })
        //transit.search(pointBus, pointHotel);
        //alert("ok");
        driving.search(pointTaxi, pointHotel);
        //console.log(pointHotel);
        //console.log(pointTaxi);
    }

}
function drawTaxichangeLine() {
    bdmap.BaiduMap.clearOverlays();
    var points = [];
    var firstPlan = drivingData.getPlan(0);
    var drivingStart = drivingData.getStart();
    var drivingEnd = drivingData.getEnd();
    var getOnStopPoints = drivingStart.point;  //获取起始点坐标
    for (i = 0; i < firstPlan.getNumRoutes(); i++) {
        // 绘制驾车线路
        var line = firstPlan.getRoute(i);
        bdmap.BaiduMap.addOverlay(new BMap.Polyline(line.getPath(), {strokeColor:"#3a6bdb"}));
        //map.setViewport(line.getPoints());
    }
    setMapBusIcon('default');
}
function drawDrivingchangeLine() {
    bdmap.BaiduMap.clearOverlays();
    var firstPlan = drivingData.getPlan(0);
    var drivingStart = drivingData.getStart();
    var drivingEnd = drivingData.getEnd();
    var getOnStopPoints = drivingStart.point;  //获取起始点坐标
    for (i = 0; i < firstPlan.getNumRoutes(); i++) {
        // 绘制驾车线路
        var line = firstPlan.getRoute(i);
        bdmap.BaiduMap.addOverlay(new BMap.Polyline(line.getPath(), {strokeColor:"#3a6bdb"}));
        //map.setViewport(line.getPoints());
    }
    setMapBusIcon('default');
}
function taxiTypeChange(type) {
    _driving_type_val = type;
    searchtaxi(taxiLineNum, taxiLineType);
}
/*Taxi End*/
function getplandesc(plan, start, end) {
    var total = plan.getNumRoutes() + plan.getNumLines();
    var description =[];
    var plantitle=[];
    var linshinum=0;
    description.push('<div class="lx-list-cont dis">');
    description.push('<div class="line"></div><div class="list-c">');
    description.push('<div class="num">'+1+'</div>');
    description.push('<p class="info">从' + start);
    var addEndTitle = true;
    var linshi;

    for (var i = 0; i < total; i++) {
        if (i % 2 == 0) {
            // i为偶数
            // 处理第一个步行描述逻辑
            if (i / 2 == 0) {
                if (plan.getRoute(i / 2).getDistance(false) == 0) {
                    //description = ['从'];
                    //alert("起点不需要步行");
                }else{
                    description.push('步行至');
                    linshi=plan.getRoute(i / 2).getDistance(true);
                    linshinum++;
                    continue;
                }
            }
            // 处理最后一个步行描述逻辑
            if (i / 2 == plan.getNumRoutes() - 1) {
                linshi=plan.getRoute(i / 2).getDistance(true);
                if (plan.getRoute(i / 2).getDistance(false) == 0) {
                    addEndTitle = false;
                }
            }
            if (plan.getRoute(i / 2).getDistance(false) > 0) {
                description.push('<div class="line"></div><div class="list-c">');
                description.push('<div class="num">'+(linshinum+1)+'</div>');
                description.push('<p class="info">步行至');
                linshinum++;
                /*
                 if (i == 0) {
                 description.push(plan.getLine((i - 1) / 2).getGetOnStop().title + '</p>');
                 }
                 */
                //description.push('<div class="num-z">'+ plan.getRoute(i / 2).getDistance(true) +'</div></div>');
                linshi=plan.getRoute(i / 2).getDistance(true);
                // console.log('步行约' + plan.getRoute(i / 2).getDistance(true) + '至');
            }
        } else {
            // i为奇数
            var line = plan.getLine((i - 1) / 2);
            plantitle.push('<span class="dt01">'+line.title+'</span> &gt;');
            if (i == 0) {
                description.push(line.getGetOnStop().title + '</p>');
                description.push('<div class="num-z">'+linshi +'</div></div>');
            }
            if (i > 0) {
                if (plan.getRoute((i - 1) / 2).getDistance(false) > 0) {
                    //description.push(line.getGetOnStop().title + ', ');
                    description.push(line.getGetOnStop().title + '</p>');
                    description.push('<div class="num-z">'+linshi +'</div></div>');
                }
            }
            /*
             <div class="line"></div>
             <div class="list-c">
             <div class="num">1</div>
             <p class="info">乘坐<span class="c_06c fb">地铁4号线(安和桥北方向)</span>，<span class="c_06c">在海淀黄庄站</span>下车
             </p>

             <div class="num-z">2站</div>
             </div>
             */
            description.push('<div class="line"></div><div class="list-c">');
            description.push('<div class="num">'+(linshinum+1)+'</div>');
            description.push('<p class="info">乘坐<span class="c_06c fb">'+line.title+'</span>，<span class="c_06c">'+line.getGetOffStop().title+'</span>下车</p>');
            description.push('<div class="num-z">'+line.getNumViaStops()+'站</div></div>');
            linshinum++;
            /*
             description.push('乘坐' + line.title + ', ');
             description.push('在'+line.getGetOnStop().title+'站上车, ');
             description.push('经过' + line.getNumViaStops() + '站');
             description.push('在' + line.getGetOffStop().title + '站下车，');
             */
        }
        console.log(linshinum);
    }
    if (addEndTitle) {
        //description.push(end + '。');
        description.push(end + '</p><div class="num-z">' + linshi + '</div><div class="line"></div><a class="fssjbtn" href="#" onclick="sms2open(\''+plan.getDescription(false)+'\')"></a></div>');
    }
    // 替换可能出现的末尾位置的逗号
    description.push('</div>');
    var descriptionStr = description.join('');//.replace(/\uff0c$/, '。');
    var plantitlestr=plantitle.join('');
    var returnarr=[descriptionStr,plantitlestr];
    return returnarr;

}
function sms2open(t){
    $('.sendinfo .txt').text(t);
    show('divdia2',this,3);
    return false;
}
var bdmap = {},curareaname='',curpoi='';
$(function () {
    //创建百度地图
    bdmap = new PGY.Map({
        center:[116.404, 39.915],
        zoom:12,
        container:'BaiduMapWarp'
    })
    //根据右侧信息列表创建marker 并绑定校区列表事件
    showmarker(true);
    //添加信息层关闭按钮事件
    $("#Closetc-popbox").bind("click", function () {
        $("#popinfo").addClass("dis");
    })
    //为校区列表校区名称添加指形样式
    $(".t").mouseover(function () {
        $(this).css("cursor", "pointer")
    });
    //创建自动完成的文本框
    new BMap.Autocomplete(//建立一个自动完成的对象
        {"input":"totxt", "location":bdmap.BaiduMap
        });
    new BMap.Autocomplete(//建立一个自动完成的对象
        {"input":"fromtxt", "location":bdmap.BaiduMap
        });
    //为返回校区列表添加事件
    $(".returnBtn").click(function(){
        //alert("returnbtn");
        $("#popinfo").addClass("dis");
        $(".map-asideB").addClass("dis");
        $(".map-asideC").addClass("dis");
        $(".map-asideA").removeClass("dis");
        bdmap.clearOverlays();
        showmarker(false);
    })
    $(".returnqzBtn").click(function(){
        $(".map-asideC").addClass("dis");
        $(".map-asideB").removeClass("dis");
    })
    //公交方案切换
    $(".gjbox").find("li").live("click",function(v,i){
        $(".gjbox").find("li").removeClass("current");
        $(this).addClass("current");
        var num = $(this).find(".fn").text();
        //alert(num);
        drawBuschangeLine(num-1);
    })
    //驾车公交切换
    $("#tab1_2").bind("click",function(){

        //alert("qhgj:"+taxiLineNum+","+taxiLineType);
        if(busLineType){
            tab(1,2,2);
            searchtaxi(busLineNum,busLineType);
        }else{
            alert("当前已经是驾车线路了");
        }
    })
    $("#tab1_1").bind("click",function(){

        //alert("qhjc:"+busLineNum+","+busLineType);

        if(taxiLineType){
            tab(1,2,1);
            searchbus(taxiLineNum,taxiLineType);
        }else{
            alert("当前已经是公交线路了");
        }
    })
})
function showmarker(bind) {
    var baidupoint = {};
    bdmap.clearOverlays();
    $(".map-asideA .list li").each(function (i, v) {
        var bdPoint = new BMap.Point($(this).find('.info').attr("lng"), $(this).find('.info').attr("lat"));
        var sname = $(this).find(".t").text();
        var areaid = $(this).find('.info').attr("areaid");
        bdmap.addOverlay(new XQMarker(bdPoint, (i + 1) + sname, (i + 1) + sname, i + 1, areaid));
        if (bind) {
            $(this).attr("id", "list" + (i + 1));
            $(this).find("dt").text(i + 1 + sname);
            $(this).bind("mouseenter", function () {
                var mm = $("#" + (i + 1)).get(0);
                //var mmspan=$("#" + (i + 1)).find("span").get(0);
                mm.style.backgroundColor = "#6BADCA";
                mm.style.borderColor = "#0000ff";
                mm.getElementsByTagName("span")[0].innerHTML = (i + 1) + sname;
                mm.style.cursor = "pointer";
                mm.style.background = "url(http://www.sooker.com/zhuanti/label2.png) no-repeat left -37px";
                mm.getElementsByTagName("span")[0].style.background = "url(http://www.sooker.com/zhuanti/label3.png) no-repeat right -45px";
                //$(mm).find(".arrow").get(0).style.backgroundPosition = "0px -20px";
                mm.style.zIndex = BMap.Overlay.getZIndex(-1000);
                bdmap.BaiduMap.panTo(bdPoint);
                $(this).addClass("current");
            })

            $(this).bind("mouseleave", function () {
                $("#" + (i + 1)).mouseout();
                $(this).removeClass("current");
            })
            $(this).bind("click", function () {
                $("#popinfo").removeClass("dis");
                $("#mappopwindow").find(".info").html("ajax 获取内容" + "当前坐标:" + document.getElementById($(this).attr("id").replace("list", "")).getAttribute("position"));
                showpopinfo.call(this,false);
            })
        }

    })
    //alert("test");

    bdmap.BaiduMap.centerAndZoom(baidupoint, 12);
}
function showpopinfo(v){
    //v=true则是marker点击,v==false 则是校区列表点击
    var areaid,sname;
    if(v){
        areaid=$(this).attr("areaid");
        sname=$("#list"+$(this).attr("id")).find(".t").text();
        $("#aposition").val($(this).attr("position"));

    }else{
        areaid=$(this).find(".info").attr("areaid");
        sname = $(this).find(".t").text();
        $("#aposition").val($(this).find('.info').attr("lat")+"|"+$(this).find('.info').attr("lng"));
    }
    if(areaid>0){
        $("#popinfo").removeClass("dis");
        $("#popinfo").find(".spnat-info").html("<img src='http://hotel.kuxun.cn/images/ajax-loader.gif' />ajax正在获取校区"+areaid+"信息..");
        $.ajax({
            type: "get",
            url: '/frontend/index.php?app=api&act=campusinfoformap&campusid='+areaid,
            success: function(campusdata){
                if(campusdata)
                {
                    $("#popinfo").find(".spnat-info").html(campusdata);
                }
            }
        });
        $("#aname").val(sname);
        //alert("ajax获取 校区id："+areaid+"的信息");
    }

}
function getLine(a,b){
    //a=到这里去 areato or 从这里出发 areafrom
    //b=公交bus or 驾车taxi
    var sval,areaname,aposition;
    if(a=="areato"){
        sval=$("#totxt").val();
    }else{
        sval=$("#fromtxt").val();
    }
    if(sval==''){alert("请输入起点或终点!");return false;}
    areaname=$("#aname").val();
    aposition=$("#aposition").val();
    curareaname=areaname;
    curpoi=aposition;
    $(".map-asideA").addClass("dis");
    $(".map-asideB").removeClass("dis");
    getblurpoi(sval,a,b,areaname);
}