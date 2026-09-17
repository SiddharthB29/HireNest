package com.placement.dto;

public class CandidateRankingResponse {

    private int rank;
    private Long studentId;
    private String studentName;

    private double skillScore;
    private double cgpaScore;
    private double projectScore;
    private double certificationScore;

    private double totalScore;

    public CandidateRankingResponse(
            int rank,
            Long studentId,
            String studentName,
            double skillScore,
            double cgpaScore,
            double projectScore,
            double certificationScore,
            double totalScore) {

        this.rank = rank;
        this.studentId = studentId;
        this.studentName = studentName;
        this.skillScore = skillScore;
        this.cgpaScore = cgpaScore;
        this.projectScore = projectScore;
        this.certificationScore = certificationScore;
        this.totalScore = totalScore;
    }

    public int getRank() {
        return rank;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public double getSkillScore() {
        return skillScore;
    }

    public double getCgpaScore() {
        return cgpaScore;
    }

    public double getProjectScore() {
        return projectScore;
    }

    public double getCertificationScore() {
        return certificationScore;
    }

    public double getTotalScore() {
        return totalScore;
    }

    public void setRank(int rank) {
        this.rank = rank;
    }
}