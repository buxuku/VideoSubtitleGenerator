
// whisper.cpp 代码路径 如 /Users/demo/code/github.com/ggerganov/whisper.cpp
export const whisperPath = 'pathToWhisper'

// whisper.cpp 模型
export const whisperModel = 'ggml-medium.bin';

// 翻译配置，原语言与目标语言
export const translateConfig = {
    source_lang: 'en',
    target_lang: 'zh',
}

// 百度翻译配置
export const baiduConfig ={
    appid: '',
    key: '',
}

// 火山引擎翻译配置
export const volcConfig = {
    accessKeyId: '',
    secretKey: '',
}

export const supportedService = {
    'baidu': Symbol.for('baidu'),
    'volc': Symbol.for('volc'),
    'deeplx': Symbol.for('deeplx'),
}

// 当前使用的翻译服务商，如果不配置，则不执行翻译流程
export const translateServiceProvider = supportedService.volc;

// 视频文件所在目录 如 /Users/demo/video
export const videoDir = 'pathToVideoDir';
