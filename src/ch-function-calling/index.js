import OpenAI from "openai";
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { getEnv } from '../util/index.js';

const openai = new OpenAI({
    apiKey: getEnv()?.parsed?.API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

const tools = [
    {
        type: "function",
        function: {
            name: "get_current_time",
            description: "当你想知道现在的时间时非常有用。",
            parameters: {}
        }
    },
    {
        type: "function",
        function: {
            name: "get_current_weather",
            description: "当你想查询指定城市的天气时非常有用。",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "城市或县区，比如北京市、杭州市、余杭区等。"
                    }
                },
                required: ["location"]
            }
        }
    }
];

async function main() {
    const rl = readline.createInterface({ input, output });
    const question = await rl.question("请输入您的问题："); 
    rl.close();
    
    const messages = [{ role: "user", content: question }];
    
    let reasoningContent = "";
    let answerContent = "";
    const toolInfo = [];
    let isAnswering = false;

    console.log("=".repeat(20) + "思考过程" + "=".repeat(20));
    
    try {
        const stream = await openai.chat.completions.create({
            // 此处以qwen-plus-2025-04-28为例，可更换为其它深度思考模型
            model: "qwen-plus-2025-04-28",
            messages,
            // 开启深度思考，该参数对 QwQ 模型无效
            enable_thinking: false,
            tools,
            stream: true,
            parallel_tool_calls: true
        });

        for await (const chunk of stream) {
            if (!chunk.choices?.length) {
                console.log("\n" + "=".repeat(20) + "Usage" + "=".repeat(20));
                console.log(chunk.usage);
                continue;
            }

            const delta = chunk.choices[0]?.delta;
            if (!delta) continue;

            // 处理思考过程
            if (delta.reasoning_content) {
                reasoningContent += delta.reasoning_content;
                process.stdout.write(delta.reasoning_content);
            }
            // 处理回复内容
            else {
                if (!isAnswering) {
                    isAnswering = true;
                    console.log("\n" + "=".repeat(20) + "回复内容" + "=".repeat(20));
                }
                if (delta.content) {
                    answerContent += delta.content;
                    process.stdout.write(delta.content);
                }
                // 处理工具调用
                if (delta.tool_calls) {
                    for (const toolCall of delta.tool_calls) {
                        const index = toolCall.index;
                        
                        // 确保数组长度足够
                        while (toolInfo.length <= index) {
                            toolInfo.push({});
                        }
                        
                        // 更新工具ID
                        if (toolCall.id) {
                            toolInfo[index].id = (toolInfo[index].id || "") + toolCall.id;
                        }
                        
                        // 更新函数名称
                        if (toolCall.function?.name) {
                            toolInfo[index].name = (toolInfo[index].name || "") + toolCall.function.name;
                        }
                        
                        // 更新参数
                        if (toolCall.function?.arguments) {
                            toolInfo[index].arguments = (toolInfo[index].arguments || "") + toolCall.function.arguments;
                        }
                    }
                }
            }
        }

        console.log("\n" + "=".repeat(19) + "工具调用信息" + "=".repeat(19));
        console.log(toolInfo.length ? toolInfo : "没有工具调用");

    } catch (error) {
        console.error("发生错误:", error);
    }
}

main(); 