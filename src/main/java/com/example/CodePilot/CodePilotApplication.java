package com.example.CodePilot;

import com.fasterxml.jackson.databind.ser.AnyGetterWriter;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class CodePilotApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();
		for(var entry: dotenv.entries()){
			System.setProperty(entry.getKey(), entry.getValue());
		}
		ConfigurableApplicationContext context = SpringApplication.run(CodePilotApplication.class, args);
		AgentService agentService = (AgentService) context.getBean("agentService");
		agentService.startInteractiveSession();
	}
}
