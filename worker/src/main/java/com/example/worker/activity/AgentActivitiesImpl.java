package com.example.worker.activity;

import com.example.common.model.Message;
import com.example.common.model.Session;
import com.example.common.repository.MessageRepository;
import com.example.common.repository.SessionRepository;
import com.example.common.temporal.AgentActivities;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class AgentActivitiesImpl implements AgentActivities{
    private final ChatClient chatClient;
    private final SessionRepository sessionRepository;
    private final MessageRepository messageRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void storeMessage(UUID sessionId, String role, String content, String toolCalls){
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        Message message = Message.builder()
                .session(session)
                .role(role)
                .content(content)
                .toolCalls(toolCalls)
                .build();

        messageRepository.save(message);
        log.debug("Stored {} message for session {}", role, session);
    }

    @Override
    public String resolveWorkspaceDir(String sessionId){
        String baseUrl = System.getProperty("user.dir") + "/workspace/" + sessionId;
        log.debug("Resolved baseUrl: {}", baseUrl);
        return baseUrl;
    }

    @Override
    public String callOpenAi(String userPrompt, String workingDirectory){
        log.debug("Calling open AI");
        try{
            Files.createDirectories(Path.of(workingDirectory));
            String prompt = "[WORKING DIRECTORY]: " + workingDirectory + "\n" +
                    "All new projects and files must be inside mentioned WORKING DIRECTORY \n" +
                    "Use this absolute path as a base for all file operations \n\n" +
                    userPrompt;

            String response = chatClient
                    .prompt()
                    .user(prompt)
                    .call()
                    .content();

            log.info("OpenAI call completed. Response length {}", prompt.length());

            return response != null ? response : "";
        }catch(Exception e){
            log.error("OpenAI call failed {}", e.getMessage());
            throw new RuntimeException("Failed to call OpenAI", e);
        }
    }

    @Override
    public String executeTool(String toolName, String parametersJson){
        try{
            return chatClient;
        }catch(Exception e){
            throw new RuntimeException("Tool execution failed", e);
        }
    }
}
