# PixelType

PixelType 是一款面向小学三年级孩子的本地网页打字游戏。它默认使用中文界面，通过像素卡通闯关地图，引导孩子逐步学习英文键盘打字。

项目使用本地静态网页实现。直接双击 `index.html` 就能在浏览器中运行。

## 当前版本

当前 MVP 已包含：

- 中文优先界面，支持切换英文界面
- 像素卡通风格首页、闯关地图、自由练习和游戏模式
- 按学习顺序逐步解锁的内置关卡地图
- 8 个内置打字关卡
- 主线“引导目标”玩法：一次突出一个字母、单词或短句
- 每关开始前先听/读 NPC 关卡介绍，介绍结束后才能开始输入
- 正确/错误反馈、准确率、速度和星级结算
- 字母雨滴：按键消除下落字母，漏掉 5 滴后结束并统计坚持时长
- 倒计时拆弹：在倒计时结束前准确输入完整英文句子
- 通关进度、语言和声音设置保存在浏览器本地
- NPC 文字提示和浏览器语音朗读
- 按键音效反馈：打对和打错会播放不同的短音效
- 一个“声音开/关”按钮同时控制 NPC 语音和按键音效

## 怎么运行

打开这个文件：

```text
index.html
```

在 Windows 上可以直接双击打开。推荐使用 Chrome 或 Edge。

如果浏览器语音不可用，游戏仍然可以正常玩，只是 NPC 不会朗读，文字气泡仍会显示。

## 怎么测试

如果本机安装了 Node.js，可以运行逻辑测试：

```bash
npm.cmd test
```

测试覆盖：

- 打字目标推进
- 错误输入记录
- 准确率、速度和星级计算
- 通关进度保存
- 下一关解锁
- 字母雨滴速度、命中与失败条件
- 拆弹倒计时、逐字输入和轮次推进

## 游戏玩法

孩子从“闯关地图”进入关卡。每个关卡对应一个学习阶段，例如：

1. `F` / `J` 食指定位
2. 左手中排 `A S D F`
3. 右手中排 `J K L`
4. 中排组合单词
5. 上排字母
6. 下排字母
7. 动物单词
8. 简单短句

每关进入后，屏幕会显示当前目标。孩子用真实键盘输入：

- 按对的字符会变绿
- 按错会温和提示
- 完成一组目标后根据准确率和速度获得星星
- 达标后地图解锁下一关

## 游戏模式

首页的“游戏模式”包含两个独立小游戏，不影响闯关地图的星级和解锁进度：

- `字母雨滴`：支持低速和高速。每滴雨的速度带有随机变化，输入对应字母即可消除；第 5 滴落到动物地板时结束。
- `倒计时拆弹`：目标为完整英文句子，大小写、空格和标点都需要准确输入；完成一句后进入时间更紧的下一轮。

## 语音原理

NPC 语音使用浏览器内置的 Web Speech API：

```js
window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
```

它不是预录音频，也不调用联网 AI 语音。声音质量取决于当前电脑和浏览器支持的系统语音。

## 按键音效原理

打字反馈音效使用浏览器内置的 Web Audio API 合成：

```js
const oscillator = audioContext.createOscillator();
const gain = audioContext.createGain();
```

打对时播放一个短促、偏明亮的提示音；打错时播放一个更低、更明显的错误提示音。项目没有引入 mp3 或 wav 文件，音效在本地浏览器中实时生成。

## 目录结构

```text
.
├── index.html
├── styles.css
├── package.json
├── src
│   ├── app.js
│   ├── free-practice.browser.js
│   ├── game-modes.browser.js
│   ├── i18n.js
│   ├── levels.js
│   ├── storage.js
│   └── typing-engine.js
├── tests
│   ├── storage.test.mjs
│   ├── game-modes.test.mjs
│   └── typing-engine.test.mjs
└── docs
    └── superpowers
        ├── plans
        └── specs
```

## 主要文件说明

- `index.html`：本地网页入口
- `styles.css`：像素卡通视觉样式
- `src/app.js`：浏览器端游戏主逻辑和页面渲染
- `src/levels.js`：内置关卡数据
- `src/i18n.js`：中文/英文界面文案
- `src/storage.js`：本地进度、语言和声音设置存储
- `src/free-practice.browser.js`：随机字母、单词、句子练习池和任务生成
- `src/game-modes.browser.js`：字母雨滴和倒计时拆弹的游戏状态引擎
- `src/typing-engine.js`：可测试的打字核心逻辑
- `tests/`：Node.js 自动化测试

## 后续可以继续做

- 增加更多像素角色表情和地图动画
- 增加掉落单词、救援任务等复习玩法
- 增加更细的手指提示和键盘区域高亮
- 增加音效和可关闭的背景音乐
- 增加英文 NPC 台词的完整润色

## Sprite 资源说明

首页由小型 sprite 资源组合渲染，包括按钮、图标、机器人、气泡、地图和像素字母资源。

- `assets/sprites/` 存放按钮、图标、机器人、气泡、首页地图和小游戏 PNG 资源。
- 雨滴使用一张透明像素 sprite 作为外壳，程序在中央叠加随机字母。
- `PixelType` 标题由程序按文字拼接 `assets/sprites/font/` 里的大小写字母 sprite。
- 字母 sprite 包含英文大写和小写字母，后续需要改标题或做英文像素文字时可以复用同一套图片资源。
- 字体和首页 UI sprite 可通过 `npm run generate:sprites` 重新生成。
