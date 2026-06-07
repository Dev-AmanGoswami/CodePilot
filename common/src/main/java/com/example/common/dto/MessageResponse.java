package com.example.common.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class MessageResponse {
    private String id;
    private UUID sessionId;
}
