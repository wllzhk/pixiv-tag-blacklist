# Pixiv Tag Blacklist

🕶️ A Tampermonkey script that automatically hides Pixiv works containing blacklisted tags.

适用于 **Pixiv 小说排行榜页 (`[link](https://www.pixiv.net/novel/ranking.php?mode=weekly_r18)`)**，支持桌面端和移动端。

整个script几乎完全由Gemini完成，几乎没有人工痕迹

预置的屏蔽tag仅用于测试，不代表本人爱好，请按需更改


## 📥 Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) (Chrome / Firefox / Edge supported).
2. Click this link to download and install the script:
   👉 [**pixiv-tag-blacklist.user.js**](./pixiv-tag-blacklist.user.js)


## ⚙️ Configuration

You can edit the blacklist inside the script:

```js
const CONFIG = {
  BLACKLIST_TAGS: [
    "崩坏星穹铁道",
    "碧蓝航线",
    "明日方舟",
    "原神",
    "鸣潮",
  ]
};
```

Just add or remove tags as you like.


## 💬 Feedback

Feel free to open an [Issue](../../issues) or [Pull Request](../../pulls) if you’d like to:

* Suggest improvements
* Report bugs
