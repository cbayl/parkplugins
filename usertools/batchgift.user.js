// ==UserScript==
// @name         UserTool-BatchGift
// @name:zh      个人工具-批量赠送礼物
// @name:zh-CN   个人工具-批量赠送礼物
// @name:zh-HK   個人工具-批量贈送禮物
// @name:zh-SG   个人工具-批量赠送礼物
// @name:zh-TW   個人工具-批量贈送禮物
// @namespace    https://github.com/cbayl/
// @version      0.2
// @description  Batch send gifts in 6park bbs and forums
// @description:zh  通过此工具，您可以轻松批量赠送金币礼物，为您的留园体验增添更多便利。
// @description:zh-CN  一个用于在留园批量赠送金币礼物的用户工具。通过此工具，您可以轻松批量赠送金币礼物，为您的留园体验增添更多便利。
// @description:zh-HK  一個用於在留園批量贈送金幣禮物的用戶工具。通過此工具，您可以輕鬆批量贈送金幣禮物，為您的留園體驗增添更多便利。
// @description:zh-SG  一个用于在留园批量赠送金币礼物的用户工具。通过此工具，您可以轻松批量赠送金币礼物，为您的留园体验增添更多便利。
// @description:zh-TW  一個用於在留園批量贈送金幣禮物的用戶工具。通過此工具，您可以輕鬆批量贈送金幣禮物，為您的留園體驗增添更多便利。
// @license      MIT
// @author       lyabcv@gmail.com
// @match        https://home.6park.com/index.php?app=gift&act=showgift*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        GM.xmlHttpRequest
// @downloadURL  https://github.com/cbayl/parkplugins/raw/main/usertools/batchgift.user.js
// @updateURL    https://github.com/cbayl/parkplugins/raw/main/usertools/batchgift.user.js
// ==/UserScript==

(function() {
    'use strict';
    const SEND_DELAY = 3; //发送延迟(秒)，以免服务器反应不过来
    const RETRY_TIME = 1; //一个礼物重试次数
    const CHECK_AGAINST_GIFT_RECORD_PAGE = true ;//检查礼物记录页面
    const IF_RESEND=false;
    const TIME_DEFEFRENCE=3;
    const IF_OPEN_GIFT_RECORD_PAGE=true;//在礼物可能发送失败的时候,打开礼物记录页面

    console.log("个人工具-赠送礼物 0.2 by lyabc");
    console.log("支持用名字来赠送礼物");
    console.log("支持批量赠送，用中英文的逗号，中文顿号，或者是空格分隔");
    console.log("支持部分礼物名字");
    console.log("支持通配符*跟?");
    console.log("如果一次赠送许多礼物,可能会出现失败的情况,请根据网络状况自己设定发送间隔");


    const defaultPageURL = location.href;
    const serverTimeZone = -6;
    const giftDictionary = {"玫瑰花":{"n":"玫瑰花","i":"20","p":2,"c":0},"黄玫瑰":{"n":"黄玫瑰","i":"413","p":2,"c":0},"蝴蝶兰":{"n":"蝴蝶兰","i":"446","p":2,"c":0},"风信子":{"n":"风信子","i":"415","p":2,"c":0},"节节高":{"n":"节节高","i":"428","p":2,"c":0},"樱桃番茄":{"n":"樱桃番茄","i":"438","p":2,"c":0},"四叶草":{"n":"四叶草","i":"158","p":2,"c":0},"君子兰":{"n":"君子兰","i":"476","p":2,"c":0},"草莓":{"n":"草莓","i":"305","p":2,"c":0},"香蕉":{"n":"香蕉","i":"306","p":2,"c":0},"石榴花":{"n":"石榴花","i":"319","p":2,"c":0},"橄榄花环":{"n":"橄榄花环","i":"373","p":2,"c":0},"哈密瓜":{"n":"哈密瓜","i":"418","p":2,"c":0},"胡杨树":{"n":"胡杨树","i":"477","p":3,"c":0},"牡丹花王":{"n":"牡丹花王","i":"443","p":3,"c":0},"大仙桃":{"n":"大仙桃","i":"416","p":3,"c":0},"山谷幽兰":{"n":"山谷幽兰","i":"470","p":3,"c":0},"蓝色妖姬":{"n":"蓝色妖姬","i":"25","p":3,"c":0},"康乃馨":{"n":"康乃馨","i":"128","p":3,"c":0},"菠萝":{"n":"菠萝","i":"149","p":3,"c":0},"勿忘我":{"n":"勿忘我","i":"213","p":3,"c":0},"苹果":{"n":"苹果","i":"304","p":3,"c":0},"水晶梨":{"n":"水晶梨","i":"307","p":3,"c":0},"爱心玫瑰":{"n":"爱心玫瑰","i":"193","p":4,"c":0},"蓝莓":{"n":"蓝莓","i":"392","p":3,"c":0},"五星枇杷":{"n":"五星枇杷","i":"393","p":3,"c":0},"大果樱桃":{"n":"大果樱桃","i":"394","p":3,"c":0},"郁金香":{"n":"郁金香","i":"33","p":3,"c":0},"榴莲":{"n":"榴莲","i":"150","p":5,"c":0},"红瓤西瓜":{"n":"红瓤西瓜","i":"178","p":5,"c":0},"香槟玫瑰":{"n":"香槟玫瑰","i":"250","p":5,"c":0},"软籽石榴":{"n":"软籽石榴","i":"320","p":5,"c":0},"七星瓢虫":{"n":"七星瓢虫","i":"449","p":1,"c":1},"锦鲤":{"n":"锦鲤","i":"139","p":2,"c":1},"跟屁虫":{"n":"跟屁虫","i":"463","p":2,"c":1},"大刀螳螂":{"n":"大刀螳螂","i":"466","p":2,"c":1},"黄雀":{"n":"黄雀","i":"467","p":3,"c":1},"黄嘴八哥":{"n":"黄嘴八哥","i":"447","p":3,"c":1},"金丝雀":{"n":"金丝雀","i":"140","p":3,"c":1},"和平鸽":{"n":"和平鸽","i":"372","p":3,"c":1},"大耳兔":{"n":"大耳兔","i":"147","p":4,"c":1},"小刺猬":{"n":"小刺猬","i":"141","p":5,"c":1},"吉祥龟":{"n":"吉祥龟","i":"143","p":6,"c":1},"萌萌猫":{"n":"萌萌猫","i":"144","p":5,"c":1},"宠物犬":{"n":"宠物犬","i":"142","p":4,"c":1},"大鹦鹉":{"n":"大鹦鹉","i":"145","p":8,"c":1},"骏马":{"n":"骏马","i":"146","p":36,"c":1},"矿泉水":{"n":"矿泉水","i":"208","p":1,"c":2},"铁观音":{"n":"铁观音","i":"207","p":2,"c":2},"哈哈可乐":{"n":"哈哈可乐","i":"15","p":2,"c":2},"红茶":{"n":"红茶","i":"51","p":2,"c":2},"牛奶":{"n":"牛奶","i":"210","p":2,"c":2},"豆浆":{"n":"豆浆","i":"212","p":2,"c":2},"枸杞菊花":{"n":"枸杞菊花","i":"328","p":2,"c":2},"纯米清酒":{"n":"纯米清酒","i":"371","p":2,"c":2},"雄黄酒":{"n":"雄黄酒","i":"395","p":2,"c":2},"啤酒":{"n":"啤酒","i":"24","p":3,"c":2},"咖啡":{"n":"咖啡","i":"26","p":3,"c":2},"鸡尾酒":{"n":"鸡尾酒","i":"42","p":3,"c":2},"老陈醋":{"n":"老陈醋","i":"230","p":3,"c":2},"原酿酱油":{"n":"原酿酱油","i":"243","p":3,"c":2},"珍珠奶茶":{"n":"珍珠奶茶","i":"276","p":3,"c":2},"茉莉花茶":{"n":"茉莉花茶","i":"277","p":2,"c":2},"冰爽凉茶":{"n":"冰爽凉茶","i":"278","p":3,"c":2},"二锅头":{"n":"二锅头","i":"31","p":4,"c":2},"上等绿茶":{"n":"上等绿茶","i":"55","p":4,"c":2},"黄酒":{"n":"黄酒","i":"53","p":6,"c":2},"冰酒":{"n":"冰酒","i":"244","p":6,"c":2},"桂花米酒":{"n":"桂花米酒","i":"341","p":6,"c":2},"红葡萄酒":{"n":"红葡萄酒","i":"65","p":8,"c":2},"白葡萄酒":{"n":"白葡萄酒","i":"209","p":8,"c":2},"香槟酒":{"n":"香槟酒","i":"266","p":8,"c":2},"威士忌":{"n":"威士忌","i":"76","p":10,"c":2},"酱香白酒":{"n":"酱香白酒","i":"83","p":12,"c":2},"香包":{"n":"香包","i":"12","p":1,"c":3},"口红":{"n":"口红","i":"18","p":2,"c":3},"蝴蝶发夹":{"n":"蝴蝶发夹","i":"464","p":2,"c":3},"真丝围巾":{"n":"真丝围巾","i":"465","p":3,"c":3},"耳环":{"n":"耳环","i":"29","p":3,"c":3},"黑丝网袜":{"n":"黑丝网袜","i":"156","p":3,"c":3},"芭比娃娃":{"n":"芭比娃娃","i":"348","p":3,"c":3},"蝉翼内衣":{"n":"蝉翼内衣","i":"34","p":4,"c":3},"高跟鞋":{"n":"高跟鞋","i":"57","p":4,"c":3},"香水":{"n":"香水","i":"40","p":5,"c":3},"首饰盒":{"n":"首饰盒","i":"60","p":5,"c":3},"项链":{"n":"项链","i":"70","p":8,"c":3},"护肤品":{"n":"护肤品","i":"73","p":8,"c":3},"宝石戒指":{"n":"宝石戒指","i":"68","p":10,"c":3},"羊绒毛衣":{"n":"羊绒毛衣","i":"169","p":12,"c":3},"玉镯":{"n":"玉镯","i":"92","p":20,"c":3},"名牌风衣":{"n":"名牌风衣","i":"170","p":20,"c":3},"貂皮大衣":{"n":"貂皮大衣","i":"171","p":30,"c":3},"大钻戒":{"n":"大钻戒","i":"96","p":38,"c":3},"铂金手袋":{"n":"铂金手袋","i":"167","p":235,"c":15},"羽毛笔":{"n":"羽毛笔","i":"16","p":2,"c":4},"竹笛":{"n":"竹笛","i":"17","p":2,"c":4},"鸡缸杯":{"n":"鸡缸杯","i":"267","p":3,"c":4},"竹木笔筒":{"n":"竹木笔筒","i":"327","p":2,"c":4},"口琴":{"n":"口琴","i":"221","p":3,"c":4},"三角铁":{"n":"三角铁","i":"223","p":3,"c":4},"白金唱片":{"n":"白金唱片","i":"228","p":3,"c":4},"天球瓶":{"n":"天球瓶","i":"269","p":3,"c":4},"国风书签":{"n":"国风书签","i":"281","p":3,"c":4},"狼毫毛笔":{"n":"狼毫毛笔","i":"32","p":4,"c":4},"玉如意":{"n":"玉如意","i":"270","p":5,"c":4},"金话筒":{"n":"金话筒","i":"49","p":6,"c":4},"签字钢笔":{"n":"签字钢笔","i":"66","p":5,"c":4},"二胡":{"n":"二胡","i":"220","p":6,"c":4},"男式汉服":{"n":"男式汉服","i":"363","p":6,"c":4},"女式汉服":{"n":"女式汉服","i":"364","p":6,"c":4},"小号":{"n":"小号","i":"222","p":5,"c":4},"天然石砚":{"n":"天然石砚","i":"63","p":8,"c":4},"架子鼓":{"n":"架子鼓","i":"227","p":6,"c":4},"文昌金塔":{"n":"文昌金塔","i":"326","p":8,"c":4},"奇石摆件":{"n":"奇石摆件","i":"379","p":8,"c":4},"名人字画":{"n":"名人字画","i":"268","p":9,"c":4},"吉他":{"n":"吉他","i":"85","p":8,"c":4},"小提琴":{"n":"小提琴","i":"89","p":10,"c":4},"萨克斯风":{"n":"萨克斯风","i":"407","p":12,"c":4},"金笔":{"n":"金笔","i":"90","p":20,"c":4},"焦木古琴":{"n":"焦木古琴","i":"97","p":38,"c":4},"三角钢琴":{"n":"三角钢琴","i":"98","p":50,"c":4},"棒棒糖":{"n":"棒棒糖","i":"1","p":1,"c":5},"开心果":{"n":"开心果","i":"3","p":1,"c":5},"花生米":{"n":"花生米","i":"8","p":1,"c":5},"薯片":{"n":"薯片","i":"9","p":1,"c":5},"爆米花":{"n":"爆米花","i":"10","p":1,"c":5},"冰淇淋":{"n":"冰淇淋","i":"298","p":3,"c":5},"老坛酸菜":{"n":"老坛酸菜","i":"389","p":1,"c":5},"瓜子":{"n":"瓜子","i":"19","p":2,"c":5},"炸鸡":{"n":"炸鸡","i":"21","p":2,"c":5},"西湖藕粉":{"n":"西湖藕粉","i":"197","p":2,"c":5},"油炸灌肠":{"n":"油炸灌肠","i":"211","p":2,"c":5},"转转糖":{"n":"转转糖","i":"214","p":2,"c":5},"冰糖葫芦":{"n":"冰糖葫芦","i":"217","p":2,"c":5},"小鱼干":{"n":"小鱼干","i":"229","p":2,"c":5},"马蹄糕":{"n":"马蹄糕","i":"235","p":2,"c":5},"驴打滚儿":{"n":"驴打滚儿","i":"284","p":2,"c":5},"茶叶蛋":{"n":"茶叶蛋","i":"297","p":2,"c":5},"红豆冰棍":{"n":"红豆冰棍","i":"299","p":2,"c":5},"大枣":{"n":"大枣","i":"333","p":2,"c":5},"开口松子":{"n":"开口松子","i":"339","p":2,"c":5},"松子糕":{"n":"松子糕","i":"340","p":2,"c":5},"醪糟蛋":{"n":"醪糟蛋","i":"347","p":2,"c":5},"酸菜粉丝":{"n":"酸菜粉丝","i":"350","p":2,"c":7},"沙琪玛":{"n":"沙琪玛","i":"361","p":2,"c":5},"酸辣年糕":{"n":"酸辣年糕","i":"387","p":2,"c":5},"红油鸭蛋":{"n":"红油鸭蛋","i":"397","p":2,"c":5},"水果糖":{"n":"水果糖","i":"176","p":3,"c":5},"百花蜂蜜":{"n":"百花蜂蜜","i":"342","p":3,"c":5},"巧克力":{"n":"巧克力","i":"35","p":4,"c":5},"茯苓饼":{"n":"茯苓饼","i":"286","p":4,"c":5},"果仁蛋糕":{"n":"果仁蛋糕","i":"148","p":5,"c":5},"搞怪糖果":{"n":"搞怪糖果","i":"177","p":5,"c":5},"羊肉串":{"n":"羊肉串","i":"302","p":5,"c":5},"葱油饼":{"n":"葱油饼","i":"216","p":2,"c":6},"大麻花":{"n":"大麻花","i":"218","p":2,"c":6},"煎饼果子":{"n":"煎饼果子","i":"219","p":2,"c":6},"油炸春卷":{"n":"油炸春卷","i":"388","p":2,"c":6},"炸酱面":{"n":"炸酱面","i":"291","p":2,"c":6},"葱香花卷":{"n":"葱香花卷","i":"309","p":2,"c":6},"酥脆油条":{"n":"酥脆油条","i":"311","p":2,"c":6},"玉米窝头":{"n":"玉米窝头","i":"330","p":2,"c":6},"甜水面":{"n":"甜水面","i":"203","p":2,"c":6},"面线糊":{"n":"面线糊","i":"206","p":2,"c":6},"馄饨":{"n":"馄饨","i":"226","p":2,"c":6},"福州光饼":{"n":"福州光饼","i":"194","p":3,"c":6},"生煎包":{"n":"生煎包","i":"215","p":3,"c":6},"牛舌饼":{"n":"牛舌饼","i":"290","p":3,"c":6},"朝鲜冷面":{"n":"朝鲜冷面","i":"315","p":3,"c":6},"云吞面":{"n":"云吞面","i":"232","p":3,"c":6},"饺子":{"n":"饺子","i":"23","p":3,"c":6},"披萨饼":{"n":"披萨饼","i":"30","p":3,"c":6},"牛肉夹馍":{"n":"牛肉夹馍","i":"324","p":4,"c":6},"鲜肉小包":{"n":"鲜肉小包","i":"308","p":4,"c":6},"牛肉面":{"n":"牛肉面","i":"280","p":4,"c":6},"芝麻烧饼":{"n":"芝麻烧饼","i":"285","p":4,"c":6},"杏仁豆腐":{"n":"杏仁豆腐","i":"292","p":2,"c":7},"紫菜寿司":{"n":"紫菜寿司","i":"368","p":2,"c":7},"味噌汤":{"n":"味噌汤","i":"378","p":2,"c":7},"上汤苋菜":{"n":"上汤苋菜","i":"400","p":2,"c":7},"汤圆":{"n":"汤圆","i":"138","p":2,"c":7},"红豆甜粽":{"n":"红豆甜粽","i":"151","p":2,"c":7},"夫妻肺片":{"n":"夫妻肺片","i":"457","p":2,"c":7},"麻辣凉粉":{"n":"麻辣凉粉","i":"204","p":2,"c":7},"麻辣烫串":{"n":"麻辣烫串","i":"460","p":3,"c":7},"油焖笋":{"n":"油焖笋","i":"199","p":2,"c":7},"枫糖浆":{"n":"枫糖浆","i":"351","p":3,"c":7},"红油鸡片":{"n":"红油鸡片","i":"409","p":3,"c":7},"炒肝儿":{"n":"炒肝儿","i":"283","p":3,"c":7},"有机蔬菜":{"n":"有机蔬菜","i":"455","p":3,"c":7},"红烧肉":{"n":"红烧肉","i":"325","p":3,"c":7},"红烧排骨":{"n":"红烧排骨","i":"329","p":3,"c":7},"糯米肉粽":{"n":"糯米肉粽","i":"396","p":3,"c":7},"韭菜河虾":{"n":"韭菜河虾","i":"399","p":3,"c":7},"煲仔饭":{"n":"煲仔饭","i":"233","p":3,"c":7},"腊八粥":{"n":"腊八粥","i":"242","p":3,"c":7},"卤牛肉":{"n":"卤牛肉","i":"28","p":3,"c":7},"月饼":{"n":"月饼","i":"152","p":3,"c":7},"福州鱼丸":{"n":"福州鱼丸","i":"196","p":3,"c":7},"麻辣兔头":{"n":"麻辣兔头","i":"200","p":3,"c":7},"回锅肉":{"n":"回锅肉","i":"201","p":3,"c":7},"口水鸡":{"n":"口水鸡","i":"205","p":3,"c":7},"糖醋黄鱼":{"n":"糖醋黄鱼","i":"398","p":4,"c":7},"京华卤煮":{"n":"京华卤煮","i":"282","p":4,"c":7},"水煮鱼片":{"n":"水煮鱼片","i":"377","p":4,"c":7},"白切鸡":{"n":"白切鸡","i":"234","p":4,"c":7},"东坡肘子":{"n":"东坡肘子","i":"198","p":4,"c":7},"战斧牛排":{"n":"战斧牛排","i":"390","p":5,"c":7},"咖喱羊排":{"n":"咖喱羊排","i":"391","p":5,"c":7},"北京烤鸭":{"n":"北京烤鸭","i":"293","p":5,"c":7},"盐水鸭":{"n":"盐水鸭","i":"294","p":4,"c":7},"大闸蟹":{"n":"大闸蟹","i":"154","p":6,"c":7},"厨神金勺":{"n":"厨神金勺","i":"458","p":6,"c":12},"火鸡":{"n":"火鸡","i":"252","p":6,"c":7},"麻辣火锅":{"n":"麻辣火锅","i":"355","p":6,"c":7},"烛光晚餐":{"n":"烛光晚餐","i":"166","p":10,"c":7},"脆皮乳猪":{"n":"脆皮乳猪","i":"331","p":12,"c":7},"碳烤全羊":{"n":"碳烤全羊","i":"332","p":15,"c":7},"佛跳墙":{"n":"佛跳墙","i":"195","p":18,"c":7},"鼠标":{"n":"鼠标","i":"4","p":1,"c":8},"键盘":{"n":"键盘","i":"410","p":2,"c":8},"纸巾":{"n":"纸巾","i":"155","p":2,"c":8},"军用水壶":{"n":"军用水壶","i":"161","p":2,"c":8},"太阳伞":{"n":"太阳伞","i":"52","p":2,"c":8},"医用口罩":{"n":"医用口罩","i":"189","p":2,"c":8},"沙滩椅":{"n":"沙滩椅","i":"47","p":3,"c":8},"逍遥吊床":{"n":"逍遥吊床","i":"450","p":3,"c":8},"太阳镜":{"n":"太阳镜","i":"46","p":3,"c":8},"遥控飞机":{"n":"遥控飞机","i":"456","p":3,"c":8},"手表":{"n":"手表","i":"56","p":3,"c":8},"防晒霜":{"n":"防晒霜","i":"345","p":3,"c":8},"护目镜":{"n":"护目镜","i":"191","p":3,"c":8},"UV滤镜":{"n":"UV滤镜","i":"59","p":3,"c":8},"指南针":{"n":"指南针","i":"38","p":4,"c":8},"发烧耳机":{"n":"发烧耳机","i":"58","p":4,"c":8},"专业摄像":{"n":"专业摄像","i":"459","p":6,"c":8},"军用匕首":{"n":"军用匕首","i":"48","p":6,"c":8},"古巴雪茄":{"n":"古巴雪茄","i":"61","p":6,"c":8},"野营帐篷":{"n":"野营帐篷","i":"84","p":8,"c":8},"防弹背心":{"n":"防弹背心","i":"162","p":8,"c":8},"三脚架":{"n":"三脚架","i":"67","p":9,"c":8},"望远镜":{"n":"望远镜","i":"71","p":9,"c":8},"瑞士军刀":{"n":"瑞士军刀","i":"79","p":6,"c":8},"智能手机":{"n":"智能手机","i":"81","p":12,"c":8},"单反相机":{"n":"单反相机","i":"87","p":18,"c":8},"笔记电脑":{"n":"笔记电脑","i":"88","p":18,"c":8},"魔方":{"n":"魔方","i":"14","p":2,"c":9},"瑜伽毯":{"n":"瑜伽毯","i":"43","p":3,"c":9},"滑板":{"n":"滑板","i":"44","p":3,"c":9},"高尔夫杆":{"n":"高尔夫杆","i":"343","p":3,"c":9},"羽毛球拍":{"n":"羽毛球拍","i":"50","p":4,"c":9},"篮球":{"n":"篮球","i":"62","p":4,"c":9},"跑鞋":{"n":"跑鞋","i":"224","p":4,"c":9},"登山杖":{"n":"登山杖","i":"225","p":4,"c":9},"哑铃":{"n":"哑铃","i":"45","p":5,"c":9},"网球球拍":{"n":"网球球拍","i":"461","p":5,"c":9},"高尔夫车":{"n":"高尔夫车","i":"344","p":5,"c":9},"泡沫轴":{"n":"泡沫轴","i":"163","p":2,"c":9},"国际象棋":{"n":"国际象棋","i":"182","p":5,"c":9},"游戏机":{"n":"游戏机","i":"69","p":6,"c":9},"拳击手套":{"n":"拳击手套","i":"289","p":6,"c":9},"足球":{"n":"足球","i":"78","p":8,"c":9},"滑雪套装":{"n":"滑雪套装","i":"354","p":8,"c":9},"VR头盔":{"n":"VR头盔","i":"80","p":9,"c":9},"围棋":{"n":"围棋","i":"181","p":9,"c":9},"自行车":{"n":"自行车","i":"77","p":10,"c":9},"跑步机":{"n":"跑步机","i":"86","p":18,"c":9},"古董手枪":{"n":"古董手枪","i":"160","p":12,"c":14},"紫铜腰带":{"n":"紫铜腰带","i":"273","p":18,"c":12},"白银腰带":{"n":"白银腰带","i":"274","p":36,"c":12},"狙击猎枪":{"n":"狙击猎枪","i":"312","p":40,"c":15},"帅哥私教":{"n":"帅哥私教","i":"164","p":50,"c":15},"黄金腰带":{"n":"黄金腰带","i":"275","p":88,"c":12},"美女陪练":{"n":"美女陪练","i":"165","p":100,"c":15},"圣诞袜":{"n":"圣诞袜","i":"121","p":1,"c":10},"福字窗花":{"n":"福字窗花","i":"131","p":1,"c":10},"圣诞帽":{"n":"圣诞帽","i":"122","p":2,"c":10},"吉祥小兔":{"n":"吉祥小兔","i":"130","p":2,"c":10},"快乐鞭炮":{"n":"快乐鞭炮","i":"132","p":2,"c":10},"压岁红包":{"n":"压岁红包","i":"137","p":2,"c":10},"送上一幅":{"n":"送上一幅","i":"489","p":2,"c":10},"柿柿如意":{"n":"柿柿如意","i":"352","p":2,"c":10},"财源滚滚":{"n":"财源滚滚","i":"353","p":2,"c":10},"复活彩蛋":{"n":"复活彩蛋","i":"248","p":2,"c":10},"复活兔兔":{"n":"复活兔兔","i":"249","p":3,"c":10},"许愿蛋":{"n":"许愿蛋","i":"123","p":3,"c":10},"新年烟花":{"n":"新年烟花","i":"127","p":3,"c":10},"中国结":{"n":"中国结","i":"133","p":3,"c":10},"南瓜灯":{"n":"南瓜灯","i":"153","p":3,"c":10},"骷髅面具":{"n":"骷髅面具","i":"172","p":3,"c":10},"女鬼面具":{"n":"女鬼面具","i":"175","p":3,"c":10},"新年花灯":{"n":"新年花灯","i":"184","p":3,"c":10},"幸运牌":{"n":"幸运牌","i":"186","p":3,"c":10},"平安符":{"n":"平安符","i":"187","p":3,"c":10},"金色风铃":{"n":"金色风铃","i":"134","p":4,"c":10},"男鬼面具":{"n":"男鬼面具","i":"174","p":4,"c":10},"圣诞树":{"n":"圣诞树","i":"124","p":5,"c":10},"猫脸面具":{"n":"猫脸面具","i":"173","p":5,"c":10},"贺岁礼包":{"n":"贺岁礼包","i":"64","p":6,"c":10},"雪橇车":{"n":"雪橇车","i":"125","p":6,"c":10},"水晶圣球":{"n":"水晶圣球","i":"126","p":6,"c":10},"雪人":{"n":"雪人","i":"129","p":6,"c":10},"红灯笼":{"n":"红灯笼","i":"135","p":6,"c":10},"开运礼包":{"n":"开运礼包","i":"185","p":6,"c":10},"财神像":{"n":"财神像","i":"136","p":7,"c":10},"烂番茄":{"n":"烂番茄","i":"1001","p":1,"c":11},"呕吐袋":{"n":"呕吐袋","i":"404","p":1,"c":11},"西瓜皮":{"n":"西瓜皮","i":"406","p":1,"c":11},"媚眼儿":{"n":"媚眼儿","i":"469","p":1,"c":11},"白日梦卡":{"n":"白日梦卡","i":"444","p":2,"c":11},"藐视手势":{"n":"藐视手势","i":"484","p":2,"c":11},"冰水":{"n":"冰水","i":"411","p":2,"c":11},"鼓掌神器":{"n":"鼓掌神器","i":"471","p":2,"c":11},"国际脸儿":{"n":"国际脸儿","i":"462","p":2,"c":11},"大喇叭":{"n":"大喇叭","i":"412","p":2,"c":11},"狐狸尾巴":{"n":"狐狸尾巴","i":"448","p":2,"c":11},"粘嗒浆糊":{"n":"粘嗒浆糊","i":"414","p":2,"c":11},"惊堂木":{"n":"惊堂木","i":"321","p":2,"c":11},"心灵鸡汤":{"n":"心灵鸡汤","i":"440","p":2,"c":11},"大巴掌":{"n":"大巴掌","i":"334","p":2,"c":11},"狂徒印章":{"n":"狂徒印章","i":"478","p":3,"c":11},"绿帽子":{"n":"绿帽子","i":"13","p":2,"c":11},"鄙夷白眼":{"n":"鄙夷白眼","i":"483","p":3,"c":11},"板砖":{"n":"板砖","i":"159","p":2,"c":11},"黑色眼罩":{"n":"黑色眼罩","i":"475","p":2,"c":11},"熊猫眼罩":{"n":"熊猫眼罩","i":"453","p":2,"c":11},"臭鸡蛋":{"n":"臭鸡蛋","i":"1002","p":2,"c":11},"幻想球":{"n":"幻想球","i":"401","p":2,"c":11},"达成共识":{"n":"达成共识","i":"405","p":2,"c":11},"超速罚单":{"n":"超速罚单","i":"402","p":2,"c":11},"老虎凳子":{"n":"老虎凳子","i":"419","p":2,"c":11},"辣椒水":{"n":"辣椒水","i":"420","p":3,"c":11},"绣花小鞋":{"n":"绣花小鞋","i":"421","p":3,"c":11},"当头闷棍":{"n":"当头闷棍","i":"403","p":3,"c":11},"全钢手铐":{"n":"全钢手铐","i":"454","p":3,"c":11},"鸡毛掸子":{"n":"鸡毛掸子","i":"335","p":3,"c":11},"杀威杖":{"n":"杀威杖","i":"322","p":3,"c":11},"木头笨蛋":{"n":"木头笨蛋","i":"279","p":3,"c":11},"兜蛋裤":{"n":"兜蛋裤","i":"111","p":3,"c":11},"脑残片":{"n":"脑残片","i":"179","p":3,"c":11},"安眠药":{"n":"安眠药","i":"303","p":3,"c":11},"胡椒面":{"n":"胡椒面","i":"310","p":3,"c":11},"恶魔果实":{"n":"恶魔果实","i":"231","p":3,"c":11},"大金锁链":{"n":"大金锁链","i":"452","p":4,"c":11},"印度神油":{"n":"印度神油","i":"37","p":4,"c":11},"防狼喷雾":{"n":"防狼喷雾","i":"39","p":4,"c":11},"安全套":{"n":"安全套","i":"188","p":4,"c":11},"皮鞭":{"n":"皮鞭","i":"157","p":5,"c":11},"脑铂金":{"n":"脑铂金","i":"180","p":5,"c":11},"狗皮膏药":{"n":"狗皮膏药","i":"192","p":5,"c":11},"铁秤砣":{"n":"铁秤砣","i":"1005","p":5,"c":11},"救援救护":{"n":"救援救护","i":"300","p":6,"c":11},"蓝色药丸":{"n":"蓝色药丸","i":"112","p":6,"c":11},"后悔药":{"n":"后悔药","i":"255","p":6,"c":11},"秘制白药":{"n":"秘制白药","i":"258","p":6,"c":11},"忘情水":{"n":"忘情水","i":"260","p":3,"c":11},"钢盔":{"n":"钢盔","i":"74","p":9,"c":11},"充气娃娃":{"n":"充气娃娃","i":"75","p":10,"c":11},"大补金丹":{"n":"大补金丹","i":"259","p":10,"c":11},"小鲜肉":{"n":"小鲜肉","i":"113","p":12,"c":11},"孟婆汤":{"n":"孟婆汤","i":"261","p":5,"c":11},"老实证书":{"n":"老实证书","i":"359","p":1,"c":12},"吃货证书":{"n":"吃货证书","i":"445","p":2,"c":12},"收藏证书":{"n":"收藏证书","i":"472","p":2,"c":12},"好人卡":{"n":"好人卡","i":"357","p":2,"c":12},"健康证":{"n":"健康证","i":"358","p":2,"c":12},"学霸证书":{"n":"学霸证书","i":"365","p":2,"c":12},"种植能手":{"n":"种植能手","i":"442","p":2,"c":12},"神童卡":{"n":"神童卡","i":"288","p":3,"c":13},"博论金牌":{"n":"博论金牌","i":"441","p":3,"c":12},"老司机证":{"n":"老司机证","i":"313","p":3,"c":12},"实力勋章":{"n":"实力勋章","i":"236","p":3,"c":12},"厨神奖章":{"n":"厨神奖章","i":"323","p":3,"c":12},"美女证书":{"n":"美女证书","i":"256","p":3,"c":12},"帅哥证书":{"n":"帅哥证书","i":"257","p":3,"c":12},"茶馆老泡":{"n":"茶馆老泡","i":"296","p":4,"c":13},"鸭嘴证书":{"n":"鸭嘴证书","i":"426","p":4,"c":12},"收藏金牌":{"n":"收藏金牌","i":"473","p":5,"c":12},"好老公证":{"n":"好老公证","i":"253","p":5,"c":12},"好老婆证":{"n":"好老婆证","i":"254","p":5,"c":12},"拆蛋专家":{"n":"拆蛋专家","i":"295","p":3,"c":12},"侦探勋章":{"n":"侦探勋章","i":"366","p":5,"c":12},"潜伏勋章":{"n":"潜伏勋章","i":"367","p":5,"c":12},"诗人证书":{"n":"诗人证书","i":"422","p":5,"c":12},"乡长证书":{"n":"乡长证书","i":"369","p":5,"c":12},"三级勋章":{"n":"三级勋章","i":"376","p":100,"c":12},"二级勋章":{"n":"二级勋章","i":"375","p":300,"c":12},"一级勋章":{"n":"一级勋章","i":"374","p":500,"c":12},"敢斗奖杯":{"n":"敢斗奖杯","i":"336","p":10,"c":12},"勇士奖杯":{"n":"勇士奖杯","i":"337","p":25,"c":12},"冠军奖杯":{"n":"冠军奖杯","i":"338","p":50,"c":12},"笑傲江湖":{"n":"笑傲江湖","i":"346","p":50,"c":12},"幸运星":{"n":"幸运星","i":"386","p":1,"c":13},"竹蜻蜓":{"n":"竹蜻蜓","i":"1003","p":1,"c":13},"铜钱":{"n":"铜钱","i":"6","p":1,"c":13},"折纸风车":{"n":"折纸风车","i":"246","p":1,"c":13},"定心丸":{"n":"定心丸","i":"384","p":1,"c":13},"智多星":{"n":"智多星","i":"287","p":2,"c":13},"狂赞高明":{"n":"狂赞高明","i":"482","p":2,"c":13},"高帽子":{"n":"高帽子","i":"485","p":2,"c":13},"加油":{"n":"加油","i":"486","p":2,"c":13},"行上一礼":{"n":"行上一礼","i":"487","p":2,"c":13},"大法螺":{"n":"大法螺","i":"408","p":2,"c":13},"逗猫棒":{"n":"逗猫棒","i":"301","p":2,"c":13},"拍马扇":{"n":"拍马扇","i":"317","p":2,"c":13},"暴露证明":{"n":"暴露证明","i":"370","p":2,"c":13},"美梦卡":{"n":"美梦卡","i":"318","p":3,"c":13},"彩色气球":{"n":"彩色气球","i":"247","p":3,"c":13},"疫苗护照":{"n":"疫苗护照","i":"356","p":3,"c":13},"孔明灯":{"n":"孔明灯","i":"1004","p":3,"c":13},"金箍棒":{"n":"金箍棒","i":"314","p":4,"c":13},"神算子":{"n":"神算子","i":"41","p":4,"c":13},"镇版之宝":{"n":"镇版之宝","i":"237","p":5,"c":13},"天平秤":{"n":"天平秤","i":"385","p":6,"c":13},"火星船票":{"n":"火星船票","i":"316","p":8,"c":13},"银元宝":{"n":"银元宝","i":"72","p":10,"c":13},"小皇冠":{"n":"小皇冠","i":"91","p":20,"c":13},"金元宝":{"n":"金元宝","i":"93","p":30,"c":15},"热气球":{"n":"热气球","i":"1006","p":30,"c":13},"骰子":{"n":"骰子","i":"2","p":1,"c":14},"小黄人":{"n":"小黄人","i":"5","p":1,"c":14},"筹码":{"n":"筹码","i":"7","p":1,"c":14},"韭菜":{"n":"韭菜","i":"381","p":1,"c":14},"塔罗牌":{"n":"塔罗牌","i":"22","p":2,"c":14},"苦瓜":{"n":"苦瓜","i":"380","p":2,"c":14},"放大镜":{"n":"放大镜","i":"360","p":2,"c":14},"红色蜡烛":{"n":"红色蜡烛","i":"451","p":2,"c":14},"黄瓜":{"n":"黄瓜","i":"382","p":2,"c":14},"偃月关刀":{"n":"偃月关刀","i":"474","p":3,"c":14},"痒痒挠":{"n":"痒痒挠","i":"383","p":2,"c":14},"熊猫玩偶":{"n":"熊猫玩偶","i":"202","p":2,"c":14},"奶瓶":{"n":"奶瓶","i":"27","p":2,"c":14},"毛绒玩偶":{"n":"毛绒玩偶","i":"36","p":3,"c":14},"桃木剑":{"n":"桃木剑","i":"54","p":3,"c":14},"圆月弯刀":{"n":"圆月弯刀","i":"435","p":3,"c":14},"倚天长剑":{"n":"倚天长剑","i":"468","p":4,"c":14},"小李飞刀":{"n":"小李飞刀","i":"439","p":3,"c":14},"七龙珠":{"n":"七龙珠","i":"271","p":3,"c":14},"一帆风顺":{"n":"一帆风顺","i":"427","p":3,"c":14},"电风扇":{"n":"电风扇","i":"417","p":3,"c":14},"防护服":{"n":"防护服","i":"190","p":3,"c":14},"屠龙宝刀":{"n":"屠龙宝刀","i":"437","p":4,"c":14},"开山大斧":{"n":"开山大斧","i":"430","p":4,"c":14},"长命金锁":{"n":"长命金锁","i":"183","p":6,"c":14},"机车战士":{"n":"机车战士","i":"272","p":3,"c":14},"水晶球":{"n":"水晶球","i":"82","p":12,"c":14},"铜卡门票":{"n":"铜卡门票","i":"425","p":10,"c":14},"银卡门票":{"n":"银卡门票","i":"424","p":20,"c":14},"金卡门票":{"n":"金卡门票","i":"423","p":50,"c":14},"动感黄金卡":{"n":"动感黄金卡","i":"239","p":50,"c":14},"动感铂金卡":{"n":"动感铂金卡","i":"240","p":100,"c":14},"动感黑金卡":{"n":"动感黑金卡","i":"241","p":200,"c":14},"摩托车":{"n":"摩托车","i":"94","p":30,"c":15},"金饭碗":{"n":"金饭碗","i":"95","p":36,"c":15},"小轿车":{"n":"小轿车","i":"99","p":60,"c":15},"吉普车":{"n":"吉普车","i":"100","p":80,"c":15},"鸿运金牛":{"n":"鸿运金牛","i":"245","p":99,"c":15},"金虎纳福":{"n":"金虎纳福","i":"362","p":99,"c":15},"金兔呈祥":{"n":"金兔呈祥","i":"1096","p":99,"c":15},"送上一尊":{"n":"送上一尊","i":"488","p":99,"c":15},"爱心火箭":{"n":"爱心火箭","i":"101","p":100,"c":15},"豪华房车":{"n":"豪华房车","i":"102","p":120,"c":15},"大宝箱":{"n":"大宝箱","i":"103","p":180,"c":15},"装甲车":{"n":"装甲车","i":"431","p":200,"c":15},"直升机":{"n":"直升机","i":"104","p":280,"c":15},"游艇":{"n":"游艇","i":"105","p":380,"c":15},"别墅":{"n":"别墅","i":"106","p":500,"c":15},"私人飞机":{"n":"私人飞机","i":"107","p":800,"c":15},"超级火箭":{"n":"超级火箭","i":"108","p":1000,"c":15},"庄园城堡":{"n":"庄园城堡","i":"168","p":2500,"c":15}};
    const giftCategories = ["鲜花水果", "动物类", "酒水饮品", "女生专属", "文艺范", "零食", "面食", "美食", "休闲", "运动", "节日", "搞怪", "证书勋章", "趣味礼品", "其他礼物", "豪华大礼"];

    const giftReceiver = document.querySelector("body > div.content > div > div:nth-child(1) > div.gift-gold-num > span:nth-child(2)").textContent.trim();

    let userModeSilence = false;
    let userModePrice = false;
    let userModePicture = false;
    let userModeDebug = false;
    let info="";

    let currentServerDateTime = getServerDateTime(serverTimeZone);

    function getServerDateTime(serverOffset) {
        // 创建本地时间的Date对象
        var localDate = new Date();

        // 获取本地时区偏移量（分钟为单位）
        var localOffset = localDate.getTimezoneOffset();

        // 计算本地时间转换为服务器时间的毫秒数
        var serverTime = localDate.getTime() + (localOffset + serverOffset*60) * 60 * 1000;

        // 创建服务器时间的 Date 对象
        var serverDate = new Date(serverTime);
        return serverDate;
    }

    const delay = (s) => new Promise(resolve => setTimeout(resolve, s * 1000));

    function getTokenAndBalance(giftName, giftCatergory) {
        const currentUrl = window.location.href;
        const urlPrefix = currentUrl.split("&gift_type=")[0] + "&gift_type=";

        const result = {
            balance: "",
            token: ""
        };

        const xhr = new XMLHttpRequest();
        const currentCategory = giftCatergory;
        const url = urlPrefix + encodeURIComponent(currentCategory);

        // 发送请求
        xhr.open("GET", url, false); // 同步请求
        xhr.send();

        // 处理响应
        if (xhr.readyState == 4 && xhr.status == 200) {
            const response = xhr.responseText;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response, "text/html");

            const formElement = xmlDoc.querySelector("body > div.content > div > div.gift-box > ul > form");

            if (formElement) {
                const actionValue = formElement.getAttribute("action");
                const match = actionValue.match(/token=(\d+)/);

                if (match) {
                    result.token = match[1];
                } else {
                    console.log("未在action中找到token");
                }
            } else {
                console.log("未找到form元素");
            }

            const balanceElement = xmlDoc.querySelector("body > div.content > div > div:nth-child(1) > div.gift-gold-num > span:nth-child(3)");
            if (balanceElement) {
                const balance = balanceElement.textContent.trim();
                result.balance = balance;
            } else {
                console.log("未找到balance元素");
            }
        }
        return result;
    }

    function sendGift(gift_id, account_balance, gift_type, token) {
        const url = `${defaultPageURL.replace("showgift", "dogift")}&token=${token}&wap=`;
        const referer_url = `${defaultPageURL}${defaultPageURL.indexOf('gift_type=') === -1 ? "&gift_type=" + gift_type : ''}`;

        fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
            referrer: referer_url,
            referrerPolicy: "no-referrer-when-downgrade",
            body: `gift_id=${gift_id}&account=${account_balance}`,
        });
    }

    //严格的通配符匹配
    function wildcardSearch(pattern, str) {
        // 将通配符转换为正则表达式
        const regexPattern = pattern
        .replace(/\?/g, '.')
        .replace(/\*/g, '.*');

        const regex = new RegExp(`^${regexPattern}$`);
        // 进行匹配
        return regex.test(str);
    }

    //部分匹配,更适合
    function wildcardSearch2(pattern, str) {
        // 将通配符转换为正则表达式
        const regexPattern = pattern.replace(/\?/g, ".").replace(/\*/g, ".*");
        const regex = new RegExp(regexPattern);

        // 进行匹配
        return regex.test(str);
    }


    function searchGifts(givenNameList) {
        const resultsArray = [];

        for (const giftName of givenNameList) {
            for (const key in giftDictionary) {
                if(wildcardSearch2(giftName,key)){
                    resultsArray.push(giftDictionary[key]);
                    // 找到匹配项后立即结束循环
                    break;
                }
            }
        }

        return resultsArray;
    }
    async function sendAllGifts(sendList) {
        // debugger;
        for (const gift of sendList) {
            let giftCatogery = giftCategories[gift.c];
            let result = getTokenAndBalance(gift.n, giftCatogery);

            if(!userModeSilence){
                info += ("发送礼物："+ gift.n+'\n');
                updateInfoPanel(info);
            }

            await sendGift(gift.i, result.balance, giftCatogery, result.token);
            await delay(SEND_DELAY);
        }
        alert("发送完毕");
        if(CHECK_AGAINST_GIFT_RECORD_PAGE){
            await delay(SEND_DELAY+3);
            checkMultipleGiftStatusWithXHR(sendList, giftReceiver, currentServerDateTime)
                .then(function(unsuccessfulGiftList) {
                // 在这里可以处理未发送成功的礼物列表
                console.log("未发送成功的礼物列表：", unsuccessfulGiftList);
                if (unsuccessfulGiftList.length==0) {
                    // alert("礼物发送成功");
                    info += ('礼物发送成功\n');
                    updateInfoPanel(info);
                } else{
                    alert("以下礼物可能未发送成功:\n"+unsuccessfulGiftList.map(obj => obj.n).join(', ')+'\n请过一会刷新页面查看');
                    info += ("以下礼物可能未发送成功:\n"+unsuccessfulGiftList.map(obj => obj.n).join(', ')+'\n请过一会刷新页面查看');
                    //可能未发送成功的礼物复制到剪贴板
                    GM_setClipboard(unsuccessfulGiftList.map(obj => obj.n).join(', '));
                    updateInfoPanel(info);
                    //打开礼物记录页面
                    if(IF_OPEN_GIFT_RECORD_PAGE) window.open('https://home.6park.com/index.php?app=gift&act=giftlog', '_blank');
                }
                if(IF_RESEND){
                    // sendAllGifts(unsuccessfulGiftList); //取消这个功能了,避免进入死循环. 如果未发送成功,让用户自己重新发送吧.
                }
            })
                .catch(function(error) {
                console.error("发生错误：", error);
            });
        }
    }

    function checkMultipleGiftStatusWithXHR(giftList, receiverName, currentServerDateTime) {
        var xhr = new XMLHttpRequest();
        var url = "https://home.6park.com/index.php?app=gift&act=giftlog";
        var unsuccessfulGiftList = [];

        return new Promise(function(resolve, reject) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    // 获取页面内容后的处理逻辑
                    var giftPageContent = xhr.responseText;

                    // 解析页面内容并检查礼物赠送记录
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(giftPageContent, "text/html");

                    var giftElements = doc.querySelectorAll("body > div.mian > div.left_content > div > div.gift-list > section > div.gift-man.fr");

                    // for (var i = 0; i < Math.min(giftElements.length, giftList.length); i++) {
                    for (var i = giftList.length - 1; i >= 0; i--){
                        var currentGift = giftList[i];
                        var foundMatch = false;

                        for (var j = 0; j < giftList.length; j++) {
                            var giftRecordText = giftElements[j].textContent;
                            var giftTimeElement = giftElements[j].querySelector("p.mar13");

                            // 判断文字里是否包含当前礼物的信息（只检查礼物名字，不检查对象名称）
                            if (giftRecordText.includes(currentGift.n) && giftTimeElement) {
                                var recordTime = new Date(giftTimeElement.textContent);
                                console.log("record time: "+recordTime);
                                console.log("server time: "+currentServerDateTime);

                                // 判断礼物记录时间是否在当前时间前后3分钟之内
                                var timeDiff = Math.abs(recordTime - currentServerDateTime);
                                var timeDiffInMinutes = timeDiff / (1000 * 60);

                                if (timeDiffInMinutes <= TIME_DEFEFRENCE) {
                                    // 找到匹配的记录，标记为发送成功
                                    foundMatch = true;
                                    break; // 停止内层循环，已找到匹配
                                }
                            }
                        }

                        if (!foundMatch) {
                            // 没有找到匹配的记录，添加到未发送成功的礼物列表
                            unsuccessfulGiftList.push(currentGift);
                        }
                    }

                    // 输出检查结果
                    console.log("检查完毕，发送成功的礼物列表：", giftList.filter(gift => !unsuccessfulGiftList.includes(gift)));
                    console.log("未发送成功的礼物列表：", unsuccessfulGiftList);

                    // 返回结果
                    resolve(unsuccessfulGiftList);
                }
            };

            xhr.open("GET", url, true);
            xhr.send();
        });
    }
    function updateInfoPanel(info){
        resultSpan.textContent=info;
    }

    function doBatchGift(giftNameList) {
        //搜索礼物
        const sendList = searchGifts(giftNameList);
        let searchSummary="";
        searchSummary += ("即将发送礼物："+ sendList.map(obj => obj.n).join(', ')+'\n');
        searchSummary += ("总金币数："+ sendList.map(obj => obj.p).reduce((acc, curr) => acc + curr, 0)+'\n');
        info += searchSummary;
        updateInfoPanel(info);

        // 弹窗
        var userChoice = confirm(searchSummary+"\n确定要发送吗？");

        if (userChoice) {
            // 用户点击了确定，执行发送的逻辑
            // 可以在这里添加发送的代码
            //将搜索成功的礼物发送
            sendAllGifts(sendList);
            console.log("用户点击了发送");
        } else {
            // 用户点击了取消，执行取消的逻辑
            console.log("用户点击了取消");
            info += "发送取消\n"
            updateInfoPanel(info);
            return;
        }

    }

    //根据用户输入设置参数,并提取礼物列表
    function parseInput(inputText) {
        //以后扩展
        if (inputText.includes("silence")) userModeSilence = true;
        if (inputText.includes("price")) userModePrice = true;
        if (inputText.includes("picture")) userModePicture = true;
        if (inputText.includes("debug")) userModeDebug = true;

        return inputText.replace(/silence|price|picture|debug/g, '').split(/[,\s;，、]/).map(gift => gift.trim()).filter(gift => gift !== "");
    }

    //页面元素
    const inputBox = document.createElement('input');
    inputBox.setAttribute('type', 'text');
    inputBox.setAttribute('placeholder', '输入需要赠送的礼物名称');
    const pageWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const inputBoxWidth = 0.6 * pageWidth;
    inputBox.style.width = inputBoxWidth + 'px';

    const sendButton = document.createElement('button');
    sendButton.innerText = '发送礼物';

    const resultDiv = document.createElement('div');
    const resultDivWidth = inputBoxWidth+43;

    resultDiv.style.width = resultDivWidth + 'px';
    resultDiv.style.marginTop = '10px';
    resultDiv.style.padding = '10px';
    resultDiv.style.backgroundColor = '#fff';
    resultDiv.style.border = '1px solid #fff';
    resultDiv.style.borderRadius = '5px';
    resultDiv.style.display = 'block';
    resultDiv.style.margin = '0 auto'; // 设置水平居中

    // 创建用于输出文字的 span 元素
    const resultSpan = document.createElement('span');

    // 将 span 元素插入到 resultDiv 中
    resultDiv.appendChild(resultSpan);

    const giftBox = document.querySelector('body > div.content > div > div.gift-box');

    giftBox.insertBefore(resultDiv, giftBox.firstChild);
    giftBox.insertBefore(sendButton, giftBox.firstChild);
    giftBox.insertBefore(inputBox, giftBox.firstChild);

    sendButton.addEventListener('click', async function () {
        const inputText = inputBox.value;
        if (!inputText || inputText === "") {
            console.log("输入不能为空");
            return;
        }
        //根据用户输入设置参数,并提取出礼物列表
        const giftNameList = parseInput(inputText);
        //执行BatchGift
        doBatchGift(giftNameList);
    });
})();
