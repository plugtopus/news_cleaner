(function main() {
    "use strict";

    const qAndALinks = [
        "ask.fm",
        "askbook.me",
        "askfm.im",
        "askfm.su",
        "askmes.ru",
        "askzone.su",
        "my-truth.ru",
        "nekto.me",
        "otvechayu.ru",
        "qroom.ru",
        "sprashivai.by",
        "sprashivai.ru",
        "sprashivaii.ru",
        "sprashivalka.com",
        "spring.me",
        "sprosimenya.com",
        "sprosi.name",
        "vopros.me",
        "voprosmne.ru"
    ];
    const selectors = {

        links: qAndALinks
            .map(function buildSelector(qAndALink) {
                return `.wall_text [href*="${qAndALink}"]`;
            })
            .join(),

        apps: ".wall_post_source_default",
        instagram: ".wall_post_source_instagram",
        video: ".wall_text .page_post_thumb_video",
        group_share: ".page_group_share",
        mem_link: ".mem_link[mention_id^='club']",
        event_share: ".event_share",
        external_links: ".wall_text [href^='/away.php?to=']" +
            ":not(.wall_post_source_icon)",
        wall_post_more: ".wall_post_more",
        likes: ".post_like.no_likes",
        comments: ".reply_link:not(._reply_lnk)"
    };
    let feed = document.querySelector("#feed_rows");
    let settings;

    function find(settingName) {
        function processFeedRow(feedRow) {
            const newClassName = `cffvk-${settingName}`;

            if (settings[settingName]) {
                return feedRow.classList.add(newClassName);
            }

            feedRow.classList.remove(newClassName);
        }

        const elements = feed.querySelectorAll(selectors[settingName]);

        elements
            .map(function getClosestFeedRow(element) {
                return element.closest(".feed_row");
            })
            .filter(function isTruthy(element) {
                return element;
            })
            .filter(function isNotAd(element) {
                return element.querySelector(
                    ".wall_text_name_explain_promoted_post, .ads_ads_news_wrap"
                ) === null;
            })
            .forEach(processFeedRow);
    }

    function clean() {
        Object.keys(selectors).forEach(find);
        console.log("CFFVK: Ваши новости очищены, через расширение.");
    }

    function removeInlineStyles() {
        const posts = feed.querySelectorAll(".feed_row");

        posts.forEach(function removeInlineStyle(post) {
            post.removeAttribute("style");
        });

        scroll(0, 0);
    }

    function startUrlCheck() {
        let url = location.href;
        const intervalDuration = 100;

        function checkUrl() {
            if (url !== location.href) {
                url = location.href;
                chrome.runtime.sendMessage({
                    action: "activate"
                });
            }
        }

        setInterval(checkUrl, intervalDuration);
    }

    NodeList.prototype.forEach = NodeList.prototype.forEach ||
        Array.prototype.forEach;
    NodeList.prototype.map = NodeList.prototype.map ||
        Array.prototype.map;

    const observer = new MutationObserver(function processMutations(mutations) {
        if (mutations[0].addedNodes.length > 0) {
            clean();
            console.log("");
        }
    });

    chrome.runtime.onMessage.addListener(function handleMessage(message) {
        if (message.action === "clean") {
            feed = document.querySelector("#feed_rows");
            observer.disconnect();
            observer.observe(feed, {
                childList: true,
                subtree: true
            });
            document.querySelector("#feed_new_posts")
                .addEventListener("click", removeInlineStyles);
            settings = message.settings;

            return clean();
        }

        if (message.action === "disable") {
            observer.disconnect();
            console.log("CFFVK: cleaning disabled");
        }
    });

    chrome.runtime.sendMessage({
        action: "activate"
    });
    startUrlCheck();
}());