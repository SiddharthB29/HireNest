package com.placement.service;

import com.placement.entity.Student;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.StudentRepository;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
public class ResumeTextService {

    private final ResumeCacheService resumeCacheService;
    private final StudentRepository studentRepository;
    private final ResumeStorageService resumeStorageService;
    private final ResumeTextExtractor resumeTextExtractor;

    public ResumeTextService(
            ResumeCacheService resumeCacheService,
            StudentRepository studentRepository,
            ResumeStorageService resumeStorageService,
            ResumeTextExtractor resumeTextExtractor) {

        this.resumeCacheService = resumeCacheService;
        this.studentRepository = studentRepository;
        this.resumeStorageService = resumeStorageService;
        this.resumeTextExtractor = resumeTextExtractor;
    }

    public String getResumeText(Long studentId) {

        // 1. Try Redis first.
        String resumeText = resumeCacheService.getResumeText(studentId);

        // 2. Recover the resume text if the cache is missing.
        if (resumeText == null || resumeText.isBlank()) {

            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Student not found with id: " + studentId
                    ));

            String resumePath = student.getResumePath();

            if (resumePath == null || resumePath.isBlank()) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "No resume uploaded for this student"
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

            // 3. Restore Redis for future requests.
            resumeCacheService.cacheResumeText(studentId, resumeText);
        }

        return resumeText;
    }
}