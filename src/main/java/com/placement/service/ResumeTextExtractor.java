package com.placement.service;

import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import org.apache.tika.exception.TikaException;

@Service
public class ResumeTextExtractor {

    private final Tika tika = new Tika();

    public String extractText(MultipartFile file) throws IOException, TikaException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Resume file cannot be empty");
        }

        String text = tika.parseToString(file.getInputStream());

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException(
                    "Could not extract text from the resume"
            );
        }

        return text.trim();
    }
}