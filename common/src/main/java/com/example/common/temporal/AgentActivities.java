package com.example.common.temporal;

import com.example.common.dto.MessageResponse;
import io.temporal.activity.ActivityInterface;
import io.temporal.activity.ActivityMethod;

import java.util.List;
import java.util.UUID;

@ActivityInterface
public interface AgentActivities {
    @ActivityMethod
    void storeMessage(UUID sessionId, String role, String content, String toolCalls);

    @ActivityMethod
    List<MessageResponse> getConversationHistory(UUID sessionId);

    @ActivityMethod
    String resolveWorkspaceDir(String sessionId);

    @ActivityMethod
    String callOpenAi(String userPrompt, String workingDirectory);

    @ActivityMethod
    String executeTool(String toolName, String parametersJson);
}