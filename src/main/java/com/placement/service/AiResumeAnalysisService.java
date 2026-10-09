package com.placement.service;

import com.placement.dto.ResumeAnalysisResponse;
import com.placement.entity.Student;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.StudentRepository;
import org.apache.tika.exception.TikaException;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class AiResumeAnalysisService {

    private final ChatClient chatClient;
    private final ResumeCacheService resumeCacheService;
    private final StudentRepository studentRepository;
    private final ResumeStorageService resumeStorageService;
    private final ResumeTextExtractor resumeTextExtractor;

    public AiResumeAnalysisService(
            ChatClient.Builder chatClientBuilder,
            ResumeCacheService resumeCacheService,
            StudentRepository studentRepository,
            ResumeStorageService resumeStorageService,
            ResumeTextExtractor resumeTextExtractor) {

        this.chatClient = chatClientBuilder.build();
        this.resumeCacheService = resumeCacheService;
        this.studentRepository = studentRepository;
        this.resumeStorageService = resumeStorageService;
        this.resumeTextExtractor = resumeTextExtractor;
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

        // 1. Try Redis first.
        String resumeText = resumeCacheService.getResumeText(studentId);

        // 2. If the cache is missing, recover the text from Supabase.
        if (resumeText == null || resumeText.isBlank()) {

            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Student not found with id: " + studentId
                    ));

            String resumePath = student.getResumePath();

            if (resumePath == null || resumePath.isBlank()) {
                throw new IllegalStateException(
                        "No resume path found for student: " + studentId
                );
            }

            byte[] fileBytes =
                    resumeStorageService.downloadResume(studentId, resumePath);

            try {
                resumeText = resumeTextExtractor.extractText(fileBytes);
            } catch (IOException | TikaException e) {
                throw new IllegalStateException(
                        "Could not extract text from the stored resume",
                        e
                );
            }

            // 3. Restore the Redis cache for future requests.
            resumeCacheService.cacheResumeText(studentId, resumeText);
        }

        // 4. Analyze the text using the existing AI prompt.
        return analyzeResume(resumeText);
    }
}