package com.placement.controller;

import com.placement.dto.AdminRecruiterRequest;
import com.placement.dto.AuthResponse;
import com.placement.dto.LoginRequest;
import com.placement.dto.RegisterRequest;
import com.placement.dto.UserSummaryResponse;
import com.placement.entity.User;
import com.placement.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        AuthResponse response = new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getRole()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @RequestBody LoginRequest request) {

        String token = authService.login(request);

        return ResponseEntity.ok(token);
    }

    @PostMapping("/admin/recruiters")
    public ResponseEntity<AuthResponse> createRecruiter(
            @RequestBody AdminRecruiterRequest request) {

        User user = authService.createRecruiter(request);

        AuthResponse response = new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getRole()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Issues a fresh token for the caller (picks up new claims, e.g. after creating a student profile). */
    @PostMapping("/refresh-token")
    public ResponseEntity<String> refreshToken() {
        return ResponseEntity.ok(authService.refreshToken());
    }

    /** Admin-only listing of recruiter accounts. */
    @GetMapping("/admin/recruiters")
    public ResponseEntity<List<UserSummaryResponse>> listRecruiters() {
        return ResponseEntity.ok(authService.getRecruiterAccounts());
    }
}
