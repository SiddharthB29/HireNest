package com.placement.dto;

import java.util.List;

public record ResumeAnalysisResponse(
        List<String> technicalSkills,
        List<String> strengths,
        List<String> potentialGaps,
        List<String> suggestions,
        String overallSummary
) {
}