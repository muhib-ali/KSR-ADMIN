import { Module } from "@nestjs/common";
import { ChatbotTrainingClientService } from "./chatbot-training-client.service";

@Module({
  providers: [ChatbotTrainingClientService],
  exports: [ChatbotTrainingClientService],
})
export class ChatbotTrainingModule {}
