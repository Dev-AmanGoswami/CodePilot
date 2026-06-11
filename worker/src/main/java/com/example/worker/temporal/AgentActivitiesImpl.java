package com.example.worker.temporal;

import com.example.common.dto.MessageResponse;
import com.example.common.temporal.AgentActivities;
import io.temporal.spring.boot.ActivityImpl;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@ActivityImpl(taskQueues = "coding-agent-task-queue")
public class AgentActivitiesImpl {

}
