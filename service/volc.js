import { Service } from '@volcengine/openapi';
import { config } from 'dotenv';
import { translateConfig } from '../config.js';

config();

const accessKeyId = process.env.VOLC_KEY;
const secretKey = process.env.VOLC_SECRET;

const service = new Service({
  host: 'open.volcengineapi.com',
  serviceName: 'translate',
  region: 'cn-north-1',
  accessKeyId,
  secretKey,
});

const fetchApi = service.createAPI('TranslateText', {
  Version: '2020-06-01',
  method: 'POST',
  contentType: 'json',
});

export default async function translate(query) {
  if (!accessKeyId || !secretKey) {
    console.log('请先配置环境变量 VOLC_KEY 和 VOLC_SECRET');
    throw new Error('请先配置环境变量 VOLC_KEY 和 VOLC_SECRET');
  }
  const postBody = {
    SourceLanguage: translateConfig.sourceLanguage,
    TargetLanguage: translateConfig.targetLanguage,
    TextList: [query],
  };
  try {
    const res = await fetchApi(postBody, {});
    return res.TranslationList?.[0]?.Translation;
  } catch (error) {
    return 'error';
  }
}
