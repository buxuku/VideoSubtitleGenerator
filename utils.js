import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { translateConfig, videoDir, whisperModel } from './config.js';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

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
      .on('error', function (err) {
        console.log('转换任务出错:', err);
        reject(err);
      })
      .save(audioPath);
  });
};

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);

    child.stdout.on('data', (data) => {
      console.log(`${data}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`${data}`);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(' ')} 进程退出，退出码 ${code}`));
      } else {
        resolve();
      }
    });
  });
}

// 安装 whisper.cpp 及模型
export const installWhisper = async () => {
  const repoUrl = 'https://github.com/ggerganov/whisper.cpp';
  const localPath = path.join('./', 'whisper.cpp');
  const modelPath = path.join('./', `whisper.cpp/models/ggml-${whisperModel}.bin`);
  const mainPath = path.join('./', 'whisper.cpp/main');

  if (!fs.existsSync(localPath)) {
    console.log('开始克隆 whisper.cpp 仓库');
    await runCommand('git', ['clone', repoUrl]);
  }
  if (!fs.existsSync(modelPath)) {
    console.log('正在安装 whisper.cpp 模型');
    await runCommand('bash', ['./whisper.cpp/models/download-ggml-model.sh', whisperModel]);
  }
  if (!fs.existsSync(mainPath)) {
    // 编译 whisper.cpp
    console.log('正在编译 whisper.cpp');
    await runCommand('make', ['-C', './whisper.cpp']);
  }
};