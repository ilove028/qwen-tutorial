import OpenAI from "openai";
import { readFileSync } from 'fs';
import { getEnv } from "../util/index.js";
import path from 'path';
import * as z from 'zod';

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

const InvoiceSchema = z.object({
    number: z.string().describe('发票号'),
    date: z.string().describe('发票日期,格式为YYYY-MM-DD'),
    price: z.object({
        amount: z.number().describe('发票金额'),
        currency: z.string().describe('发票金额的货币单位例如 CNY、USD、EUR、JPY等'),
    }),
    startStation: z.string().describe('出发站'),
    endStation: z.string().describe('到达站'),
    trainNumber: z.string().describe('火车车次'),
    trainType: z.string().describe('火车类型'),
    seatType: z.string().describe('座位类型'),
    seatNumber: z.string().describe('座位号'),
    passengerName: z.string().describe('乘客姓名'),
    passengerIdNumber: z.string().describe('乘客身份证号'),
    departureTime: z.string().describe('出发时间，格式为YYYY-MM-DD HH:mm'),
});
// 将xxx/eagle.png替换为你本地图像的绝对路径
const base64Image = encodeImage("assets/images/invoice.jpg")
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
                        "image_url": {"url": `data:image/jpeg;base64,${base64Image}`},},
                        {"type": "text", "text": `提取图片中的信息，输出格式定义为${JSON.stringify(z.toJSONSchema(InvoiceSchema))}的JSON，不用输出JSON格式定义`}]}
        ],
        response_format: {
            type: "json_object"
        }


    });
    console.log(completion.choices[0].message.content);
}

main();