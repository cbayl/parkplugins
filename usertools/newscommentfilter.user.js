// ==UserScript==
// @name         个人工具-新闻评论筛选
// @name:en      News Comment Filter
// @namespace    https://github.com/cbayl/
// @version      0.1
// @description  根据评论人对评论进行筛选
// @description:en  Filter news comments on 6park by specified commenters
// @author       lyabcv@gmail.com
// @match        https://www.6parknews.com/newspark/index.php?act=newsreply*
// @grant        none
// @downloadURL  https://github.com/cbayl/parkplugins/raw/main/usertools/newscommentfilter.user.js
// @updateURL    https://github.com/cbayl/parkplugins/raw/main/usertools/newscommentfilter.user.js
// ==/UserScript==

(function() {
    'use strict';
    const commentElements = document.querySelectorAll("#reply_list_all > div.reply_list_div");

    function wildcardSearch2(pattern, str) {
        // 将通配符转换为正则表达式
        const regexPattern = pattern.replace(/[？\?]/g, ".").replace(/\*/g, ".*");
        const regex = new RegExp(regexPattern);

        // 进行匹配
        return regex.test(str);
    }

    // 获取评论人列表输入框
    var inputElement = document.createElement("input");
    inputElement.setAttribute("type", "text");
    inputElement.style.border = "1px solid #E6E6DD";
    inputElement.style.background = "#E6E6DD";
    const inputBoxWidth = 0.8 * 802;
    inputElement.style.width = inputBoxWidth + 'px';
    inputElement.setAttribute("placeholder", "请输入需要保留的评论人，用逗号或空格分隔");
    var targetDiv = document.querySelector("body > center > table:nth-child(1) > tbody > tr:nth-child(2) > td > div");
    targetDiv.appendChild(inputElement);

    // 获取评论人列表
    var allowedCommenters = [];
    inputElement.addEventListener("input", function(event) {
        var commenters = event.target.value.split(/[,，\s]+/);
        allowedCommenters = commenters.filter(function(commenter) {
            return commenter.trim() !== "";
        });
        filterComments();
    });

    // 过滤评论
    function filterComments() {

        commentElements.forEach(function(commentElement) {
            var commenter = commentElement.querySelector("div.reply_auther_info > span.r_auther > a").textContent.trim();
            if (allowedCommenters.length === 0 || allowedCommenters.some(function(pattern) {
                return wildcardSearch2(pattern, commenter);
            })) {
                commentElement.style.display = "";
            } else {
                commentElement.style.display = "none";
            }
        });
    }
})();
