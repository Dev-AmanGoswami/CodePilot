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


@WorkflowImpl(taskQueues = "coding-agent-task-queue")
public class CodingAgentWorkflowImpl {

    private final AgentActivities activities = Workflow.newActivityStub(
            AgentActivities.class,
            ActivityOptions.newBuilder()
                    .setStartToCloseTimeout(Duration.ofMinutes(5))
                    .build());

    private AgentStatusEvent status = new AgentStatusEvent();

}
