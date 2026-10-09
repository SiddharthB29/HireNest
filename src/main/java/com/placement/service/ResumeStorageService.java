package com.placement.service;

import com.placement.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestClientException;

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


    public byte[] downloadResume(Long studentId, String storagePath) {

        if (studentId == null || studentId <= 0
                || storagePath == null) {
            throw new IllegalArgumentException(
                    "Student ID and resume storage path are required"
            );
        }

        // Ensure the path belongs to this student and matches
        // the UUID-based filenames created by uploadResume().
        String expectedPathPattern =
                "^" + studentId
                        + "/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-"
                        + "[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-"
                        + "[0-9a-fA-F]{12}\\.(pdf|docx)$";

        if (!storagePath.matches(expectedPathPattern)) {
            throw new IllegalArgumentException(
                    "Invalid resume storage path"
            );
        }

        String downloadUrl =
                supabaseUrl
                        + "/storage/v1/object/"
                        + BUCKET_NAME
                        + "/"
                        + storagePath;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.set("apikey", supabaseKey);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    downloadUrl,
                    HttpMethod.GET,
                    request,
                    byte[].class
            );

            byte[] fileBytes = response.getBody();

            if (fileBytes == null || fileBytes.length == 0) {
                throw new FileStorageException(
                        "Downloaded resume is empty",
                        new IllegalStateException(
                                "Supabase returned an empty response body"
                        )
                );
            }

            return fileBytes;

        } catch (RestClientException ex) {
            throw new FileStorageException(
                    "Could not download resume from Supabase",
                    ex
            );
        }
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