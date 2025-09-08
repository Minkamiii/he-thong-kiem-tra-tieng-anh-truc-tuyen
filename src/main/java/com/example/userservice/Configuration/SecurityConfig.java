package com.example.userservice.Configuration;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity // cho phép tùy chỉnh cấu hình bảo mật
@EnableMethodSecurity // cho phép bảo mật ở cấp độ phương thức
public class SecurityConfig {

    private final String [] PUBLIC_ENDPOINTS ={
            "api/user/register",
            "api/auth/login",
            "api/auth/introspect",
            "api/auth/logout",
            "api/auth/refreshToken"
    };

    @Value("${jwt.signerKey}")
    private String signKey;;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(request ->
            request.requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS).permitAll()
                    // .requestMatchers(HttpMethod.GET, "/users").hasAuthority("SCOPE_ADMIN")
                    .anyRequest().authenticated()
        );

        httpSecurity.oauth2ResourceServer(oauth2 ->
            oauth2.jwt(jwtConfigurer -> jwtConfigurer.decoder(customJwtDecoder))
        );
        // cấu hình dùng jwt để xác thực

        httpSecurity.csrf(AbstractHttpConfigurer::disable);
        // crsf là loại tấn công khi hacker lợi dụng sessiom/cookie nhưng service  dùng jwt+restapi nên ko dùng session/cookie -> tắt 

        return httpSecurity.build();
    }

    @Autowired 
    private CustomJwtDecoder customJwtDecoder;

    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder(10);
    }
}
