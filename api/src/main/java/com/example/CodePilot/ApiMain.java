package com.example.CodePilot;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class ApiMain {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();
		for(var entry: dotenv.entries()){
			System.setProperty(entry.getKey(), entry.getValue());
		}
		ConfigurableApplicationContext context = SpringApplication.run(ApiMain.class, args);
		AgentService agentService = (AgentService) context.getBean("agentService");
		agentService.startInteractiveSession();
	}
}
