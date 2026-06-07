package com.example.CodePilot.service;

import com.example.CodePilot.adapter.MessageAdapter;
import com.example.common.dto.MessageResponse;
import com.example.common.dto.SendMessageRequest;
import com.example.common.model.Message;
import com.example.common.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final MessageAdapter messageAdapter;

    public List<MessageResponse> getMessages(UUID id){
        return null;
    }
}
