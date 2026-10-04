package com.placement.service;

import com.placement.entity.CandidateScore;
import com.placement.entity.Job;
import com.placement.entity.Student;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class CandidateScoringServiceTest {

    private final CandidateScoringService scoringService =
            new CandidateScoringService(
                    new SkillScorer(),
                    new CgpaScorer(),
                    new ProjectScorer(),
                    new CertificationScorer()
            );

    @Test
    void calculateScoreCombinesWeightedScoresAndIdentifiers() {
        Student student = new Student();
        student.setId(12L);
        student.setCgpa(8.0);
        student.setSkills(Set.of("Java", "SQL"));
        student.setProjectCount(2);
        student.setCertificationCount(1);

        Job job = new Job();
        job.setPreferredSkills(Set.of("Java", "SQL", "React", "AWS"));

        CandidateScore score = scoringService.calculateScore(student, job);

        assertEquals(50.0, score.getSkillScore());
        assertEquals(80.0, score.getCgpaScore());
        assertEquals(70.0, score.getProjectScore());
        assertEquals(50.0, score.getCertificationScore());
        assertEquals(63.0, score.getTotalScore());
        assertEquals(12L, score.getStudentId());
        assertEquals(null, score.getJobId());
    }

    @Test
    void calculateScoreHandlesMissingProfileMetricsAsZero() {
        Student student = new Student();
        Job job = new Job();
        job.setPreferredSkills(Set.of("Java"));

        CandidateScore score = scoringService.calculateScore(student, job);

        assertNotNull(score);
        assertEquals(0.0, score.getSkillScore());
        assertEquals(0.0, score.getCgpaScore());
        assertEquals(0.0, score.getProjectScore());
        assertEquals(0.0, score.getCertificationScore());
        assertEquals(0.0, score.getTotalScore());
    }
}
