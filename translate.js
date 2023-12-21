import path from 'path';
import fs from 'fs';
import {supportedService, translateConfig, translateServiceProvider} from "./config.js";

export default async function translate(folder, filename, absolutePath) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = fs.readFileSync(absolutePath, "utf8");
            const data = result.split("\n");
            var items = [];
            for (var i = 0; i < data.length; i += 4) {
                const texts = data[i + 2];
                if (!texts) continue;
                let text;
                switch (translateServiceProvider) {
                    case supportedService.volc:
                        const volc = await import('./service/volc.js');
                        text = await volc.default(texts);
                        break;
                    case supportedService.baidu:
                        const baidu = await import('./service/baidu.js');
                        text = await baidu.default(texts);
                        break;
                    case supportedService.deeplx:
                        const deeplx = await import('./service/deeplx.js');
                        text = await deeplx.default(texts);
                        break;
                    default:
                        text = 'no supported service';
                }

                items.push({
                    id: data[i],
                    startEndTime: data[i + 1],
                    text: text,
                });
            }
            for (let i = 0; i <= items.length - 1; i++) {
                const content = `${items[i].id}\n${items[i].startEndTime}\n${items[i].text}\n\n`;
                const fileSave = path.join(folder, `${filename}.${translateConfig.target_lang}.srt`);
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
    })

}
