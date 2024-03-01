// ==UserScript==
// @name         页面简化工具
// @namespace    https://github.com/cbayl/parkplugins
// @version      0.11
// @description  可选择性的隐藏点赞回复，金币回复，或者是被拉黑的人的主贴跟回复
// @author       lyabcv@gmail.com
// @match        https://www.cool18.com/b*/*
// @match        https://club.6parkbbs.com/*
// @match        https://web.6parkbbs.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @downloadURL  https://github.com/cbayl/parkplugins/raw/main/usertools/simplerPage.user.js
// @updateURL    https://github.com/cbayl/parkplugins/raw/main/usertools/simplerPage.user.js

// ==/UserScript==

(function() {
    'use strict';

    var bHideUpVote = localStorage.getItem("hide_up_vote") ? JSON.parse(localStorage.getItem("hide_up_vote")) : true;
    var bHideGift = localStorage.getItem("hide_gift") ? JSON.parse(localStorage.getItem("hide_gift")) : true;
    var bHideBlackListedPostsAndReplies = localStorage.getItem("hide_blacklisted_posts_and_replies") ? JSON.parse(localStorage.getItem("hide_blacklisted_posts_and_replies")) : true;
    var blacklistArray = localStorage.getItem("blacklist") ? JSON.parse(localStorage.getItem("blacklist")) : [];


    // 定义要隐藏的标题的正则表达式
    var upVoteRegexp = /给\s+.*\s+点“赞”支持3银元奖励！！/;
    var giftRegexp = /\(\^-\^\)\s.*\s.*\s.*\s.*！/;

    // 创建第一个 radio button 元素
    var hideUpVoteRadio = document.createElement("input");
    hideUpVoteRadio.setAttribute("type", "radio");
    hideUpVoteRadio.setAttribute("name", "hide_up_vote");
    hideUpVoteRadio.setAttribute("id", "hide_up_vote");
    hideUpVoteRadio.checked = bHideUpVote; // 根据布尔值设置初始状态

    // 创建第二个 radio button 元素
    var hideGiftRadio = document.createElement("input");
    hideGiftRadio.setAttribute("type", "radio");
    hideGiftRadio.setAttribute("name", "hide_gift");
    hideGiftRadio.setAttribute("id", "hide_gift");
    hideGiftRadio.checked = bHideGift; // 根据布尔值设置初始状态

    // 创建第三个 radio button 元素
    var hideBlacklistedRadio = document.createElement("input");
    hideBlacklistedRadio.setAttribute("type", "radio");
    hideBlacklistedRadio.setAttribute("name", "hide_blacklisted");
    hideBlacklistedRadio.setAttribute("id", "hide_blacklisted");
    hideBlacklistedRadio.checked = bHideBlackListedPostsAndReplies; // 根据布尔值设置初始状态

    // 创建"Retrieve BlackList"按钮元素
    var retrieveBlacklistButton = document.createElement("button");
    retrieveBlacklistButton.innerText = "🔄";
    retrieveBlacklistButton.setAttribute("name", "retrieve_blacklist_button");
    retrieveBlacklistButton.setAttribute("id", "retrieve_blacklist_button");
    retrieveBlacklistButton.onclick = function() {
        retrieveBlacklist();
    };

    // 找到要插入的目标元素
    var targetElement = document.querySelector("#d_list_page");
    if(targetElement){
        // 插入第一个 radio button
        targetElement.appendChild(hideUpVoteRadio);
        // 插入第二个 radio button
        targetElement.appendChild(hideGiftRadio);
        // 插入第三个 radio button
        targetElement.appendChild(hideBlacklistedRadio);
        // 插入 第四个
        targetElement.appendChild(retrieveBlacklistButton);
    }

    // 添加点击事件处理程序
    hideUpVoteRadio.addEventListener("click", function() {
        bHideUpVote = !bHideUpVote;
        hideUpVoteRadio.checked = bHideUpVote;
        localStorage.setItem("hide_up_vote", JSON.stringify(bHideUpVote));
        toggleUpVote();
    });

    hideGiftRadio.addEventListener("click", function() {
        bHideGift = !bHideGift;
        hideGiftRadio.checked = bHideGift;
        localStorage.setItem("hide_gift", JSON.stringify(bHideGift));
        toggleGift();
    });

    hideBlacklistedRadio.addEventListener("click", function() {
        blacklistArray = JSON.parse(localStorage.getItem("blacklist")) || [];
        bHideBlackListedPostsAndReplies = !bHideBlackListedPostsAndReplies;
        hideBlacklistedRadio.checked = bHideBlackListedPostsAndReplies;
        localStorage.setItem("hide_blacklisted_posts_and_replies", JSON.stringify(bHideBlackListedPostsAndReplies));
        toggleHideBlacklisted();
    });


    // 获取包含所有 li 元素的父元素
    var dList = document.querySelector("#d_list") || //首页
        document.querySelector("body > table:nth-child(7) > tbody > tr > td")|| //帖子页面
        document.querySelector("body > div.cen-main > div.c-r-l > div.repl-body"); //自建论坛帖子页面

    // 获取所有 li 元素
    var liElements = dList.querySelectorAll("li");
    if(liElements.length==0) liElements = dList.querySelectorAll("div > div"); // 自建论坛

    // 定义隐藏列表项的函数
    function toggleUpVote() {
        // 遍历所有 li 元素
        liElements.forEach(function(liElement) {
            // 检查是否包含 a 子元素
            var aElement = liElement.querySelector("a");
            if (aElement) {
                if (upVoteRegexp.test(aElement.textContent.trim())) {
                    liElement.style.display = bHideUpVote ? "none" : "list-item";
                }
            }
        });
    }

    // 定义隐藏列表项的函数
    function toggleGift() {
        // 遍历所有 li 元素
        liElements.forEach(function(liElement) {
            // 检查是否包含 a 子元素
            var aElement = liElement.querySelector("a");
            if (aElement) {
                if (giftRegexp.test(aElement.textContent.trim())) {
                    liElement.style.display = bHideGift ? "none" : "list-item";
                }
            }
        });
    }

    //定义toggle黑名单的人所发的贴文的函数
    function toggleHideBlacklisted() {
        // 获取包含所有 li 元素的父元素
        var dList = document.querySelector("#d_list") ||
            document.querySelector("body > table:nth-child(7) > tbody > tr > td") ||
            document.querySelector("body > div.cen-main > div.c-r-l > div.repl-body"); //自建论坛帖子页面
// debugger;
        // 获取所有 li 元素
        var liElements = dList.querySelectorAll("li");
        if(liElements.length==0) liElements = dList.querySelectorAll("div > div"); // 自建论坛

        // 遍历所有 li 元素
        liElements.forEach(function(liElement) {
            // 检查是否包含 a 子元素
            var aElement = liElement.querySelector("a");
            // debugger;
            if (aElement) {
                // 获取 a 元素的下一个兄弟节点
                var nextSibling = aElement.nextSibling;
                // 检查下一个兄弟节点是否是文本节点，并且包含在要隐藏的用户名列表中
                if (nextSibling.nodeType === Node.TEXT_NODE) {
                    var textContent="";
                     if (nextSibling.nextSibling.nodeType === Node.ELEMENT_NODE && nextSibling.nextSibling.nodeName === "A") {
                        textContent=nextSibling.nextSibling.textContent
                    } else {

                    textContent = nextSibling.textContent.trim();
                    }
                    // 检查用户名是否存在于文本内容中
                    if (blacklistArray.some(function(name) {
                        return textContent.includes(name);
                    })) {
                        // 将该 li 元素隐藏
                        liElement.style.display = bHideBlackListedPostsAndReplies ? "none" : "list-item";
                    }
                }
            }
        });

        // 主贴隐藏
        const specificLiElements = document.querySelectorAll("#d_list > ul > li");

        // 遍历特定的 li 元素
        specificLiElements.forEach(function(liElement) {
            // 检查是否存在 a:nth-child(2) > font 元素
            var fontElement = liElement.querySelector("a:nth-child(2) > font");
            if (fontElement) {
                var textContent = fontElement.textContent;
                // 检查用户名是否存在于文本内容中
                if (blacklistArray.some(function(name) {
                    return textContent.includes(name);
                })) {
                    // 将该 li 元素隐藏
                    liElement.style.display = bHideBlackListedPostsAndReplies ? "none" : "list-item";
                }
            }
        });
    }

    //定义
    function retrieveBlacklist() {
        // 定义用于存储黑名单的数组
        var localBlacklistArray = [];
        var blacklistPageURL = '';

        // 获取黑名单页面的 URL
        // const friendsElement = document.querySelector("#pub_info > a:nth-child(7)") ||
        //       document.querySelector("#head_left > a:nth-child(4)")||
        //       document.querySelector("#pub_info > a:nth-child(6)");
        const friendsElementSelectors = ["#pub_info > a:nth-child(7)", "#head_left > a:nth-child(4)", "#pub_info > a:nth-child(6)"];
        const friendsElement = friendsElementSelectors.map(selector => document.querySelector(selector)).find(element => element && element.textContent.trim() === "朋友圈");

        if (friendsElement) {
            blacklistPageURL = friendsElement.href;
        } else {
            const moreMomentsElement = document.querySelector("body > table:nth-child(7) > tbody > tr > td > div:nth-child(6) > p:nth-child(4) > b > a");
            if (moreMomentsElement) {
                const href = moreMomentsElement.getAttribute('href');
                const urlParams = new URLSearchParams(href.split('?')[1]);
                const uid = urlParams.get('uid');
                blacklistPageURL = `https://home.6park.com/index.php?app=home&act=friends&uid=${uid}`;
            }
        }

        // 使用 GM_xmlhttpRequest 发送请求以获取黑名单列表
        GM_xmlhttpRequest({
            method: "GET",
            url: blacklistPageURL,
            onload: function(response) {
                var responseHTML = response.responseText;
                var parser = new DOMParser();
                var doc = parser.parseFromString(responseHTML, "text/html");

                // 从响应中解析黑名单列表的名字
                var blacklistNames = doc.querySelectorAll("body > div.mian > div.left_content > div > div.friend-list > ul.friend-hei > li> span:nth-child(2)");

                // 将黑名单名字添加到数组中
                blacklistNames.forEach(function(nameElement) {
                    localBlacklistArray.push(nameElement.textContent.trim());
                });
                localBlacklistArray = localBlacklistArray.slice(1);

                // 弹出窗口
                alert(`黑名单列表为：
${localBlacklistArray.join(", ")}
只需要添加新的黑名单后更新即可`);


                // 输出黑名单数组到控制台
                console.log(localBlacklistArray);
                // 存储黑名单到本地存储
                localStorage.setItem("blacklist", JSON.stringify(localBlacklistArray));

                // 更新全局变量
                blacklistArray = JSON.parse(JSON.stringify(localBlacklistArray));
            }
        });
    }

    // 初始化隐藏列表项
    toggleUpVote();
    toggleGift();
    toggleHideBlacklisted();

    GM_addStyle(`
        #retrieve_blacklist_button {
            border: none;
            border-color: transparent;
            transition: color 0.3s;
            background-color: transparent; /* 如果需要隐藏背景色的话 */
            padding: 0; /* 如果需要去除按钮的内边距的话 */
            margin-left: 20px;

        },
        #hide_upvote_radio,
        #hide_gift_radio,
        #hide_blacklisted_radio {
           margin-bottom: 0px; /* 调整这个值以增加或减少距离 */
    `);

})();
