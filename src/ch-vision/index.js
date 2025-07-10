import OpenAI from "openai";
import { readFileSync } from 'fs';
import { getEnv } from "../util/index.js";
import path from 'path';

const openai = new OpenAI(
    {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx"
        apiKey: getEnv()?.parsed?.API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);

const encodeImage = (imagePath) => {
    const imageFile = readFileSync(path.resolve(import.meta.dirname, '../../', imagePath));
    return imageFile.toString('base64');
  };
// 将xxx/eagle.png替换为你本地图像的绝对路径
const base64Image = encodeImage("assets/images/graduate.png")
async function main() {
    const completion = await openai.chat.completions.create({
        model: "qwen-vl-max",  // 此处以qwen-vl-max-latest为例，可按需更换模型名称。模型列表：https://help.aliyun.com/model-studio/getting-started/model
        messages: [
            {"role": "system", 
             "content": [{"type":"text","text": "You are a helpful assistant."}]},
            {"role": "user",
             "content": [{"type": "image_url",
                            // 需要注意，传入Base64，图像格式（即image/{format}）需要与支持的图片列表中的Content Type保持一致。
                           // PNG图像：  data:image/png;base64,${base64Image}
                          // JPEG图像： data:image/jpeg;base64,${base64Image}
                         // WEBP图像： data:image/webp;base64,${base64Image}
                        "image_url": {"url": `data:image/png;base64,${base64Image}`},},
                        {"type": "text", "text": "给出图中人脸的坐标,图片左上角为原点,返回json的数组对象，对象包含topLeft，bottomRight，和desc属性"}]}],
        response_format: {
            type: "json_object"
        }
    });
    console.log(completion.choices[0].message.content);
}

main();