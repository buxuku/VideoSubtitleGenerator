import axios from 'axios';
import {translateConfig} from "../config.js";
export default async function deeplx(query) {
    try {
        const res = await axios.post('http://localhost:1188/translate',  {text: query, source_lang: translateConfig.source_lang, target_lang: translateConfig.target_lang});
        return res?.data?.alternatives?.[0] || '';
    } catch (error) {
        return 'error';
    }
}
