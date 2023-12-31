import fs from 'fs';
import {execSync} from 'child_process';
import app from './translate.js';
import {translateConfig, translateServiceProvider, videoDir, whisperModel, whisperPath} from "./config.js";

const {log, error} = console;

fs.readdir(videoDir, async (err, files) => {
    if (err) {
        error(err);
        return;
    }
    for (let i = 0; i <= files.length - 1; i++) {
        const file = files[i];
        if (file.endsWith('.mp4')) {
            log('开始处理文件：', file);
            try {
                const fileName = file.split('.')[0];
                const wavFile = `${videoDir}/${fileName}.wav`;
                const srtFile = `${videoDir}/${fileName}.${translateConfig.source_lang}`;
                execSync(`ffmpeg -v quiet -stats -i "${videoDir}/${file}" -ar 16000 -ac 1 -c:a pcm_s16le -y "${wavFile}"`);
                log('完成音频文件提取， 准备生成字幕文件');
                execSync(`${whisperPath}/main -m ${whisperPath}/models/${whisperModel} -f "${wavFile}" -osrt -of "${srtFile}"`);
                log('完成字幕文件生成， 准备开始翻译');
                if (translateServiceProvider) {
                    await app(videoDir, fileName, `${srtFile}.srt`);
                }
                log('翻译完成');
                fs.unlink(wavFile, (err) => {
                    if (err) {
                        error(err);
                    } else {
                        log('删除wav文件', wavFile);
                    }
                });
            } catch (err) {
                log('执行出错', err);
            }
        }
    }
});

