import OpenAI from "openai";
import { getEnv, encodeImage } from "../util/index.js";
import path from 'path';

const openai = new OpenAI(
    {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx"
        apiKey: getEnv()?.parsed?.API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);

// 将xxx/eagle.png替换为你本地图像的绝对路径
const base64Image = encodeImage("assets/images/desk.png")
async function main() {
    const completion = await openai.chat.completions.create({
        model: "qwen-vl-max",  // 此处以qwen-vl-max-latest为例，可按需更换模型名称。模型列表：https://help.aliyun.com/model-studio/getting-started/model
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              },
              {
                type: 'text',
                text: "用一个个框定位图像每一个蛋糕的位置并描述其各自的特征，以JSON格式输出所有的bbox的坐标"
              }
            ]
          }
        ],
        vl_high_resolution_images: 'True',
        temperature: 0,
        top_k: 1,
        response_format: {
            type: "json_object"
        }
    });
    console.log(completion.choices[0].message.content);
}

main();