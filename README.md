<p align="center">
  <img src="assets/sprites/home-brand-icon.png" width="96" alt="PixelType Logo">
</p>

<h1 align="center">PixelType</h1>

<p align="center">一款面向小学生的本地网页打字游戏</p>

<p align="center">
  <strong>简体中文</strong> · <a href="README.en.md">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-F5C451?style=for-the-badge" alt="Version 0.1.0">
  <img src="https://img.shields.io/badge/platform-browser-45A7E6?style=for-the-badge" alt="Platform: Browser">
  <img src="https://img.shields.io/badge/runtime-local-54C98D?style=for-the-badge" alt="Runtime: Local">
  <img src="https://img.shields.io/badge/languages-ZH%20%7C%20EN-F37F8B?style=for-the-badge" alt="Languages: Chinese and English">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-0B7FC7?style=for-the-badge" alt="MIT License"></a>
</p>

<p align="center">
  <img src="assets/reference/home-reference-b.png" alt="PixelType 游戏首页">
</p>

PixelType 通过像素卡通闯关地图、自由练习和趣味小游戏，引导小学生循序渐进地练习英文键盘输入。游戏默认使用中文界面，也可以随时切换为英文；不需要账号、后端服务或网络连接，学习进度保存在当前浏览器中。

## 使用手册

### 运行要求

- 一台带有实体键盘的电脑。
- 推荐使用最新版 Chrome 或 Edge。
- 运行游戏不需要安装 Node.js，也不需要连接互联网。

### 如何运行

1. 下载并解压项目文件，或者将仓库克隆到本地。
2. 打开项目根目录。
3. 双击 `index.html`，游戏会在默认浏览器中启动。

如果浏览器没有可用的系统语音，游戏仍然可以正常使用，只是向导不会朗读提示文字。

### 当前版本玩法

#### 闯关地图

闯关地图包含 8 个循序渐进的关卡，从 `F`、`J` 食指定位开始，逐步练习中排、上排、下排、英文单词和简单句子。

- 进入关卡后，先阅读或收听向导提示。
- 根据屏幕目标使用实体键盘输入。
- 正确字符会获得即时反馈，错误输入会被记录并提示。
- 完成关卡后根据准确率和速度获得星星，并解锁下一关。

#### 自由练习

自由练习不会影响闯关地图的星级和解锁进度，可以选择：

- 字母练习
- 单词练习
- 句子练习
- 混合练习

#### 字母雨滴

选择低速或高速后，字母会随雨滴落下。按下对应字母即可消除雨滴；漏掉 5 滴后游戏结束，并显示坚持时间和消除数量。

#### 倒计时拆弹

在炸弹倒计时结束前输入完整英文句子。大小写、空格和标点都需要正确；成功完成一句后会进入下一轮，倒计时会根据句子长度调整。

### 通用操作

- 首页右上角的声音按钮控制向导语音、按键音效和游戏背景音。
- 语言按钮可以在中文和英文界面之间切换。
- 闯关进度、语言和声音设置会自动保存在当前浏览器中。
- 清除该网站的浏览器本地数据会同时清除已保存的游戏进度。

## 开发手册

### 技术栈

- HTML5
- CSS3、Grid、Flexbox、响应式布局和 CSS 动画
- 原生 JavaScript
- Web Audio API、Web Speech API、Local Storage 和 `requestAnimationFrame`
- Node.js ES Module 开发脚本
- Node.js 内置测试框架 `node:test`

项目运行时没有第三方依赖，也没有使用前端框架、打包工具、后端服务或数据库。

### 目录结构

```text
PixelType/
├── assets/
│   ├── reference/                  # README 和视觉参考图片
│   └── sprites/                    # 游戏使用的像素精灵图
│       └── font/                   # A-Z / a-z 像素字母
├── scripts/
│   ├── generate-font-sprites.mjs   # 生成像素字母资源
│   ├── generate-home-sprites.mjs   # 生成首页和游戏精灵资源
│   └── optimize-png-assets.mjs     # 优化 PNG 文件
├── src/
│   ├── app.js                      # 页面渲染、状态和主流程
│   ├── bomb-audio-engine.browser.js
│   ├── feedback-audio-engine.browser.js
│   ├── free-practice.browser.js
│   ├── free-practice.js
│   ├── game-modes.browser.js
│   ├── i18n.js
│   ├── levels.js
│   ├── mission-intro.js
│   ├── rain-audio-engine.browser.js
│   ├── storage.js
│   └── typing-engine.js
├── tests/                          # Node.js 自动化测试
├── font-review.html                # 像素字体检查页面
├── index.html                      # 游戏入口
├── package.json                    # 项目信息和开发命令
├── styles.css                      # 全局界面和动画样式
├── README.md                       # 默认中文说明
└── README.en.md                    # 英文说明
```

### 文件说明

#### 页面与数据

| 文件 | 说明 |
| --- | --- |
| `index.html` | 加载样式和浏览器端脚本的静态入口。 |
| `styles.css` | 首页、关卡、自由练习、小游戏、像素动画和响应式样式。 |
| `src/app.js` | 负责页面渲染、全局状态、键盘事件和各模式切换。 |
| `src/levels.js` | 8 个闯关关卡的目标、提示和评分配置。 |
| `src/i18n.js` | 中文和英文界面文本。 |
| `src/storage.js` | 浏览器本地进度及偏好设置的读写。 |
| `src/mission-intro.js` | 关卡向导介绍、语音状态和输入开放时机。 |

#### 打字与游戏模式

| 文件 | 说明 |
| --- | --- |
| `src/typing-engine.js` | 闯关模式的输入判定、统计和结算逻辑。 |
| `src/free-practice.js` | 可测试的自由练习任务生成逻辑。 |
| `src/free-practice.browser.js` | 浏览器运行使用的自由练习模式数据和接口。 |
| `src/game-modes.browser.js` | 字母雨滴和倒计时拆弹的浏览器端状态引擎。 |

#### 音频

| 文件 | 说明 |
| --- | --- |
| `src/feedback-audio-engine.browser.js` | 正确、错误及普通按键反馈音。 |
| `src/rain-audio-engine.browser.js` | 字母雨滴背景声和落地声。 |
| `src/bomb-audio-engine.browser.js` | 拆弹背景音乐和爆炸音效。 |

#### 资源与测试

| 路径 | 说明 |
| --- | --- |
| `assets/sprites/` | 首页、角色、按钮、图标、雨滴、炸弹和像素字体资源。 |
| `assets/reference/` | 项目展示及视觉参考图片。 |
| `scripts/` | 精灵图生成和 PNG 优化脚本，仅在开发时使用。 |
| `tests/` | 打字逻辑、存储、界面文案、音频引擎和资源检查测试。 |

### 开发命令

运行游戏本身不需要 Node.js。只有生成资源、优化图片或运行测试时才需要安装 Node.js。

```bash
# 运行全部自动化测试
npm test

# 重新生成字体和首页精灵图
npm run generate:sprites

# 优化 PNG 资源
npm run optimize:assets
```

本项目的全部代码和资源均按照 [MIT License](LICENSE) 发布。
