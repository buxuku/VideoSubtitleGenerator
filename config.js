import { config } from 'dotenv';
config();

// 视频文件所在目录 如 /Users/demo/video
export const videoDir = './examples';

// whisper.cpp 代码路径 如 /Users/demo/code/github.com/ggerganov/whisper.cpp
export const whisperPath = '/Users/xiaodong/code/github.com/ggerganov/whisper.cpp';

// whisper.cpp 模型
export const whisperModel = 'ggml-medium.bin';

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

// 翻译结果字幕文件内容配置
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

// 翻译内容输出模板规则，默认只输出翻译内容, 支持 contentTemplateRuleMap 内的规则
export const contentTemplateRule = contentTemplateRuleMap.onlyTranslate;

// 原始字幕文件保存命名规则 支持 fileName, sourceLanguage, targetLanguage 变量
// 如果为空，将不保存原始字幕文件
// eg: '${fileName}.${sourceLanguage}' -> 对于视频名为 text.mp4 的英文视频原始字幕文件名为 text.en.srt
export const sourceSrtSaveName = '${fileName}.${sourceLanguage}';

// 翻译后的字幕文件保存命名规则 支持 fileName, sourceLanguage, targetLanguage 变量
export const targetSrtSaveName = '${fileName}.${targetLanguage}';
