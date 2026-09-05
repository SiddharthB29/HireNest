package com.placement.service;

import com.placement.dto.LoginRequest;
import com.placement.dto.RegisterRequest;
import com.placement.entity.Role;
import com.placement.entity.User;
import com.placement.exception.ConflictException;
import com.placement.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JWTService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUserName())) {
            throw new ConflictException("Username already exists");
        }

        if (request.getRole() == null) {
            throw new IllegalArgumentException("Role is required");
        }

        if (request.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Public registration is allowed only for students"
            );
        }

        if (request.getCompanyId() != null) {
            throw new IllegalArgumentException(
                    "Students cannot be associated with a company"
            );
        }

        User user = new User(
                request.getUserName(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole()
        );

        return userRepository.save(user);
    }

    public String login(LoginRequest request) {

        User user = userRepository.findByUsername(request.getUserName())
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Invalid username or password"
                        ));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new BadCredentialsException(
                    "Invalid username or password"
            );
        }

        return jwtService.generateToken(user.getUsername());
    }
}