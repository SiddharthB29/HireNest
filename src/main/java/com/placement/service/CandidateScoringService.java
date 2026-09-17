package com.placement.service;

import com.placement.entity.CandidateScore;
import com.placement.entity.Job;
import com.placement.entity.Student;
import org.springframework.stereotype.Service;

@Service
public class CandidateScoringService {

    private static final double SKILL_WEIGHT = 0.40;
    private static final double CGPA_WEIGHT = 0.30;
    private static final double PROJECT_WEIGHT = 0.20;
    private static final double CERTIFICATION_WEIGHT = 0.10;

    private final SkillScorer skillScorer;
    private final CgpaScorer cgpaScorer;
    private final ProjectScorer projectScorer;
    private final CertificationScorer certificationScorer;

    public CandidateScoringService(SkillScorer skillScorer,
                                   CgpaScorer cgpaScorer,
                                   ProjectScorer projectScorer,
                                   CertificationScorer certificationScorer) {
        this.skillScorer = skillScorer;
        this.cgpaScorer = cgpaScorer;
        this.projectScorer = projectScorer;
        this.certificationScorer = certificationScorer;
    }

    public CandidateScore calculateScore(Student student, Job job) {

        double skillScore = skillScorer.calculateScore(student, job);
        double cgpaScore = cgpaScorer.calculateScore(student, job);
        double projectScore = projectScorer.calculateScore(student, job);
        double certificateScore = certificationScorer.calculateScore(student, job);

        CandidateScore candidateScore = new CandidateScore();

        candidateScore.setStudentId(student.getId());
        candidateScore.setJobId(job.getId());

        candidateScore.setSkillScore(skillScore);

        candidateScore.setCgpaScore(cgpaScore);
        candidateScore.setProjectScore(projectScore);
        candidateScore.setCertificationScore(certificateScore);

        double totalScore =
                (skillScore * SKILL_WEIGHT)
                        + (cgpaScore * CGPA_WEIGHT)
                        + (projectScore * PROJECT_WEIGHT)
                        + (certificateScore * CERTIFICATION_WEIGHT);

        candidateScore.setTotalScore(totalScore);

        return candidateScore;
    }
}