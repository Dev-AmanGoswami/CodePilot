package com.example.worker.temporal;

import com.example.common.dto.MessageResponse;
import com.example.common.temporal.AgentActivities;
import io.temporal.spring.boot.ActivityImpl;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Activity implementations — the units of real work with side effects
 * (LLM calls, tool runs, DB writes). These CAN use Spring beans from the
 * common module (e.g. inject MessageRepository here to persist messages).
 *
 * Reminder from the notes: activities are retried, so DB writes must be
 * idempotent (use a deterministic id derived from workflowId + step).
 */
@Component
@ActivityImpl(taskQueues = "coding-agent-task-queue")
public class AgentActivitiesImpl implements AgentActivities {

    // TODO: inject the common repositories / LLM client you need, e.g.
    // private final MessageRepository messageRepository;

    @Override
    public void storeMessage(UUID sessionId, String role, String content, String toolCalls) {
        // TODO: persist a Message via MessageRepository (common module).
    }

    @Override
    public List<MessageResponse> getConversationHistory(UUID sessionId) {
        // TODO: load messages for the session from MessageRepository.
        return List.of();
    }

    @Override
    public String resolveWorkspaceDir(String sessionId) {
        // TODO: return the workspace directory for this session.
        return null;
    }

    @Override
    public String callOpenAi(String messageJson, String workingDirectory) {
        // TODO: call the LLM and return its response.
        return null;
    }

    @Override
    public String executeTool(String toolName, String parametersJson) {
        // TODO: run the requested tool and return its result.
        return null;
    }
}
