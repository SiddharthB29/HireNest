package com.placement.service;

import com.placement.dto.CandidateRankingResponse;
import com.placement.dto.PlacementEvaluation;
import com.placement.entity.*;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.ApplicationRepository;
import com.placement.repository.JobRepository;
import com.placement.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class PlacementEngineService {

    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final PlacementEngine placementEngine;
    private final CandidateScoringService candidateScoringService;

    public PlacementEngineService(
            StudentRepository studentRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            PlacementEngine placementEngine,
            CandidateScoringService candidateScoringService) {

        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.placementEngine = placementEngine;
        this.candidateScoringService = candidateScoringService;
    }



    public Job getJob(Long jobId) {

        return jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found with id " + jobId));
    }

    public List<Student> getEligibleStudents(Job job) {

        List<Student> eligibleStudents = new ArrayList<>();

        List<Student> students = studentRepository.findAll();

        for (Student student : students) {

            EligibilityResult result =
                    placementEngine.evaluate(student, job);

            if (result.isEligible()) {
                eligibleStudents.add(student);
            }
        }

        return eligibleStudents;
    }

    public List<PlacementEvaluation> evaluateAllStudents(Job job) {

        List<PlacementEvaluation> evaluations = new ArrayList<>();

        List<Student> students = studentRepository.findAll();

        for (Student student : students) {

            EligibilityResult result =
                    placementEngine.evaluate(student, job);

            evaluations.add(
                    new PlacementEvaluation(
                            student.getId(),
                            student.getName(),
                            result.isEligible(),
                            result.getFailedCriteria()
                    )
            );
        }

        return evaluations;
    }

    public List<CandidateRankingResponse> getCandidatePool(Job job) {

        List<CandidateRankingResponse> candidates = new ArrayList<>();

        List<Application> applications =
                applicationRepository.findByJobIdAndStatus(
                        job.getId(),
                        ApplicationStatus.APPLIED
                );

        for (Application application : applications) {

            Student student = application.getStudent();

            EligibilityResult result =
                    placementEngine.evaluate(student, job);

            if (result.isEligible()) {

                CandidateScore score =
                        candidateScoringService.calculateScore(student, job);

                candidates.add(
                        new CandidateRankingResponse(
                                0,
                                student.getId(),
                                student.getName(),
                                score.getSkillScore(),
                                score.getCgpaScore(),
                                score.getProjectScore(),
                                score.getCertificationScore(),
                                score.getTotalScore()
                        )
                );
            }
        }

        candidates.sort(
                Comparator.comparing(
                        CandidateRankingResponse::getTotalScore
                ).reversed()
        );

        for (int i = 0; i < candidates.size(); i++) {
            candidates.get(i).setRank(i + 1);
        }

        return candidates;
    }
}