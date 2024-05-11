import { Service } from "@volcengine/openapi";
import {translateConfig, volcConfig} from "../config.js";

const accessKeyId = volcConfig.accessKeyId;
const secretKey = volcConfig.secretKey;


const service = new Service({
    host: "open.volcengineapi.com",
    serviceName: "translate",
    region: "cn-north-1",
    accessKeyId,
    secretKey,
});

const fetchApi = service.createAPI("TranslateText", {
    Version: "2020-06-01",
    method: "POST",
    contentType: "json",
});

export default  async function translate(query) {
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
