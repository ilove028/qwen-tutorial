import OpenAI from "openai";
import { getEnv } from "../util/index.js";

async function main() {
  const config = getEnv()
  const openai = new OpenAI(
      {
          // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
          apiKey: config?.parsed?.API_KEY, // 如何获取API Key：https://help.aliyun.com/zh/model-studio/developer-reference/get-api-key
          baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      }
  );
    const completion = await openai.chat.completions.create({
        // 模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
        model: "qwen-plus",  // qwen-plus 属于 qwen3 模型，如需开启思考模式，请参见：https://help.aliyun.com/zh/model-studio/deep-thinking
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `请从这封客户反馈邮件中提取以下信息：1.客户信息 2.软件版本 3.错误代码 4.问题描述 5.操作系统 6.其他相关细节
------------
邮件正文：
主题：【报障求助】智能百炼助手启动故障
尊敬的百炼客服和技术支持团队，
我是来自通义科技的张伟，我的用户ID是12345。我正在使用的智能百炼助手软件版本为V3.1.8，在此向您报告一个严重影响工作进度的技术问题，望尽快协助解决。
自昨日下午起，我在启动智能百炼助手时遇到严重障碍，软件启动过程卡在初始化界面，错误码为ERR-2007，并弹出错误提示“数据库连接失败”，导致所有功能模块无法正常使用。这一情况已经持续至今，严重影响了我司的办公效率。
我目前使用的服务器操作系统是Windows 10版本1909，针对64位架构进行优化。在遇到问题后，我已经采取了若干初步故障排除措施，其中包括完全关闭并重新启动系统以试图清除可能的临时软件冲突或系统挂起状态，以及彻底卸载并重新安装相关软件，旨在消除可能存在的软件损坏或配置错误问题。然而，尽管进行了这些常规解决尝试，问题仍然持续存在，未见任何改善。
为了便于更深入地诊断问题，我已将详细的错误截图和系统日志文件作为附件一并提供。这些材料应当能精确展示错误发生时的软件状态、异常详情以及任何相关的错误代码，为快速定位并解决当前遇到的技术障碍提供了关键信息。
期待您的尽快回复！
结果只返回json,json关键字使用英文` }
        ],
    });
    console.log(completion.choices[0].message.content)
}

main()