package com.example.common.temporal;

import com.example.common.dto.AgentStatusEvent;
import com.example.common.dto.MessageResponse;
import io.temporal.workflow.QueryMethod;
import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;

import java.util.List;
import java.util.UUID;

@WorkflowInterface
public interface CodingAgentWorkflow {
    @WorkflowMethod
    String execute(UUID sessionId, String userMessage);

    @QueryMethod
    AgentStatusEvent getStatus();

    @QueryMethod
    List<MessageResponse> getMessages();
}