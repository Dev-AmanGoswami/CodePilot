package com.example.worker.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.springaicommunity.agent.tools.FileSystemTools;
import org.springaicommunity.agent.tools.GlobTool;
import org.springaicommunity.agent.tools.GrepTool;
import org.springaicommunity.agent.tools.ShellTools;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;
import java.util.Objects;

@Configuration
@RequiredArgsConstructor
public class OpenAiConfig {
    private final ChatMemory chatMemory;

    private static final String SYSTEM_PROMPT = """
            You are an expert coding agent. You help users write, debug and improve code.
            You have access to the file system, shell, grep and glob tools to explore and modify codebases.
            You run directly on the user's machine and can execute any shell commands.
            
            IMPORTANT: Your workspace directory path will be provided in each user message.
            Always create new project directories and files INSIDE the workspace directory.
            Use absolute paths based on the workspace directory for all the file operations.
            When running shell commands, always cd into the workspace directory first.
            
            Always explain your reasoning before making changes. 
            When asked to modify code, read the relevant files first, then make targeted changes.
            """;

    @Bean
    public ObjectMapper objectMapper(){
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
    }
    @Bean
    public ChatClient chatClient(ChatClient.Builder builder){
        return builder
                .defaultSystem(SYSTEM_PROMPT)
                .defaultTools(
                        FileSystemTools.builder().build(),
                        GrepTool.builder().build(),
                        GlobTool.builder().build(),
                        ShellTools.builder().build()
                )
                .defaultToolContext(Map.of("workingDirectory", System.getProperty("user.dir") + "/workspace"))
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
    }
}
