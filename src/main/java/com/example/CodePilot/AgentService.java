package com.example.CodePilot;

import org.springaicommunity.agent.tools.*;
import org.springaicommunity.agent.utils.AgentEnvironment;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.ToolCallAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.aop.scope.ScopedProxyUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Scanner;
import java.util.UUID;

@Service
public class AgentService {
    private final ChatClient chatClient;
    private final Banner banner;
    private final Path workspaceDir;
    private final String conversationId = UUID.randomUUID().toString();

    public AgentService(
            ChatClient.Builder chatClientBuilder,
            Banner banner,
            @Value("classpath:/prompts/system-prompt.md") Resource systemPrompt
        ) throws IOException {

        //TODO - What Path class do
        workspaceDir = Path.of(System.getProperty("user.dir"), "workspace").toAbsolutePath();
        Files.createDirectories(workspaceDir);

        this.chatClient = chatClientBuilder
                .defaultSystem(p -> p.text(systemPrompt)
                        .param(AgentEnvironment.ENVIRONMENT_INFO_KEY, AgentEnvironment.info())
                        .param(AgentEnvironment.GIT_STATUS_KEY, AgentEnvironment.gitStatus())
                        .param("WORKSPACE_DIR", workspaceDir.toString())
                )
                .defaultTools(
                        FileSystemTools.builder().build(),
                        ShellTools.builder().build(),
                        GrepTool.builder().build(),
                        GlobTool.builder().build(),
                        TodoWriteTool.builder().build()
                )
                .defaultAdvisors(
                        ToolCallAdvisor.builder().conversationHistoryEnabled(false).build(),
                        MessageChatMemoryAdvisor.builder(
                                MessageWindowChatMemory.builder().maxMessages(50).build()
                        ).build()
                )
                .build();
        this.banner = banner;
    }

    public void startInteractiveSession() {
        banner.print();

        try (Scanner scanner = new Scanner(System.in)) {
            while (true) {
                System.out.print("\n\u001B[36mYou> \u001B[0m");
                System.out.flush();

                if (!scanner.hasNextLine()) {
                    break;
                }

                String input = scanner.nextLine().trim();

                System.out.println("Input: " + input);

                if (input.isEmpty()) {
                    continue;
                }

                if (input.equalsIgnoreCase("exit") || input.equalsIgnoreCase("quit")) {
                    System.out.println("\nGoodbye!");
                    break;
                }

                try{
                    System.out.println();
                    String response = chatClient.prompt(input)
                            .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
                            .user(input)
                            .call()
                            .content();

                    System.out.println("\u001B [33mAgent> \u001B[0m " + response);
                }catch(Exception e){
                    System.err.println("\u001B [31mError: " + e.getMessage() + "\u001B[0m");
                }
            }
        }
    }
}
