package com.example.worker.temporal;

import com.example.common.dto.AgentStatusEvent;
import com.example.common.dto.MessageResponse;
import com.example.common.temporal.AgentActivities;
import com.example.common.temporal.CodingAgentWorkflow;
import io.temporal.activity.ActivityOptions;
import io.temporal.spring.boot.WorkflowImpl;
import io.temporal.workflow.Workflow;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

/**
 * Workflow implementation — the durable orchestrator (the "glue" from the
 * architecture notes). It must stay deterministic: no direct LLM calls, DB
 * access, random, or now() here. All real work goes through the activity stub.
 */
@WorkflowImpl(taskQueues = "coding-agent-task-queue")
public class CodingAgentWorkflowImpl implements CodingAgentWorkflow {

    private final AgentActivities activities = Workflow.newActivityStub(
            AgentActivities.class,
            ActivityOptions.newBuilder()
                    .setStartToCloseTimeout(Duration.ofMinutes(5))
                    .build());

    private AgentStatusEvent status = new AgentStatusEvent();

    @Override
    public String execute(UUID sessionId, String userMessage) {
        // TODO: implement the agentic loop described in
        // docs/temporal-agentic-architecture-notes.md (§3):
        //   1. storeMessage(user)
        //   2. loop: callOpenAi -> if tools, executeTool (fan-out) -> feed back
        //   3. break on final answer, storeMessage(assistant)
        activities.storeMessage(sessionId, "user", userMessage, null);
        return "TODO: agentic loop not implemented yet";
    }

    @Override
    public AgentStatusEvent getStatus() {
        // Query methods are read-only and run during replay — never call
        // activities or mutate state here; just return in-memory state.
        return status;
    }

    @Override
    public List<MessageResponse> getMessages() {
        // TODO: return the in-memory conversation accumulated during execute().
        return List.of();
    }
}
