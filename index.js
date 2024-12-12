import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { config } from 'dotenv';
import app from './translate.js';
import { sourceSrtSaveName, translateServiceProvider, videoDir, translateConfig ,whisperModel } from './config.js';
import { extractAudio, renderFilePath, installWhisper, isDarwin, isWin32 } from './utils.js';

config();

const { log, error } = console;

const SUPPORTED_VIDEO_FORMATS = ["mp4", "avi", "mov", "mkv", "flv", "wmv", "webm", "m4a"];

await installWhisper();
fs.readdir(videoDir, async (err, files) => {
  if (err) {
    error(err);
    return;
  }
  for (let i = 0; i <= files.length - 1; i++) {
    const file = files[i];
    const fileExtension = file.split('.').pop().toLowerCase();
    if (SUPPORTED_VIDEO_FORMATS.includes(fileExtension)) {
      log('开始处理文件：', file);
      try {
        const fileName = file.substring(0, file.lastIndexOf('.'));
        const wavFile = `${videoDir}/${fileName}.wav`;
        const srtFile = `${renderFilePath(sourceSrtSaveName, fileName)}`;
        await extractAudio(`${videoDir}/${file}`, `${wavFile}`);
        //execSync(`ffmpeg -v quiet -stats -i "${videoDir}/${file}" -ar 16000 -ac 1 -c:a pcm_s16le -y "${wavFile}"`);
        log('完成音频文件提取， 准备生成字幕文件');
        let mainPath = path.join('./', 'whisper.cpp/main');
        if(isWin32()){
          mainPath = path.join('./', 'whisper-bin-x64/main.exe');
        }
        execSync(
          `${mainPath} -m ./whisper.cpp/models/ggml-${whisperModel}.bin -f "${wavFile}" -osrt -of "${srtFile}" -l ${translateConfig.sourceLanguage}`
        )
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
        if (!sourceSrtSaveName) {
          fs.unlink(`${srtFile}.srt`, () => {});
        }
      } catch (err) {
        log('执行出错', err);
      }
    }
  }
});
