// ==UserScript==
// @name         版主工具 - 显示帖子的字数
// @namespace    https://github.com/cbayl/
// @version      0.1
// @description  统计帖子信息，包括汉字数，英文数，以及图片，
// @author       lyabcv@gmail.com
// @match        https://club.6parkbbs.com/*/index.php?app=forum&act=threadview&tid=*
// @match        https://web.6parkbbs.com/index.php?app=forum&act=view&tid=*
// @match        https://web.6parkbbs.com/index.php?app=forum&act=view&bbsid=*&tid=*
// @match        https://www.cool18.com/*/index.php?app=forum&act=threadview&tid=*
// @match        https://www.cool18.com/site/index.php?app=forum&act=view&tid=*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @downloadURL  https://github.com/cbayl/parkplugins/raw/main/admintools/postsummary.user.js
// @updateURL    https://github.com/cbayl/parkplugins/raw/main/admintools/postsummary.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 字符查找字典
    const characterPatterns = {
        chinese: /[\u4e00-\u9fa5]/g,
        // chinese: /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B739\u2B740-\u2B81D\u2B820-\u2CEA1\u2CEB0-\u2EBE0\u30000-\u3134A\u31350-\u323AF\u3100-\u312F\u31A0-\u31BF\uF900-\uFAFF\u2F800-\u2FA1F\u2F00-\u2FDF\u2E80-\u2EFF\u31C0-\u31EF\u2FF0-\u2FFF]/g,
        english: /[a-zA-Z]/g,
        englishWord:/\b[a-zA-Z]+\b/g,
        arabicNumber: /[0-9]/g,
        generalCharacter:/\S/g,
        emoji:/[\u00a9|\u00ae|\u25a0-\u27bf|\ud83c\ud000-\udfff|\ud83d\ud83e]/g,
        punctuation: /[\u3000-\u303F\uFF01-\uFF0F\uFF1A-\uFF1F\uFF3B-\uFF40\uFF5B-\uFF65“”—–‘’……!•："#$%&'()*+,-.·/:;<=>?@[\]^_`{|}~]/g
        // punctuation:/[\u3000-\u303F\u16FE0-\u16FFF\uFE30-\uFE4F\uFF00-\uFFEF\uFE50-\uFE6F\uFE10-\uFE1F\u0020-\u007E]/g

    };

    // 不必要文字字典
    const unnecessaryTexts = [
        /cool18.com/g,
        / 6park.com/g,
        /广而告之：.*点击观看实战/g,
        /贴主:.*编辑/g,
        /评分完成.*银元!/g,
        /评分完成.*银元！/g,
        /版主:.*编辑/g,
        /[\s\n]/g
    ];

    function countCharacters(text, pattern) {
        var matches = text.match(pattern);
        console.log(matches);
        return matches ? matches.length : 0;
    }

    function countElements(selector) {
        var elements = contentElement.querySelectorAll(selector);
        return elements ? elements.length : 0;
    }

    function checkIfMissing(text){
        text = text.replace(characterPatterns.chinese, "")
            .replace(characterPatterns.punctuation, "")
            .replace(characterPatterns.arabicNumber, "")
            .replace(characterPatterns.english, "")
            .replace(characterPatterns.emoji, "");

        if(text.length==0) return true;
        // console.log("未检测到的："+text);
        alert("未检测到的："+text);
        return false;
    }

    function analyzePostContent(content, author, title) {
        var result = {
            title: title,
            author: author,
            chineseCharCount: countCharacters(content, characterPatterns.chinese),
            englishCharCount: countCharacters(content, characterPatterns.english),
            englishWordCount: countCharacters(content, characterPatterns.englishWord),
            arabicNumberCount: countCharacters(content, characterPatterns.arabicNumber),
            punctuationCount: countCharacters(content, characterPatterns.punctuation),
            emojiCount: countCharacters(content, characterPatterns.emoji),
            characterCount:countCharacters(content, characterPatterns.generalCharacter),
            imageCount: countElements("img"),
            iframeCount: countElements("iframe"),
            embeddedCount: countElements("embed")
        };

        return result;
    }

    function printAnalysisResult(result) {
        var output = "帖子内容分析结果：\n" +
            "标题: " + result.title + "\n" +
            "作者: " + result.author + "\n" +
            "中文字数: " + result.chineseCharCount + "\n" +
            "英文字母数: " + result.englishCharCount + "\n" +
            "阿拉伯数字数: " + result.arabicNumberCount + "\n" +
            "标点符号数: " + result.punctuationCount + "\n" +
            "表情数: " + result.emojiCount + "\n" +
            "总字符数: " + result.characterCount + "\n" +
            "英文单词数: " + result.englishWordCount + "\n" +
            "图片数: " + result.imageCount + "\n" +
            "iframe 数: " + result.iframeCount + "\n" +
            "embed 数: " + result.embeddedCount;

        alert(output);
        GM_setClipboard(output);
        console.log(output);
    }

    const contentElement = document.querySelector("body > table:nth-child(4) > tbody > tr:nth-child(2) > td > pre") ||
          document.querySelector("body > div.cen-main > div.c-box > div.c-box-m > pre") ||
          document.querySelector("pre");

    const authorElement = document.querySelector(
        "body > table:nth-child(4) > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > a:nth-child(1)"
    ) || document.querySelector("body > div.cen-main > div.c-box > div.c-box-a > div > a:nth-child(1)");

    const titleElement = document.querySelector(
        "body > table:nth-child(4) > tbody > tr:nth-child(2) > td > center > font > b"
    ) || document.querySelector("body > div.cen-main > div.c-box > p.c-box-h > b");

    // 创建按钮
    var zNode = document.createElement('div');
    zNode.innerHTML = '<button id="myButtonCountText" type="button">'
        + '贴字数</button>';
    zNode.setAttribute('id', 'myContainerCountText');
    document.body.appendChild(zNode);
    document.getElementById("myButtonCountText").addEventListener(
        "click", ButtonClickAction, false
    );

    // 按钮点击事件处理函数
    function ButtonClickAction(zEvent) {
        if (!contentElement) return;
        var content = contentElement.textContent;

        // 内容预处理
        unnecessaryTexts.forEach(pattern => {
            content = content.replace(pattern, "");

        });
        console.log(content);

        var author = authorElement.innerHTML;
        var title = titleElement.textContent;

        var postAnalysisResult = analyzePostContent(content, author, title);
        printAnalysisResult(postAnalysisResult);
        checkIfMissing(content);
    }

    // 按钮样式
    GM_addStyle(`
    #myContainerCountText {
        position:               fixed;
        top:                    280px;
        left:                   30px;
        font-size:              10px;
        background:             orange;
        border:                 1px outset black;
        margin:                 3px;
        opacity:                0.5;
        z-index:                9999;
        padding:                2px 2px;
    }
    #myButtonCountText {
        cursor:                 pointer;
    }
    #myContainerCountText p {
        color:                  red;
        background:             white;
    }
`);
})();
