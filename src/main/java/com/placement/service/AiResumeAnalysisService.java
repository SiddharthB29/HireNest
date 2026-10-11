package com.placement.service;

import com.placement.dto.ResumeAnalysisResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AiResumeAnalysisService {

    private final ChatClient chatClient;
    private final ResumeTextService resumeTextService;

    public AiResumeAnalysisService(
            ChatClient.Builder chatClientBuilder,
            ResumeTextService resumeTextService) {

        this.chatClient = chatClientBuilder.build();
        this.resumeTextService = resumeTextService;
    }

    public ResumeAnalysisResponse analyzeResume(String resumeText) {

        return chatClient
                .prompt()
                .system("""
                        You are HireNest's AI resume analysis assistant.

                        Analyze only the information provided in the resume.

                        Rules:
                        - Extract technical skills explicitly supported by the resume.
                        - List strengths supported by resume evidence.
                        - For potential gaps, say which relevant skills or
                          information are not mentioned in the resume.
                        - Never assume that an unmentioned skill is a skill
                          the candidate does not possess.
                        - Do not invent qualifications, projects, or experience.
                        - Give practical, truthful improvement suggestions.
                        - Keep the overall summary concise and objective.
                        """)
                .user("""
                        Analyze this resume:

                        --- RESUME START ---
                        %s
                        --- RESUME END ---
                        """.formatted(resumeText))
                .call()
                .entity(ResumeAnalysisResponse.class);
    }

    public ResumeAnalysisResponse analyzeStudentResume(Long studentId) {
        String resumeText = resumeTextService.getResumeText(studentId);
        return analyzeResume(resumeText);
    }
}