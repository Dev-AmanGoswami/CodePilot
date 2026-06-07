package com.example.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class MessageResponse {
    private UUID id;
    private UUID sessionId;
    private String role;
    private String content;
    private LocalDateTime createdAt;
}