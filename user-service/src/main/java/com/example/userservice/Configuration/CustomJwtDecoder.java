package com.example.userservice.Configuration;

import java.text.ParseException;
import java.util.Objects;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import com.example.userservice.dto.request.IntrospectRequest;
import com.example.userservice.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;

@Component
public class CustomJwtDecoder implements JwtDecoder{
    @Value("${jwt.signerKey}")
    private String signerKey;
    
    @Value("${jwt.signerKey-refresh}")
    private String signerKeyRefresh;

    @Autowired
    private AuthenticationService authenticationService;;

    private NimbusJwtDecoder nimbusJwtDecoder=null;

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            IntrospectRequest request = new IntrospectRequest();
            request.setToken(token);
            var response = authenticationService.introspect(request,false);
            if (!response.isValid()) {
                throw new JwtException("Invalid JWT token");
            }
        } catch (JOSEException | ParseException e) {
            throw new JwtException(e.getMessage());
        }

        if(Objects.isNull(nimbusJwtDecoder)){
            SecretKeySpec secretKeySpec =new SecretKeySpec(signerKey.getBytes(),"HmacSHA512");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
        }
        return nimbusJwtDecoder.decode(token);
    }
}
