package com.example.common.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sessions")
@Data @AllArgsConstructor @NoArgsConstructor
public class Session {
    @Id
    @GeneratedValue
    private UUID id;
    private String title;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}