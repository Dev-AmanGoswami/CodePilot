package com.example.common.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "task_runs")
@Data @AllArgsConstructor @NoArgsConstructor
public class TaskRun {
    private UUID id;
    private UUID sessionId;
    private String workflowId;

    @Enumerated(EnumType.STRING)
    private TaskRunStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
