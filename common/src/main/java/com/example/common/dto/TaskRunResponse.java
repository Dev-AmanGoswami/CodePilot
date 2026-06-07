package com.example.common.dto;

import com.example.common.model.TaskRunStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data @AllArgsConstructor @NoArgsConstructor
public class TaskRunResponse {
    private UUID id;
    private String workflowId;
    private TaskRunStatus status;
}
