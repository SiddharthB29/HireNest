package com.placement.dto;

import java.util.List;

public record JobMatchResponse(
        Long jobId,
        String jobTitle,
        String overallAssessment,
        List<String> relevantStrengths,
        List<String> requirementsNotDemonstrated,
        List<String> improvementSuggestions,
        String overallSummary) {
}
