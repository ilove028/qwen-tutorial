import OpenAI from "openai";
import process from 'process';
import readline from 'readline/promises';
import { getEnv } from '../util/index.js'

// 初始化 readline 接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 初始化 openai 客户端
const openai = new OpenAI({
    apiKey: getEnv()?.parsed?.API_KEY, // 从环境变量读取
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

let reasoningContent = '';
let answerContent = '';
let isAnswering = false;
let messages = [];
let conversationIdx = 1;

async function main() {
    while (true) {
        console.log("=".repeat(20) + `第${conversationIdx}轮对话` + "=".repeat(20));
        conversationIdx++;
        
        // 读取用户输入
        const userInput = await rl.question("请输入你的消息：");
        messages.push({ role: 'user', content: userInput });

        // 重置状态
        reasoningContent = '';
        answerContent = '';
        isAnswering = false;

        try {
            const stream = await openai.chat.completions.create({
                // 您可以按需更换为其它深度思考模型
                model: 'qwen-plus-2025-04-28',
                messages: messages,
                // enable_thinking 参数开启思考过程，QwQ 与 DeepSeek-R1 模型总会进行思考，不支持该参数
                enable_thinking: true,
                stream: true,
                thinking_budget: 50
                // stream_options:{
                //     include_usage: true
                // }
            });

            console.log("\n" + "=".repeat(20) + "思考过程" + "=".repeat(20) + "\n");

            for await (const chunk of stream) {
                if (!chunk.choices?.length) {
                    console.log('\nUsage:');
                    console.log(chunk.usage);
                    continue;
                }

                const delta = chunk.choices[0].delta;
                
                // 处理思考过程
                if (delta.reasoning_content) {
                    process.stdout.write(delta.reasoning_content);
                    reasoningContent += delta.reasoning_content;
                }
                
                // 处理正式回复
                if (delta.content) {
                    if (!isAnswering) {
                        console.log('\n' + "=".repeat(20) + "完整回复" + "=".repeat(20) + "\n");
                        isAnswering = true;
                    }
                    process.stdout.write(delta.content);
                    answerContent += delta.content;
                }
            }
            
            // 将完整回复加入消息历史
            messages.push({ role: 'assistant', content: answerContent });
            console.log("\n");
            
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// 启动程序
main().catch(console.error);