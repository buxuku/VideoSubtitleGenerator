import path from 'path';
import fs from 'fs';
import {
  contentTemplate,
  contentTemplateRule,
  supportedService,
  targetSrtSaveName,
  translateConfig,
  translateServiceProvider,
} from './config.js';
import { renderTemplate } from './utils.js';

export default async function translate(folder, fileName, absolutePath) {
  const renderContentTemplate = contentTemplate[contentTemplateRule];
  return new Promise(async (resolve, reject) => {
    try {
      const result = fs.readFileSync(absolutePath, 'utf8');
      const data = result.split('\n');
      const items = [];
      for (var i = 0; i < data.length; i += 4) {
        const source = data[i + 2];
        if (!source) continue;
        let text;
        switch (translateServiceProvider) {
          case supportedService.volc:
            const volc = await import('./service/volc.js');
            text = await volc.default(source);
            break;
          case supportedService.baidu:
            const baidu = await import('./service/baidu.js');
            text = await baidu.default(source);
            break;
          case supportedService.deeplx:
            const deeplx = await import('./service/deeplx.js');
            text = await deeplx.default(source);
            break;
          case supportedService.ollama:
            const ollama = await import('./service/ollama.js');
            text = await ollama.default(source, translateConfig.sourceLanguage, translateConfig.targetLanguage);
            break;
          default:
            text = 'no supported service';
        }

        items.push({
          id: data[i],
          startEndTime: data[i + 1],
          targetContent: text,
          sourceContent: source,
        });
      }
      const fileSave = path.join(folder, `${renderTemplate(targetSrtSaveName, { fileName, ...translateConfig })}.srt`);
      for (let i = 0; i <= items.length - 1; i++) {
        const item = items[i];
        const content = `${item.id}\n${item.startEndTime}\n${renderTemplate(renderContentTemplate, item)}`;
        fs.appendFileSync(fileSave, content, (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
      resolve();
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}
