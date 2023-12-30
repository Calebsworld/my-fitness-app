package com.calebcodes.fitness.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping(value = "/api", produces = "application/json")
public class AuthController {

    @GetMapping("/generate-state")
    public ResponseEntity<String> generateState(HttpSession session) {
        String state = generateSecureRandomString(); // Implement this method to generate a random string
        session.setAttribute("authState", state); // Store in the session
        return ResponseEntity.ok(state);
    }

    @GetMapping("/callback")
    public void handleAuth0Callback(@RequestParam String code, HttpServletResponse response) throws IOException {
        String accessToken = exchangeCodeForTokens(code);
        Cookie cookie = new Cookie("accessToken", accessToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // if using HTTPS
        cookie.setPath("/"); // set appropriate path
        response.addCookie(cookie);

        // Redirect to SPA /load-user
        response.sendRedirect("http://localhost:4200/load-user");
    }

    // Implement these methods

    private String generateSecureRandomString() {
        String state = "";
        // Generate a random string
        return state;
    }

    private String exchangeCodeForTokens(String code) {
        String token = "";
        // Make A POST request to Auth0's token endpoint
        return token;
    }

}
