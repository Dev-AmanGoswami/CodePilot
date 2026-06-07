package com.example.common.dto;
//Event which will be sent from the server whenever some update is made

import com.example.common.model.TaskRunStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @AllArgsConstructor @NoArgsConstructor
public class AgentStatusEvent {
    private UUID sessionId;
    private TaskRunStatus status;
    private String detail;
    private LocalDateTime timestamp;
}
