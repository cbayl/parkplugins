// ==UserScript==
// @name         UserTool-BatchGift
// @name:zh      个人工具-批量赠送礼物
// @name:zh-CN   个人工具-批量赠送礼物
// @name:zh-HK   個人工具-批量贈送禮物
// @name:zh-SG   个人工具-批量赠送礼物
// @name:zh-TW   個人工具-批量贈送禮物
// @namespace    https://github.com/cbayl/
// @version      0.1
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
    console.log("个人工具-赠送礼物 by lyabc");
    console.log("支持用名字来赠送礼物")
    console.log("支持批量赠送，用中英文的逗号，中文顿号，或者是空格分隔")
    console.log("如果一次赠送许多礼物，可能会稍微慢一点")
    console.log("如果想要静默发送，可以在末尾添加666")

    let defaultPageURL = location.href;

    function searchGiftOnline(giftName) {
        // 获取当前页面的URL
        var currentUrl = window.location.href;

        // 定义礼物类别数组
        var giftCategories = ["鲜花水果", "动物类", "酒水饮品", "女生专属", "文艺范", "零食", "面食", "美食", "休闲", "运动", "节日", "搞怪", "证书勋章", "趣味礼品", "其他礼物", "豪华大礼"];

        // 从当前页面URL中提取前半部分，用于构造礼物类别页面的URL
        var urlPrefix = currentUrl.split("&gift_type=")[0] + "&gift_type=";

        // 创建结果对象
        var result = {
            gift: null,
            category: null,
            token: null
        };

        // 遍历礼物类别
        for (var j = 0; j < giftCategories.length; j++) {
            // 创建XMLHttpRequest对象
            var xhr = new XMLHttpRequest();

            // 获取当前礼物类别
            var currentCategory = giftCategories[j];

            // 构造礼物类别页面的URL
            var url = urlPrefix + encodeURIComponent(currentCategory);

            // 发送请求
            xhr.open("GET", url, false); // 同步请求
            xhr.send();

            // 处理响应
            if (xhr.readyState == 4 && xhr.status == 200) {
                var response = xhr.responseText;

                // 创建一个虚拟DOM以便进行DOM操作
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(response, "text/html");

                // 获取form元素
                var formElement = xmlDoc.querySelector("body > div.content > div > div.gift-box > ul > form");

                // 检查是否找到了form元素
                if (formElement) {
                    // 获取action的值
                    var actionValue = formElement.getAttribute("action");

                    // 使用正则表达式提取token的值
                    var match = actionValue.match(/token=(\d+)/);

                    // 检查是否匹配到token
                    if (match) {
                        result.token = match[1];
                        // 打印token的值
                        //console.log("Token值: " + result.token);
                    } else {
                        console.log("未在action中找到token");
                    }
                } else {
                    console.log("未找到form元素");
                }

                // 获取礼物元素列表
                var giftElements = xmlDoc.querySelectorAll("body > div.content > div > div.gift-box > ul > form > li");

                // 遍历礼物元素列表
                for (var i = 0; i < giftElements.length; i++) {
                    // 获取当前礼物元素
                    var currentGiftElement = giftElements[i];

                    // 获取礼物名称元素
                    var giftNameElement = currentGiftElement.querySelector("p.mg20 b");

                    // 判断礼物名称是否是所需的礼物名
                    if (giftNameElement && giftNameElement.innerText.trim() === giftName) {
                        // 获取礼物图片链接
                        var giftImageElement = currentGiftElement.querySelector("p img.gift-icon");
                        var giftImageLink = giftImageElement ? giftImageElement.src : '';

                        // 获取礼物ID
                        var giftIdElement = currentGiftElement.querySelector("input[name='gift_id']");
                        var giftId = giftIdElement ? giftIdElement.value : '';

                        // 获取礼物价格
                        var giftPriceElement = currentGiftElement.querySelector("p span");
                        var giftPriceText = giftPriceElement ? giftPriceElement.innerText.trim() : '';
                        // 移除价格中的"金币"并转换为整数
                        var giftPrice = parseInt(giftPriceText.replace("金币", ''), 10);

                        // 设置结果对象的值
                        result.gift = {
                            name: giftName,
                            imgURL: giftImageLink,
                            price: giftPrice,
                            id: giftId
                        };

                        result.category = currentCategory;

                        // 返回结果
                        return result;
                    }
                }
            }
        }

        // 如果循环结束仍然没有找到目标礼物
        return result;
    }

    function sendGift(gift_id,account_balance,gift_type,token){
        var url=defaultPageURL.replace("showgift","dogift")+"&token="+token+"&wap="
        // var referer_url=defaultPageURL+"&gift_type="+gift_type
        var referer_url = defaultPageURL + (defaultPageURL.indexOf('gift_type=') === -1 ? "&gift_type=" + gift_type : '');
        fetch(url, {
            "headers": {
                "content-type": "application/x-www-form-urlencoded",
            },
            "referrer": referer_url,
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": "gift_id="+gift_id+"&account="+account_balance,
            "method": "POST",
        });
    }

    // 添加输入框和发送按钮
    const inputBox = document.createElement('input');
    inputBox.setAttribute('type', 'text');
    inputBox.setAttribute('placeholder', '输入需要赠送的礼物名称');

    // Set the width to be 80% of the current page length
    const pageWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const inputBoxWidth = 0.6 * pageWidth;
    inputBox.style.width = inputBoxWidth + 'px';

    const sendButton = document.createElement('button');
    sendButton.innerText = '发送礼物';

    // 将输入框和发送按钮添加到页面
    const giftBox = document.querySelector('body > div.content > div > div.gift-box');
    giftBox.insertBefore(sendButton, giftBox.firstChild);
    giftBox.insertBefore(inputBox, giftBox.firstChild);



    // 获取剩余余额
    var account_balance=document.querySelector("body > div.content > div > div:nth-child(1) > div.gift-gold-num > span:nth-child(3)").textContent
    // 获取包含token的form元素
    var tokenValue="1111";
    var formElement = document.querySelector("body > div.content > div > div.gift-box > ul > form");
    // 检查是否找到了form元素
    if (formElement) {
        // 获取action的值
        var actionValue = formElement.getAttribute("action");

        // 使用正则表达式提取token的值
        var match = actionValue.match(/token=(\d+)/);

        // 检查是否匹配到token
        if (match) {
            tokenValue = match[1];
            // 打印token的值
            //console.log("Token值: " + tokenValue);
        } else {
            console.log("未在action中找到token");
        }
    } else {
        console.log("未找到form元素");
    }

    // 为发送按钮添加点击事件监听器
    sendButton.addEventListener('click', async function() {
        let inputText=inputBox.value
        let sentGift=""
        if(inputText.includes("666")) inputText=inputText.replace("666","")
        const giftList = inputText.split(/[,\s;，、]/).map(gift => gift.trim());
        // 遍历礼物列表并逐个发送
        for (const giftName of giftList) {
            // Check if the giftName is empty, and if it is, skip to the next iteration
            if (giftName.trim() === "") continue;
            var searchResult = searchGiftOnline(giftName);
            if (searchResult.gift) {
                console.log("礼物名称: " + searchResult.gift.name);
                console.log("礼物图片链接: " + searchResult.gift.imgURL);
                console.log("礼物ID: " + searchResult.gift.id);
                console.log("礼物价格: " + searchResult.gift.price);
                console.log("所属类别: " + searchResult.category);
                if(!inputBox.value.includes("666")){
                    alert("发送礼物："+ searchResult.gift.name);
                }else{
                    sentGift = sentGift + searchResult.gift.name +' '
                    console.log("666");
                }
                await sendGift(searchResult.gift.id,account_balance,searchResult.category,searchResult.token);
                console.log("发送礼物："+ searchResult.gift.name);
                account_balance=account_balance-searchResult.gift.price;
                console.log("账户余额："+ account_balance);
            } else {
                console.log("未找到礼物名称: " + giftName);
                alert("未找到礼物："+ giftName);
            }

        }
        if(inputBox.value.includes("666")){
              alert("礼物发送完毕："+sentGift);
         }
    });
})();
