// ==UserScript==
// @name         版主工具 - 删除选中区域的帖子
// @namespace    https://github.com/cbayl
// @version      0.11
// @description  批量隐藏选中区域的帖子
// @author       lyabcv@gmail.com
// @license      MIT
// @match        https://www.cool18.com/*/index.php*
// @match        https://web.6parkbbs.com/*/index.php*
// @match        https://club.6parkbbs.com/*/index.php*
// @match        https://web.6parkbbs.com/index.php*
// @match        https://club.6parkbbs.com/index.php*
// @grant        GM_addStyle
// @downloadURL  https://github.com/cbayl/parkplugins/raw/main/admintools/hideselectedposts.user.js
// @updateURL    https://github.com/cbayl/parkplugins/raw/main/admintools/hideselectedposts.user.js
// ==/UserScript==


// 主函数，调用上述模块化的函数
(function() {
    const OPTION_RECOVER="del_status=0";//del_status: 0 是恢复
    const OPTION_DELETE="del_status=1";//del_status: 1 是删除
    const OPTION_HIDE="del_status=2"; //del_status: 2 是隐藏

    var option = OPTION_HIDE;


    function extractTidFromUrl(url) {
        // 使用正则表达式匹配URL中的tid
        const match = url.match(/tid=(\d+)/);

        // 如果有匹配，则返回提取到的tid，否则返回""
        return match ? match[1] : "";
    }
    function extractBbsidFromBbsUrl(bbsUrl) {
        // 使用正则表达式匹配URL中的bbsid
        const match = bbsUrl.match(/bbsid=(\d+)/);

        // 如果有匹配，则返回提取到的bbsid，否则返回""
        return match ? match[1] : "";
    }
    function extractForumURL(url) {
        // 使用正则表达式匹配论坛 URL 部分
        var regex = /^(.*\/index.php)\?.*$/;
        var match = url.match(regex);

        // 如果匹配成功，则返回匹配的部分
        if (match && match.length > 1) {
            return match[1];
        } else {
            // 如果没有找到匹配的部分，则返回原始 URL
            return url;
        }
    }

    async function deletePostByUrlAndBbsid(postUrl, bbsid,deleteOption) {
        // 提取tid
        const tid = extractTidFromUrl(postUrl);
        const forumUrl=extractForumURL(postUrl);

        if (!tid) {
            console.error("Failed to extract tid from the provided URL.");
            return;
        }
        var deleteUrl = "";
        var refererUrl="";
        if (bbsid!=""){
            deleteUrl = `${forumUrl}?app=sys&act=delthread&bbsid=${bbsid}&tid=${tid}`;
            refererUrl = `${forumUrl}?app=sys&act=threadinfo&bbsid=${bbsid}&tid=${tid}`;
        }
        else {
            deleteUrl=`${forumUrl}?app=sys&act=delthread&tid=${tid}`;
            refererUrl =`${forumUrl}?app=sys&act=threadinfo&tid=${tid}`;
        }

        try {
            const response = await fetch(deleteUrl, {
                method: "POST",
                headers: {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
                    "cache-control": "max-age=0",
                    "content-type": "application/x-www-form-urlencoded",
                    "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "frame",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "same-origin",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1"
                },
                referrer: refererUrl,
                referrerPolicy: "no-referrer-when-downgrade",
                body: deleteOption, //del_status: 0 是恢复 del_status: 1 是删除 del_status: 2 是隐藏
                mode: "cors",
                credentials: "include"
            });

            // Check if the request was successful (status code 200)
            if (response.ok) {
                console.log(`Post with tid ${tid} and bbsid ${bbsid} deleted successfully.`);
            } else {
                console.error(`Failed to delete post with tid ${tid} and bbsid ${bbsid}. Status code: ${response.status}`);
            }
        } catch (error) {
            console.error(`An error occurred while deleting post with tid ${tid} and bbsid ${bbsid}: ${error.message}`);
        }
    }
    function filterAndConvertUrls() {
        // 获取用户选择的文本范围
        var selection = window.getSelection();

        // 检查是否有选中文本
        if (selection.rangeCount > 0) {
            // 获取选中的文本范围
            var range = selection.getRangeAt(0);

            // 创建一个临时元素，以便获取HTML内容
            var tempElement = document.createElement('div');
            tempElement.appendChild(range.cloneContents());

            // 在临时元素中查找所有链接
            var links = tempElement.getElementsByTagName('a');

            // 过滤并转换链接的URL
            var filteredUrls = [];
            for (var i = 0; i < links.length; i++) {
                var url = links[i].getAttribute('href');
                if (url && url.includes("tid")) {
                    // 如果链接包含 "tid"，则转换为绝对路径
                    var absoluteUrl = new URL(url, window.location.href).href;
                    filteredUrls.push(absoluteUrl);
                }
            }

            // 返回过滤后的URL数组
            return filteredUrls;
        }

        // 如果没有选中文本，返回空数组或适当的默认值
        return [];
    }

    function hidePosts(){
        let bbsUrl=location.href;
        const bbsid = extractBbsidFromBbsUrl(bbsUrl);
        console.log(bbsid);
        // 调用函数并获取结果
        var urlsToDelete = filterAndConvertUrls();
        for (const url of urlsToDelete) {
            console.log(url);
            deletePostByUrlAndBbsid(url,bbsid,option);
        }
    }
    // 创建按钮
    function createButton() {
        var containerNode = document.createElement('div');
        containerNode.innerHTML = '<button id="myButtonHideSelectedPosts" type="button">'
            + '都隐藏</button>';
        containerNode.setAttribute('id', 'myContainerHideSelectedPosts');
        document.body.appendChild(containerNode);
    }

    // 按钮点击时的逻辑操作
    function buttonClickAction() {
        // 在这里添加您的逻辑操作
        // 例如：调用隐藏帖子的函数
        hidePosts();
    }
    createButton();
    addStyles();

    // 绑定按钮点击事件
    document.getElementById("myButtonHideSelectedPosts").addEventListener(
        "click", buttonClickAction, false
    );


    // 按钮样式
    function addStyles() {
        GM_addStyle(`
        #myContainerHideSelectedPosts {
            position:               fixed;
            top:                    320px;
            left:                   30px;
            font-size:              10px;
            background:             orange;
            border:                 1px outset black;
            margin:                 3px;
            opacity:                0.5;
            z-index:                9999;
            padding:                2px 2px;
        }
        #myButtonHideSelectedPosts {
            cursor:                 pointer;
        }
        #myContainerHideSelectedPosts p {
            color:                  red;
            background:             white;
        }
    `);
    }
})();
