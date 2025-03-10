import { ExecutionEnvironment } from "@/types/executor";
import { generateText } from "ai";
import { google } from '@ai-sdk/google';
import prisma from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/encryption";
import { TelegramTask } from "@/lib/workflow/task/TelegramTask";
import { telegramTools } from "@/lib/telegram-plugin/telegram";


export async function TelegramExecutor(
  environment: ExecutionEnvironment<typeof TelegramTask>
): Promise<boolean> {
  try {
    const Message = environment.getInput("Message");
    if (!Message) {
      environment.log.error("input->Message not defined");
    }

    const botToken = environment.getInput("Bot Token");
    if (!botToken) {
      environment.log.error("input->botToken not defined");
    }

    const chatId = environment.getInput("Chat ID");
    if (!chatId) {
      environment.log.error("input->chatId not defined");
    }
     // Get credentials from DB
     const credential = await prisma.credential.findUnique({
      where: { id: botToken },
    });

    if (!credential) {
      environment.log.error("credential not found");
      return false;
    }

    const decryptedBotToken = symmetricDecrypt(credential.value);
    if (!decryptedBotToken) {
      environment.log.error("cannot decrypt bot token");
      return false;
    }
    const response = await fetch(`https://api.telegram.org/bot${decryptedBotToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: Message,
      })
    });

    if (!response.ok) {
      environment.log.error(`Telegram API error: ${response.status} ${response.statusText}`);
      return false;
    }
    environment.setOutput("Response", "Message sent: " + Message);
    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
