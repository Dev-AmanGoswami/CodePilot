package com.example.worker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Long-running worker process. It hosts the Temporal workflow + activity
 * implementations and polls the task queue for work started by the api module.
 *
 * The entities and repositories live in the `common` module (package
 * com.example.common.*), which is outside this app's base package, so we point
 * Spring's entity scan and repository scan at them explicitly.
 */
@SpringBootApplication
@EntityScan(basePackages = "com.example.common.model")
@EnableJpaRepositories(basePackages = "com.example.common.repository")
public class WorkerApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkerApplication.class, args);
    }
}
