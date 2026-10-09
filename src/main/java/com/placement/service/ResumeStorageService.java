package com.placement.service;

import com.placement.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class ResumeStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String BUCKET_NAME = "resumes";
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024;

    public String uploadResume(Long studentId, MultipartFile file) {

        validateFile(file);

        String originalFileName = file.getOriginalFilename();
        String extension = getExtension(originalFileName);

        String fileName =
                studentId + "/" + UUID.randomUUID() + extension;

        String uploadUrl =
                supabaseUrl
                        + "/storage/v1/object/"
                        + BUCKET_NAME
                        + "/"
                        + fileName;

        HttpHeaders headers = new HttpHeaders();

        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.set("apikey", supabaseKey);

        headers.setContentType(
                MediaType.parseMediaType(file.getContentType())
        );

        try {

            HttpEntity<byte[]> request =
                    new HttpEntity<>(file.getBytes(), headers);

            restTemplate.exchange(
                    uploadUrl,
                    HttpMethod.POST,
                    request,
                    String.class
            );

        } catch (IOException ex) {

            throw new FileStorageException(
                    "Could not read resume file",
                    ex
            );
        }

        return fileName;
    }

    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Resume file is required"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Resume must not exceed 2 MB"
            );
        }

        String extension = getExtension(file.getOriginalFilename());
        String contentType = file.getContentType();

        boolean validPdf =
                ".pdf".equals(extension)
                        && "application/pdf"
                        .equalsIgnoreCase(contentType);

        boolean validDocx =
                ".docx".equals(extension)
                        && "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        .equalsIgnoreCase(contentType);

        if (!validPdf && !validDocx) {
            throw new IllegalArgumentException(
                    "Only PDF and DOCX resumes are allowed"
            );
        }
    }

    private String getExtension(String fileName) {

        if (fileName == null || !fileName.contains(".")) {
            throw new IllegalArgumentException(
                    "Invalid file name"
            );
        }

        return fileName
                .substring(fileName.lastIndexOf("."))
                .toLowerCase();
    }
}