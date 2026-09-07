package com.placement.dto;

import java.util.List;

public class PlacementResult {

    private boolean eligible;
    private List<String> reasons;

    public PlacementResult(boolean eligible, List<String> reasons) {
        this.eligible = eligible;
        this.reasons = reasons;
    }

    public boolean isEligible() {
        return eligible;
    }

    public List<String> getReasons() {
        return reasons;
    }
}