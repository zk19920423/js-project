// ==UserScript==
// @name         maddawgjav.net排版Zk版脚本
// @version      1.0.4
// @description  maddawgjav.net网站重新排版，浏览图片内容更方便，你懂的，根据原作者修改版，解决一些图片显示不正常的情况
// @match        http://maddawgjav.net/*
// @match        http://www.imagebam.com/image/*?url=maddawgjav.net
// @run-at       document-start
// @require      http://ajax.aspnetcdn.com/ajax/jQuery/jquery-2.1.4.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      www.imagebam.com
// @connect      pixhost.org

// @license      GPL version 3
// @encoding     utf-8

// @namespace https://greasyfork.org/users/117729

// @copyright    hobby 2016-01-02

// maddawgjav.net网站重新排版，浏览图片内容更方便，你懂的，根据原作者修改版，解决一些图片显示不正常的情况
// 如有问题或者改进意见，请您反馈 我会尽快做出修改
// 内地用户推荐Chrome + Tampermonkey（必须扩展） + XX-Net(代理) + Proxy SwitchyOmega（扩展）的环境下配合使用。

// v1.0.4 为提高相应速度，调整为只有在点击大图时才加载大图
// v1.0.3 修复一部分封面显示问题
// v1.0.2 修复一部分图片显示问题
// v1.0.0 针对maddawgjav.net网站的支持，支持方便浏览图片


// ==/UserScript==
/* jshint -W097 */
'use strict';

//过滤文字单词的数组
var filterWordsArray = new Array(
    'H0930','C0930','ガチん娘！','HEYZO','Muramura','一本道','Pacopacomama','天然むすめ','カリビアンコム プレミアム','カリビアンコム','PPV','Real Street Angels','41Ticket',
    'GALAPAGOS','Mesubuta','1000人斬り','Tokyo Hot','AV志向','アジア天国','キャットウォーク ポイズン','G-AREA','Honnamatv','ABBY','エッチな4610','Zipang','Real-diva','H4610',
    '金8天国','av9898','エッチな4610','エッチな0930','15-daifuku','Mywife-No','ハメる','The 変態','人妻斬り','娘姦白書','1919gogo','HEYZO','ハメ撮りケンちゃん','HEYZO','HEYZO',
    '\\[FHD\\]','\\[HD\\]'
);

//不过滤用于判断截取字符位置的单词
var wordsArray = new Array(
    'S-Cute','Asiatengoku','Real-diva','Jukujo-club','\[julesjordan\]','\[colette\]','Mywife-No','Roselip','Zipang','HEYZO','1919gogo','\[DDF\] ','\[Wow\]','\[21members\]','Blacked','\[sexart\]','Heyzo'
);

//多文字过滤的月份字典定义,前为替换前字符，后为替换后字符
var replaceMonth = {
    "January" : "一月",
    "February" : "二月",
    "March": "三月",
    "April" : "四月",
    "May": "五月",
    "June" : "六月",
    "July": "七月",
    "August" : "八月",
    "September": "九月",
    "October" : "十月",
    "November": "十一月",
    "December": "十二月"
};

//添加样式可覆盖原有css样式
GM_addStyle('#wrapper {margin: 0;width: initial;}');
GM_addStyle('#sidebar-border {display : none ;position: absolute;float: left;width: 220px;background: #f2f2f2;border: 1px solid #ccc;}');
GM_addStyle('#sidebar {overflow: hidden;width: 220px;border: 1px solid #fff;padding: 0px;}');
GM_addStyle('#content {overflow: hidden;float: left;width: initial;padding: 0;}');
GM_addStyle('.entry img {margin: auto;}');
GM_addStyle('.entry p {margin: 0 0 5px 0;}');
GM_addStyle('.post-info-top {border-top: 1px solid #ddd;line-height: 15px;color: #999;height: 15px;margin: 0 0 0;padding: 0 0;}');
GM_addStyle('.post-info-date {background-position: 0 -40px;float: right;}');

$("#footer-inside").remove();//清除内容

document.addEventListener('DOMContentLoaded', function () {

    $("#sidebar-border").insertBefore("#content");

    // 过滤文字单词函数，删除相关文字
    // param srcString 需过滤字符串
    // retunr 过滤后的字符串
    function filterWords(srcString){
        for(var i = 0; i < filterWordsArray.length ; i ++){
            srcString = srcString.replace(new RegExp(filterWordsArray[i],'ig'),"");
        }
        return srcString;
    }

    // 判断字符串是否包含单词字典，获取番号
    // param srcString 需判断字符串
    // retunr true,false
    function hasWords(srcString){
        for(var i = 0; i < wordsArray.length ; i ++){
            if(wordsArray[i] !== ""){
                srcString = $.trim(srcString);
                if(srcString.split(" ")[0] === wordsArray[i]){
                    return true;
                }
            }
        }
        return false;
    }

    // 创建查找av番号的外链html内容元素P
    // param avCode av番号
    // return 外链html内容元素P
    function crtOutLink(avCode){
        var p = $(
            '<p style="text-align: center;color: blue;">'+
            '他站查找 ['+ avCode +']：'+
            '<a target="_blank" href="http://blogjav.net/?s='+ avCode +'" title="搜 '+ avCode +'" style="text-align: center;color: red;text-decoration: underline;">blogjav</a>&nbsp;&nbsp;&nbsp;&nbsp;'+
            '<a target="_blank" href="http://javbest.net/?s='+ avCode +'" title="搜 '+ avCode +'" style="text-align: center;color: red;text-decoration: underline;">javbest</a>&nbsp;&nbsp;&nbsp;&nbsp;'+
            '<a target="_blank" href="http://javpop.com/index.php?s='+ avCode +'" title="搜 '+ avCode +'" style="text-align: center;color: red;text-decoration: underline;">javpop</a>&nbsp;&nbsp;&nbsp;&nbsp;'+
            '留种： '+
            '<a target="_blank" href="https://btso.pw/search/'+ avCode +'" title="搜 '+ avCode +'" style="text-align: center;color: red;text-decoration: underline;">btsow</a>&nbsp;&nbsp;&nbsp;&nbsp;'+
            '<a target="_blank" href="https://btdb.in/q/'+ avCode +'" title="搜 '+ avCode +'" style="text-align: center;color: red;text-decoration: underline;">BDTB</a>&nbsp;&nbsp;&nbsp;&nbsp;'+
            '推荐： '+
            '<a target="_blank" href="https://greasyfork.org/zh-CN/scripts/18454" title="UserScript" style="text-align: center;color: red;text-decoration: underline;">blogjav.net脚本</a>&nbsp;&nbsp;&nbsp;&nbsp;'+
            '</p>'
        )[0];
        return p;
    }

    // 创建查找av女优的外链html内容元素P
    // param womenName av女优名
    // return 外链html内容元素P
    function crtOutLinkByName(womenName){
        var p = $(
            '<p style="text-align: center;">'+
            '<a style="text-align: center;color: blue;text-decoration: none;">查找 ['+ womenName +']：</a>'+
            '<a target="_blank" href="http://maddawgjav.net/?s='+ womenName +'" title="搜 '+ womenName +'" style="text-align: center;color: red;text-decoration: underline;" rel="noreferrer">maddawjav</a>&nbsp;&nbsp;&nbsp;&nbsp;'+
            '<a target="_blank" href="http://blogjav.net/?s='+ womenName +'" title="搜 '+ womenName +'" style="text-align: center;color: red;text-decoration: underline;" rel="noreferrer">blogjav</a>&nbsp;&nbsp;&nbsp;&nbsp;'+
            '<a target="_blank" href="http://javbest.net/?s='+ womenName +'" title="搜 '+ womenName +'" style="text-align: center;color: red;text-decoration: underline;">javbest</a>&nbsp;&nbsp;&nbsp;&nbsp;'+
            '<a target="_blank" href="http://javpop.com/index.php?s='+ womenName +'" title="搜 '+ womenName +'" style="text-align: center;color: red;text-decoration: underline;">javpop</a>&nbsp;&nbsp;&nbsp;&nbsp;'+
            '<a style="text-align: center;color: blue;text-decoration: none;">查种：</a>'+
            '<a target="_blank" href="http://www.btio.pw/search/'+ womenName +'" title="搜 '+ womenName +'" style="text-align: center;color: red;text-decoration: underline;">btsow</a>&nbsp;&nbsp;&nbsp;&nbsp;'+
            '<a target="_blank" href="http://sukebei.nyaa.se/?page=search&amp;cats=0_0&amp;filter=0&amp;term='+ womenName +'" title="搜 '+ womenName +'" style="text-align: center;color: red;text-decoration: underline;">sukebei.nyaa</a>'+
            '</p>'
        )[0];
        return p;
    }

    // 获取全域名
    function getHostName(url) {
        var e = new RegExp('^(?:(?:https?|ftp):)/*(?:[^@]+@)?([^:/#]+)'), matches = e.exec(url);
        return matches ? matches[1] : url;
    }

    // 获取后缀域名，取www之后的地址
    function getLastName(webName) {
        var array = webName.split(".");
        if(array.length === 3){
            var a = webName.indexOf('.');
            var lastName = webName.substring(a + 1, webName.length);
            return lastName;
        }
        else if(array.length === 2){
            return webName;
        }
    }
	//获取文件名
    function urlfilename(a) {
        var n1 = a.lastIndexOf('/') + 1;
        var n2 = a.lastIndexOf('.');
        a = a.substring(n1, n2);
        return a;
    }

    function urljpgid(a) {
        var n1 = a.lastIndexOf('/');
        var n2 = a.lastIndexOf('/')-9;
        a = a.substring(n1, n2);
        return a;
    }

    //删除帖子的第一张缩略图
    //param i:指定图片集合
    function delTOneImg(array){
        //帖子第一张主题图片集合
        var img_t_array = array;
        //帖子的第一张缩略图删除
        for (var index = 0; index < img_t_array.length; index++) {
            var img_t = img_t_array[index];
            //debugger;
            //主题图片靠左排版
            $(img_t).css('float','left');
            //帖子的第一张缩略图删除
            try{
                if(img_t.nextElementSibling.nextElementSibling.nextElementSibling.tagName === "A"){
                    $(img_t.nextElementSibling.nextElementSibling).remove();
                }
            }catch(e){}
        }
    }

    //以下同时替换多个字符串使用到的代码，如123-->abc,456-->xyz
    Array.prototype.each = function(trans) {
        for (var i=0; i<this.length; i++)
            this[i] = trans(this[i], i, this);
        return this;
    };
    Array.prototype.map = function(trans) {
        return [].concat(this).each(trans);
    };
    RegExp.escape = function(str) {
        return new String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
    };
    function properties(obj) {
        var props = [];
        for (var p in obj) props.push(p);
        return props;
    }
    //过滤字典方法
    function filterDict(str,replacements){
        var regex = new RegExp(properties(replacements).map(RegExp.escape).join("|"), "g");
        str = str.replace(regex, function($0) { return replacements[$0]; });
        return str;
    }
    // end 替换多个字符串代码结束


    //debugger;
    var location = unsafeWindow.document.location;

    //子级iframe判断是否约定的Url
    if(typeof(location)!== "undefined" && location.href.indexOf('?url=maddawgjav.net') > -1){

        var jpg_id = urljpgid(location.pathname);
        var $jpg_id = $("#i"+jpg_id);
        var img_src = $jpg_id.attr("src");
        var img_pEle = $jpg_id[0].parentElement;
        //$jpg_id.remove();
        //debugger;
        $jpg_id.attr("src","http://maddawgjav.net/wp-content/themes/zbench.1.2.3/zbench/images/search-input-bg.gif");

        var $iframe = $(document.createElement("IFRAME"));
        $iframe.attr("width", "0");
        $iframe.attr("height", "0");
        //将问号后的.转换成%%  然后载入iframe的地址
        $iframe.attr("src", "http://maddawgjav.net/wp-login.php?"+img_src.replace(/\./g,"%%"));

        $(img_pEle).append($iframe);
    }
    //子级iframe的子级iframe判断是否约定的Url
    else if(typeof(location)!== "undefined" && location.href.indexOf('maddawgjav.net/wp-login.php') > -1){
        var jpg_id = urljpgid(location.search);
        var av_cd =$('#href'+jpg_id, window.parent.parent.document).get(0).parentElement.avcd;
        var av_name = $('#href'+jpg_id, window.parent.parent.document).get(0).parentElement.av_name;
        var href = location.search.substring(1,location.search.length).replace(/\%\%/g,".");
        $('#img'+jpg_id, window.parent.parent.document).attr("src",href );//"http://imagetwist.com/error.jpg?" +  + '??$@' + av_cd + "?$@" + av_name

        var $imgN = $($('#href'+jpg_id, window.parent.parent.document).get(0).firstElementChild);
        //debugger;
        //$hobbyimgN.src = href;
        $iframe = $('#iframe'+jpg_id, window.parent.parent.document);
        $iframe.attr("src", "");//释放资源
    }
    else{
        //debugger;


        //所有p标签的文字
        var p_tz_array = $("p[style='text-align: center']");
        var p_tz_array_2 = $("p[style='text-align: center;']");
        //debugger;
        for (var index = 0; index < p_tz_array.length; index++) {
            var p = p_tz_array[index];
            $(p).css('text-align','left');
        }
        for (var index = 0; index < p_tz_array_2.length; index++) {
            var p2 = p_tz_array_2[index];
            $(p2).css('text-align','left');
        }

        //上一页下一页默认弹出新页签处理
        var div_a_array = $("div[id='pagination'] a");
        //debugger;
        for (var index = 0; index < div_a_array.length; index++) {
            var page_a = div_a_array[index];
            $(page_a).attr('target','_blank');
        }

        //所有div帖子
        var div_tz_array = $("div[id^='post-']");
        for (var index = 0; index < div_tz_array.length; index++) {
            var div = div_tz_array[index];
            $(div).css('width','initial');
            $(div).find("img[class='alignnone']").parent("p[style='text-align: left;']").attr("id","h-"+div.id);
            $(div).find("img[class='alignnone aligncenter']").attr("id","h-"+div.id);

            // 包含日期的a元素
            var tz_date_a = $(div).find("span[class='post-info-date'] a")[0];
            // 替换a元素内容的月份文字
            tz_date_a.innerHTML = filterDict(tz_date_a.innerHTML,replaceMonth);

            // 获取文章的标题文字
            var titleStr = $(div).find("div[class='entry'] p[style='text-align: left;']")[0].innerHTML;
            // 过滤文字
            titleStr = filterWords(titleStr);
            // 获取av番号
            var code = ""
            //如果包含指定单词字符
            //debugger;
            if(hasWords(titleStr)){
                // 获取av番号
                code = titleStr.split(" ")[0] + " " + titleStr.split(" ")[1];
            }
            else{
                // 获取av番号
                code = titleStr.split(" ")[0];
            }
            // 将外链元素P插入帖子div元素内最后面
            if(code !== ""){
                $(div).append(crtOutLink(code));
            }
            else{
                $(div).append(crtOutLink(titleStr.split(" ")[1]));
            }



            // 如果存在文章内容
            //debugger;
            if($(div).find('p:contains(出演者)').length > 0){
                // 获取包含女优名称的文章内容的P元素
                var tz_content_p = $(div).find('p:contains(出演者)')[0];
                // 获取此P元素的文本
                var tz_content = tz_content_p.outerHTML;
                var cyz_start_idx = tz_content.indexOf('出演者');
                var cyz_end_index = tz_content.indexOf('<br>',cyz_start_idx);
                if(!(cyz_end_index > 0)){
                    cyz_end_index = tz_content.indexOf('</p>',cyz_start_idx);
                }
                //debugger;
                if(cyz_end_index > 0 & cyz_start_idx + 5 < cyz_end_index){
                    // 从P元素的文本中截取文章的女优名字
                    var names = tz_content.substring(cyz_start_idx + 5,cyz_end_index);

                    // 将创建的外链元素P插入到文章内容的P元素的前面
                    if(names !== '—-' & names.length > 0){
                        //$(tz_content_p).before(crtOutLinkByName(names.split(" ")[0]));
                    }
                }
            }
        }

        //删除帖子的第一张缩略图
        delTOneImg($("img[class='alignnone']"));
        delTOneImg($("img[class='alignnone aligncenter']"));

        //所有p标签内图片-----内容封面图片
        var img_array = $("p[style='text-align: left;'] img");
        for (var index = 0; index < img_array.length; index++) {
            //TODO:foreach:2
            var img = img_array[index];
            var web_name = getHostName(img.src);
            var lastName = getLastName(web_name);
            //img元素没有title属性值时执行
            //if(typeof($(img).attr("title")) == "undefined" ){
            //    $(img).css("width","100px");
            //}

            $(img).css("max-width","none");
            //图片靠左排版
            $(img).css('float','left');
            //备份width
            img.name = "100";

            if (lastName === 'imagebam.com') {
                //TODO:javbest:imagebam.com
                var jpg_name = urlfilename(img.src);
                var jpg_id = jpg_name.substring(jpg_name.length-9,jpg_name.length);
                var url = 'http://www.imagebam.com/image/' + jpg_name ;// + "??$@" + av_cd + "?$@" + av_name
                //img.parentElement.href = url;
                img.parentElement.id = "href"+ jpg_id;
                img.id = "img"+ jpg_id;

                $(img.parentElement).attr("name",url);
                $(img.parentElement).attr("href","javascript:void(0);");
            }
            else if(lastName === 'pixhost.org'){
                $(img.parentElement).attr("href","javascript:void(0);");
                $(img.parentElement).attr("name",img.src.replace('thumbs','images').replace('//t','//img'));
                //img.src = img.src.replace('thumbs','images').replace('//t','//img');
                //showImg2(img);
            }
        }

        //所有内容大图数组对象-----内容展示图片
        var dimg_array = $("p[style='text-align: left;'] a img");
        for (var index = 0; index < dimg_array.length; index++) {
            //内容大图对象
            var dimg = dimg_array[index];
            //文章内容的DIV对象
            var div = $(dimg).parents('.entry')[0];
            //将dimg的父元素a整个追加到div元素内的最后（相当于移动）,实现的效果是内容大图都排在了文章文字的后面
            $(div).append(dimg.parentElement);
        }

        var dimg_array = $("div[class='entry'] a img");
        for (var index = 0; index < img_array.length; index++) {
			var img = img_array[index];
			var web_name = getHostName(img.src);
			var lastName = getLastName(web_name);

			if(lastName === 'imgclick.net'){
				//debugger;
				$(img).css('width','71px');
				//img.src = img.src.replace('_t','');
				//var img = this.firstChild;
				$(img.parentElement).removeAttr("target");
				img.parentElement.href = "javascript:void(0);";
				//重新插入img新标签，在原img的前面
				img.insertAdjacentHTML('beforeBegin', '<img id="img'+ index +'" src="'+ img.src +'" border="0" style="width: 71px;" openflag="0">');
				var a_element = img.parentElement;
				//删除原img标签
				img.parentNode.removeChild(img);

				var imgN = $('#img'+index)[0];
				//新img标签增加onclick事件
				imgN.onclick = function(event){
					//debugger;
					event = event || window.event;
					//屏蔽到外部的onclick事件
					event.cancelBubble = true;

					if(this.getAttribute("openflag") !== '1'){
						this.src = this.src.replace('_t','');
						this.style.maxWidth = "none";
						this.style.width = "";
						this.setAttribute("openflag","1");
					}
					else{
						//chrome浏览器必须使用71px才生效
						this.style.width = "71px";
						this.setAttribute("openflag","0");
					}
				};
			}
			if(lastName === 'pixhost.org'){
				//debugger;
				$(img).css('width','71px');
				//img.src = img.src.replace('_t','');
				//var img = this.firstChild;
				$(img.parentElement).removeAttr("target");
				img.parentElement.href = "javascript:void(0);";
				//重新插入img新标签，在原img的前面
				img.insertAdjacentHTML('beforeBegin', '<img id="img'+ index +'" src="'+ img.src +'" border="0" style="width: 71px;" openflag="0">');
				var a_element = img.parentElement;
				//删除原img标签
				img.parentNode.removeChild(img);

				var imgN = $('#img'+index)[0];
				//新img标签增加onclick事件
				imgN.onclick = function(event){
					//debugger;
					event = event || window.event;
					//屏蔽到外部的onclick事件
					event.cancelBubble = true;

					if(this.getAttribute("openflag") !== '1'){ 
						this.src = this.src.replace('//t','//img').replace('thumbs','images');
						this.style.maxWidth = "none";
						this.style.width = "100%";
						this.setAttribute("openflag","1");
					}
					else{
						//chrome浏览器必须使用71px才生效
						this.style.width = "71px";
						this.setAttribute("openflag","0");
					}
				};
			}
			else{
				$(img).css("max-width","none");
			}
		}
    }
}, false);