package com.placement.service;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Service
public class ResumeTextExtractor {

    private final Tika tika = new Tika();

    public String extractText(MultipartFile file)
            throws IOException, TikaException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Resume file cannot be empty"
            );
        }

        return extractText(file.getBytes());
    }

    public String extractText(byte[] fileBytes)
            throws IOException, TikaException {

        if (fileBytes == null || fileBytes.length == 0) {
            throw new IllegalArgumentException(
                    "Resume file cannot be empty"
            );
        }

        String text;

        try (ByteArrayInputStream inputStream =
                     new ByteArrayInputStream(fileBytes)) {
            text = tika.parseToString(inputStream);
        }

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException(
                    "Could not extract text from the resume"
            );
        }

        return text.trim();
    }
}