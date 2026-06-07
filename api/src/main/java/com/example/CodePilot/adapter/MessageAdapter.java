package com.example.CodePilot.adapter;

import com.example.common.dto.MessageResponse;
import com.example.common.model.Message;
import org.springframework.stereotype.Component;

@Component
public class MessageAdapter {

    public MessageResponse toMessageResponse(Message message){
        return MessageResponse.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
