import crypto from 'crypto';
import axios from 'axios';
import { config } from 'dotenv';
config();
import { translateConfig } from '../config.js';

const appid = process.env.BAIDU_KEY;
const key = process.env.BAIDU_SECRET;

export default async function baidu(query) {
  if (!appid ||!key) {
      console.log('请先配置环境变量 BAIDU_APPID 和 BAIDU_KEY');
      throw new Error('请先配置环境变量 BAIDU_APPID 和 BAIDU_KEY');
  }
  const salt = new Date().getTime();
  const str1 = appid + query + salt + key;
  const sign = crypto.createHash('md5').update(str1).digest('hex');
  const data = {
    q: query,
    appid,
    salt,
    from: translateConfig.sourceLanguage,
    to: translateConfig.targetLanguage,
    sign,
  };
  const res = await axios.post('https://fanyi-api.baidu.com/api/trans/vip/translate', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return res?.data?.trans_result?.[0]?.dst || '';
}
