import OpenAI from "openai";
import { format } from 'date-fns';
import readline from 'readline';
import { getEnv } from '../util/index.js';

function getCurrentWeather(location) {
    return `${location}今天是雨天。`;
}
function getCurrentTime() {
    // 获取当前日期和时间
    const currentDatetime = new Date();
    // 格式化当前日期和时间
    const formattedTime = format(currentDatetime, 'yyyy-MM-dd HH:mm:ss');
    // 返回格式化后的当前时间
    return `当前时间：${formattedTime}。`;
}
const openai = new OpenAI(
    {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
        apiKey: getEnv()?.parsed?.API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);
const tools = [
// 工具1 获取当前时刻的时间
{
    "type": "function",
    "function": {
        "name": "getCurrentTime",
        "description": "当你想知道现在的时间时非常有用。",
        // 因为获取当前时间无需输入参数，因此parameters为空
        "parameters": {}  
    }
},  
// 工具2 获取指定城市的天气
{
    "type": "function",
    "function": {
        "name": "getCurrentWeather",
        "description": "当你想查询指定城市、城市行政区、区县的天气时非常有用。",
        "parameters": {  
            "type": "object",
            "properties": {
                // 查询天气时需要提供位置，因此参数设置为location
                "location": {
                    "type": "string",
                    "description": "城市、城市行政区、区县，比如北京市、杭州市、余杭区等。"
                }
            },
            "required": ["location"]
        }
    }
}
];
async function getResponse(messages) {
    const response = await openai.chat.completions.create({
        model: "qwen-plus",  // 模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
        messages: messages,
        tools: tools,
        enable_thinking: false,
        parallel_tool_calls: true
    });
    return response;
}
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.question("user: ", async (question) => {
    const messages = [ { role: "system", content: "你是一个行政区域和天气助手" }, { "role": "user","content": question}];
    let i = 1;
    const firstResponse = await getResponse(messages);
    let assistantOutput = firstResponse.choices[0].message;    
    console.log(`第${i}轮大模型输出信息：${JSON.stringify(assistantOutput)}`);
    if (Object.is(assistantOutput.content,null)){
        assistantOutput.content = "";
    }
    messages.push(assistantOutput);
    if (! ("tool_calls" in assistantOutput)) {
        console.log(`无需调用工具，我可以直接回复：${assistantOutput.content}`);
        rl.close();
    } else{
        while ("tool_calls" in assistantOutput) {
            for (let i = 0; i < assistantOutput.tool_calls.length; i++) {
                let toolInfo = {};
                if (assistantOutput.tool_calls[i].function.name == "getCurrentWeather" ) {
                    toolInfo = {"role": "tool"};
                    let location = JSON.parse(assistantOutput.tool_calls[i].function.arguments)["location"];
                    toolInfo["content"] = getCurrentWeather(location);
                } else if (assistantOutput.tool_calls[i].function.name == "getCurrentTime" ) {
                    toolInfo = {"role":"tool"};
                    toolInfo["content"] = getCurrentTime();
                }
                messages.push(toolInfo);
            }
            assistantOutput = (await getResponse(messages)).choices[0].message;
            if (Object.is(assistantOutput.content,null)){
                assistantOutput.content = "";
            }
            messages.push(assistantOutput);
            i += 1;
            console.log(`第${i}轮大模型输出信息：${JSON.stringify(assistantOutput)}`)
    }
    console.log("=".repeat(100));
    console.log(`最终大模型输出信息：${JSON.stringify(assistantOutput.content)}`);
    rl.close();
    }});