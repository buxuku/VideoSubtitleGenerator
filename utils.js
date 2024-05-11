import ffmpeg from 'fluent-ffmpeg';
import { translateConfig, videoDir } from './config.js';

// 将字符串转成模板字符串
export const renderTemplate = (template, data) => {
  const names = Object.keys(data);
  const values = Object.values(data);
  return new Function(...names, `return \`${template}\`;`)(...values);
};

export const renderFilePath = (template, fileName) => {
  const data = {
    fileName,
    sourceLanguage: translateConfig.sourceLanguage,
    targetLanguage: translateConfig.targetLanguage,
  };
  const finalPath = template || 'temp-${fileName}'; // 如果不保存字幕文件，需要先生成临时文件
  const filePath = renderTemplate(finalPath, data);
  return `${videoDir}/${filePath}`;
};

export const extractAudio = (videoPath, audioPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
           .audioFrequency(16000)
           .audioChannels(1)
           .audioCodec('pcm_s16le')
           .outputOptions('-y')
           .on('start', function (str) {
                console.log('转换任务开始~', str);
            })
           .on('progress', function (progress) {
                console.log('进行中，完成' + progress.percent + '%');
            })
           .on('end', function (str) {
                console.log('转换任务完成!');
                resolve();
            })
            .on('error', function(err) {
                console.log('转换任务出错:', err);
                reject(err);
            })
            .save(audioPath);
    })
}
