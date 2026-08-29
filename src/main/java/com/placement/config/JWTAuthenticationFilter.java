package com.placement.config;

import com.placement.entity.User;
import com.placement.repository.UserRepository;
import com.placement.service.JWTService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private final JWTService jwtService;
    private final UserRepository userRepository;

    public JWTAuthenticationFilter(
            JWTService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {

            Jws<Claims> claims =
                    jwtService.validateToken(token);

            String username =
                    claims.getPayload().getSubject();

            User user = userRepository
                    .findByUsername(username)
                    .orElse(null);

            if (user != null &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                SimpleGrantedAuthority authority =
                        new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name()
                        );

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                Collections.singletonList(authority)
                        );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);
            }

        } catch (Exception e) {

            System.out.println(
                    "JWT validation failed: "
                            + e.getMessage()
            );

            // Do NOT send 401 here.
            // Let Spring Security handle the request.
        }

        var authentication =
                SecurityContextHolder.getContext().getAuthentication();

        System.out.println(
                "BEFORE FILTER CHAIN - AUTH = " + authentication
        );

        if (authentication != null) {
            System.out.println(
                    "BEFORE FILTER CHAIN - AUTHORITIES = "
                            + authentication.getAuthorities()
            );
        }
        filterChain.doFilter(request, response);
    }
}