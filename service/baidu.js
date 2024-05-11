import crypto from 'crypto';
import axios from 'axios';
import {baiduConfig, translateConfig} from "../config.js";
const appid = baiduConfig?.appid;
const key = baiduConfig?.key;
export default async function baidu(query) {
   const salt = (new Date).getTime();
   const str1 = appid + query + salt + key;
   const sign = crypto.createHash('md5').update(str1).digest('hex');
   const data = {
       q: query,
       appid,
       salt,
       from: translateConfig.sourceLanguage,
       to: translateConfig.targetLanguage,
       sign
   }
   const res = await axios.post('https://fanyi-api.baidu.com/api/trans/vip/translate', data, {
       headers: {
           'Content-Type': 'application/x-www-form-urlencoded'
       }
   });
   return res?.data?.trans_result?.[0]?.dst || '';
}

