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
