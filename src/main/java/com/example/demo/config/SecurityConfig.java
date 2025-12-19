package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CSRF deaktivieren (wichtig für API-Zugriffe von React)
                .csrf(AbstractHttpConfigurer::disable)

                // 2. CORS konfigurieren (damit localhost:3000 zugreifen darf)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. Alle Anfragen müssen authentifiziert sein
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().authenticated()
                )

                // 4. HTTP Basic Auth aktivieren (für unseren einfachen Login)
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Erlaube Zugriff vom Frontend
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        // Erlaube alle Methoden (GET, POST, DELETE, etc.)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Erlaube alle Header (z.B. Authorization für das Passwort)
        configuration.setAllowedHeaders(List.of("*"));
        // Erlaube Credentials (Benutzername/Passwort)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}