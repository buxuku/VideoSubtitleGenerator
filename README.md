# 批量为视频文件生成字幕文件，并翻译成其它语言

> 这只是方便自己使用的一个小工具，目前并未进行严格测试，如果在使用过程中遇到啥问题，可以提 Issue

> [!NOTE]
> 本项目基于 macOS, node 环境运行，暂未兼容 windows 环境

做这个小工具的初衷：

自己有一大批外文视频，没有字幕，希望能够添加字幕文件，同时也能够将字幕文件翻译成中文， 同时希望能够通过批量处理的方式来减轻工作量。

类似需求，有一批厂商已经提供到了支持，比如 讯飞听见， 网易见外 等，但这些在线服务都涉及到视频的上传动作，效率相对比较低下。

希望能够找一个客户端工具，在本地来生成，试用了一些工具，依然不理想

- Buzz 非 Store 版本没有对 apple silicon 做优化，字幕生成速度比较慢，也不支持翻译
- MacWhisper 免费版本只支持单个生成，不支持批量，不支持翻译
- WhisperScript 可以批量生成，但字幕文件需要手动一个个地保存，不支持翻译
- memo.ac 做了 mac 下的性能优化，可以使用 GPU ，也支持翻译功能，非常棒的一款软件，但目前批量模式 bug 太多，无法正常使用

最后想了一下，本地语音转文字，通常的做法就是使用目前最强的 whisper 模型来生成。那我的需求就比较简单了：

- 通过 ffmpeg 从视频文件中提取出音频文件
- 通过 whisper 模型将音频生成原语言的字幕文件
- 调用翻译 API， 将原语言的字幕文件翻译成目标语言的字幕文件

基于以上简单的思路和流程，就可以简单写一个小工具来批量处理本地的视频了。

#### 💥特性

- 源语言字幕文件和目标语言字幕文件放在视频同目录下，方便播放时任意挂载字幕文件
- 批量处理目录下面的所有视频文件
- 支持火山引擎翻译
- 支持百度翻译
- 支持 deeplx 翻译 （批量翻译容易存在被限流的情况）
- 自定义字幕文件名，方便兼容不同的播放器挂载字幕识别
- 自定义翻译后的字幕文件内容，纯翻译结果，原字幕+翻译结果
- 项目集成 `whisper.cpp`， 它对 apple silicon 进行了优化，有较快的生成速度
- 项目集成了 `fluent-ffmpeg`, 无须安装 `ffmpeg`

##### ⬆️ 支持的模型

```
tiny.en
tiny
base.en
base
small.en
small
medium.en
medium
large-v1
large-v2
large-v3
```

##### 🔦使用

1️⃣ 克隆本项目在本地

2️⃣ 在项目中执行 `yarn install` 或者 `npm install`

3️⃣ 复制 `.env.local` 为 `.env` 在项目根目录，访文件用于配置翻译相关的 KEY 和 SECRET， 例如

```shell
BAIDU_KEY=2023120600190xxxx
BAIDU_SECRET=PIbyKjEr1y8u18RZxxxx
VOLC_KEY=AKLTMDUwZjY4MTZkNTFmN4M3ZjlkMzlmYzAzMTdlMDExxxx
VOLC_SECRET=T0dRMllUUmpPREUzWWpjNE5HVm2Zamt4TlRObU9EUm1ORFk0T1dGbExxxx==
```

4️⃣ 其余的配置在 `config.js` 文件中进行配置，

```js
// 视频文件所在目录 如 /Users/demo/video
export const videoDir = './examples';

/*
whisper.cpp 模型 支持以下
tiny.en
tiny
base.en
base
small.en
small
medium.en
medium
large-v1
large-v2
large-v3
 */
export const whisperModel = 'base.en';

// 翻译配置，原语言与目标语言
export const translateConfig = {
  sourceLanguage: 'en',
  targetLanguage: 'zh',
};

// 百度翻译配置
export const baiduConfig = {
  appid: process.env.BAIDU_KEY,
  key: process.env.BAIDU_SECRET,
};

// 火山引擎翻译配置
export const volcConfig = {
  accessKeyId: process.env.VOLC_KEY,
  secretKey: process.env.VOLC_SECRET,
};

export const supportedService = {
  baidu: Symbol.for('baidu'),
  volc: Symbol.for('volc'),
  deeplx: Symbol.for('deeplx'),
};

// 当前使用的翻译服务商，如果不配置，则不执行翻译流程
export const translateServiceProvider = supportedService.volc;

export const contentTemplateRuleMap = {
  onlyTranslate: Symbol.for('onlyTranslate'), // 只输出翻译内容
  sourceAndTranslate: Symbol.for('sourceAndTranslate'), // 输出原始字幕和翻译字幕， 原始字幕在上面
  translateAndSource: Symbol.for('translateAndSource'), // 输出翻译后的字幕和原始字幕， 翻译字幕在上面
};

// 字幕文件内容模板 支持 ${sourceContent}, ${targetContent} 变量
export const contentTemplate = {
  [contentTemplateRuleMap.onlyTranslate]: '${targetContent}\n\n',
  [contentTemplateRuleMap.sourceAndTranslate]: '${sourceContent}\n${targetContent}\n\n',
  [contentTemplateRuleMap.translateAndSource]: '${targetContent}\n${sourceContent}\n\n',
};

// 翻译内容输出模板规则，默认只输出翻译内容
export const contentTemplateRule = contentTemplateRuleMap.translateAndSource;

// 原始字幕文件保存命名规则 支持 fileName, sourceLanguage, targetLanguage 变量
// 如果为空，将不保存原始字幕文件
// eg: '${fileName}.${sourceLanguage}' -> 对于视频名为 text.mp4 的英文视频原始字幕文件名为 text.en.srt
export const sourceSrtSaveName = '${fileName}.${sourceLanguage}';

// 翻译后的字幕文件保存命名规则 支持 fileName, sourceLanguage, targetLanguage 变量
export const targetSrtSaveName = '${fileName}.${targetLanguage}';
```

这里面的字幕内容和字幕文件名可以自定义配置，同时会将里面的 `${xxx}`变量转为对应的字符

这里面主要说一下翻译结果的字幕内容配置

#### onlyTranslate

只保留翻译后的结果内容，如

```
1
00:00:00,000 --> 00:00:09,360
 我要和你们谈谈我这本书里的一些东西，我希望能

2
00:00:09,360 --> 00:00:13,680
 和你们已经听到的东西产生共鸣，我会试着建立一些联系。
```

#### sourceAndTranslate

保留原字幕和翻译之后的字幕，且原字幕在上面

```
1
00:00:00,000 --> 00:00:09,360
 I'm going to talk to you about some stuff that's in this book of mine that I hope will
 我要和你们谈谈我这本书里的一些东西，我希望能

2
00:00:09,360 --> 00:00:13,680
 resonate with other things that you've already heard and I'll try to make some connections
 和你们已经听到的东西产生共鸣，我会试着建立一些联系。
```

#### translateAndSource

保留原字幕和翻译之后的字幕，且翻译字幕在上面

```
1
00:00:00,000 --> 00:00:09,360
 我要和你们谈谈我这本书里的一些东西，我希望能
 I'm going to talk to you about some stuff that's in this book of mine that I hope will

2
00:00:09,360 --> 00:00:13,680
 和你们已经听到的东西产生共鸣，我会试着建立一些联系。
 resonate with other things that you've already heard and I'll try to make some connections
```

5️⃣ 配置好该文件之后，执行 `yarn start` 或者 `npm start`, 首次执行会下载 `whisper.cpp` 和配置的对应的模型文件，会比较慢一些。下次执行将会跳过该流程
