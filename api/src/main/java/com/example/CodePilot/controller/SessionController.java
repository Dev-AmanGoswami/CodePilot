package com.example.CodePilot.controller;

import com.example.CodePilot.service.MessageService;
import com.example.CodePilot.service.SessionService;
import com.example.CodePilot.service.TemporalClientService;
import com.example.common.dto.MessageResponse;
import com.example.common.dto.SendMessageRequest;
import com.example.common.dto.SessionResponse;
import com.example.common.dto.TaskRunResponse;
import com.example.common.model.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/session")
@RequiredArgsConstructor
public class SessionController {
    private final SessionService sessionService;
    private final TemporalClientService temporalClientService;
    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<com.example.common.dto.SessionResponse> createSession(){
        SessionResponse session = sessionService.createSession();
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    @GetMapping
    public ResponseEntity<List<SessionResponse>> listSessions(){
        return ResponseEntity.of(Optional.empty());
    }


    @GetMapping("/{id}")
    public ResponseEntity<SessionResponse> getSession(@PathVariable UUID id){
        return ResponseEntity.ok(sessionService.getSession(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<SessionResponse> deleteSession(@PathVariable UUID id){
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/message")
    public ResponseEntity<TaskRunResponse> sendMessage(
            @PathVariable UUID id,
            @Valid @RequestBody SendMessageRequest request){
        Session session = sessionService.findById(id);
        TaskRunResponse taskRun = temporalClientService.startWorkflow(session, request.getContent());

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(taskRun);
    }

    @GetMapping("/{id}/message")
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable UUID id){
        return ResponseEntity.ok(messageService.getMessages(id));
    }

//    @GetMapping(value = "/{id}/status", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
//    public SseEmitter streamStatus(@PathVariable UUID id){
//        SseEmitter sseEmitter = new SseEmitter(300_000L);
//
//    }
}
