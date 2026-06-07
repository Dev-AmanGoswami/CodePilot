package com.example.CodePilot.service;

import com.example.common.dto.SessionResponse;
import com.example.common.model.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    public SessionResponse createSession(){
        return null;
    }

    public List<SessionResponse> listSession(){
        return List.of(new SessionResponse());
    }

    public SessionResponse getSession(UUID id){
        return null;
    }

    public void deleteSession(UUID id){

    }

    public Session findById(UUID id){
        return null;
    }
}
