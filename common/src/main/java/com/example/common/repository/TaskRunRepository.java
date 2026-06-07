package com.example.common.repository;

import com.example.common.model.TaskRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TaskRunRepository extends JpaRepository<TaskRun, UUID> {
}
