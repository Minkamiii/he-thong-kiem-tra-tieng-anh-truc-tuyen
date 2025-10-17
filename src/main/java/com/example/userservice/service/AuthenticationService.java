package com.example.userservice.service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.example.userservice.dto.reponse.ApiResponse;
import com.example.userservice.dto.reponse.AuthenticationResponse;
import com.example.userservice.dto.reponse.IntrospectResponse;
import com.example.userservice.dto.request.AuthenticationRequest;
import com.example.userservice.dto.request.IntrospectRequest;
import com.example.userservice.dto.request.LogoutRequest;
import com.example.userservice.dto.request.RefreshTokenRequest;
import com.example.userservice.entity.InvalidatedToken;
import com.example.userservice.entity.User;
import com.example.userservice.exception.AppException;
import com.example.userservice.exception.ErrorCode;
import com.example.userservice.repository.InvalidatedTokenRepository;
import com.example.userservice.repository.UserRepository;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

@Service
public class AuthenticationService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvalidatedTokenRepository invalidatedTokenRepository;
    

    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY_ACCESS;
    
    @Value("${jwt.signerKey-refresh}")
    protected String SIGNER_KEY_REFRESH;

    @Value("${jwt.access-token-valid-duration}")
    protected Long ACCESS_TOKEN_VALID_DURATION;

    @Value("${jwt.refresh-token-valid-duration}")
    protected Long REFRESH_TOKEN_VALID_DURATION;

    // @Autowired
    // @Value("${jwt.valid-duration}")
    // protected Long VALID_DURATION;

    // @Autowired
    // @Value("${jwt.refreshable-duration}")
    // protected Long REFRESHABLE_DURATION;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid=true;

        try {
            verifyToken(token,false);
        } catch (Exception e) {
            throw e;
        }
        return new IntrospectResponse(isValid);
    }

    public ApiResponse authenticate(AuthenticationRequest request,boolean adminLogin) {
        var user = userRepository.findByUsername(request.getUsername())
                .filter(u -> u.getUsername().equals(request.getUsername()))
                .orElseThrow(() -> new AppException(ErrorCode.LOGIN_INVALID));
        
        PasswordEncoder passwordEncoder= new BCryptPasswordEncoder(10);
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        
        if(!authenticated) throw new AppException(ErrorCode.LOGIN_INVALID);

        if(adminLogin && !(user.getRoles().contains("SUPER_ADMIN") || user.getRoles().contains("ADMIN"))){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String accessToken = generateToken(user,"access");
        String refreshToken = generateToken(user,"refresh");
        AuthenticationResponse authResponse = new AuthenticationResponse(authenticated, user.getId(),accessToken,refreshToken);
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setResult(authResponse);
        return apiResponse;
    }

    public void logout (LogoutRequest request) throws ParseException, JOSEException {
        try {

            SignedJWT signedJWT = SignedJWT.parse(request.getToken());
            String jit = signedJWT.getJWTClaimsSet().getJWTID();
            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken = new InvalidatedToken();
            invalidatedToken.setId(jit);
            invalidatedToken.setExpirytime(expiryTime);

            invalidatedTokenRepository.save(invalidatedToken);
        } catch (AppException exception) {
            throw exception;
        }
    }

    private SignedJWT verifyToken (String token, boolean isRefresh) throws ParseException, JOSEException {
        String key = isRefresh ? SIGNER_KEY_REFRESH : SIGNER_KEY_ACCESS;
        
        JWSVerifier verifier = new MACVerifier(key.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);
        // Date expiryTime = (isRefresh) 
        //     ? 
        //     new Date(signedJWT.getJWTClaimsSet().getIssueTime()
        //         // .toInstant().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS).toEpochMilli())
        //         .toInstant().plus(token_duration, ChronoUnit.SECONDS).toEpochMilli())
        //     :
        //     signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);
        if(!verified){
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        if(!expiryTime.after(new Date())){
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        if(invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return signedJWT;
    }

    public ApiResponse refreshToken(RefreshTokenRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getRefreshToken(),true);

        var username = signedJWT.getJWTClaimsSet().getSubject();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        var newToken = generateToken(user,"access");
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setResult(newToken);
        return apiResponse;
    }

    private String generateToken(User user,String type){
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        Long VALID_DURATION = 0L;
        String SIGNER_KEY = "";
        if("access".equals(type)){
            VALID_DURATION = ACCESS_TOKEN_VALID_DURATION;
            SIGNER_KEY = SIGNER_KEY_ACCESS;
        } else if ("refresh".equals(type)) {
            VALID_DURATION = REFRESH_TOKEN_VALID_DURATION;
            SIGNER_KEY = SIGNER_KEY_REFRESH;
        }
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
            .subject(user.getUsername())          //người đăng nhập
            .issuer("userservice.com")  //xác định token được issue từ ai (thường là từ domain của service)
            .issueTime(new Date()) //thời gian token được issue
            .expirationTime(new Date(
                Instant.now().plus(VALID_DURATION,ChronoUnit.SECONDS).toEpochMilli()
            ))
            .jwtID(UUID.randomUUID().toString()) //mỗi token sẽ có 1 id riêng
            .claim("scope", buildScope(user)) //quyền của user
            .claim("type", type)
            .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            System.out.println(e);
            throw new RuntimeException(e);
        }
    }

    private String buildScope(User user){
        StringJoiner stringJoiner = new StringJoiner(" ");
        if(!CollectionUtils.isEmpty(user.getRoles())){
            for(String role : user.getRoles()) {
                stringJoiner.add(role);
            }
        }
        return stringJoiner.toString();
    }
}
