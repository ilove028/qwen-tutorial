import OpenAI from "openai";
import { getEnv } from "../util/index.js";

const openai = new OpenAI(
    {
        // 若没有配置环境变量，请用阿里云百炼API Key将下行替换为：apiKey: "sk-xxx",
        apiKey: getEnv()?.parsed?.API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);
const completion = await openai.chat.completions.create({
    model: "qwen-plus",  //模型列表：https://www.alibabacloud.com/help/zh/model-studio/getting-started/models
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "请对“春天来了，大地”这句话进行续写，来表达春天的美好和作者的喜悦之情" },
        // { role: "assistant", content: "春天来了，大地", partial: true}
    ],
});
console.log(completion.choices[0].message.content)