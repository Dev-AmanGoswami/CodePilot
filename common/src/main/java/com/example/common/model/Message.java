package com.example.common.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class Message {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    private String role;

    @Column(columnDefinition = "text")
    private String content;

    @Column(columnDefinition = "jsonb") // Tool calls as JSON - this is why JsonbType exists
    private String toolCalls;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
