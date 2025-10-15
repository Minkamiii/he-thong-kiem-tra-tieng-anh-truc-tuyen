package com.example.userservice.service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import com.example.userservice.dto.reponse.AuthenticationResponse;
import com.example.userservice.dto.reponse.IntrospectResponse;
import com.example.userservice.dto.reponse.RefreshTokenReponse;
import com.example.userservice.dto.request.AuthenticationRequest;
import com.example.userservice.dto.request.IntrospectRequest;
import com.example.userservice.dto.request.LogoutRequest;
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
    

    @Autowired
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;
    

    @Autowired
    @Value("${jwt.access-token-valid-duration}")
    protected Long ACCESS_TOKEN_VALID_DURATION;

    @Autowired
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
            isValid=false;
        }
        return new IntrospectResponse(isValid);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request,boolean adminLogin) {
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_UNEXISTED));
        
        PasswordEncoder passwordEncoder= new BCryptPasswordEncoder(10);
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if(!authenticated || (adminLogin && !(user.getRoles().contains("SUPER_ADMIN") || user.getRoles().contains("ADMIN")))){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String accessToken = generateToken(user,ACCESS_TOKEN_VALID_DURATION);
        String refreshToken = generateToken(user,REFRESH_TOKEN_VALID_DURATION);

        return new AuthenticationResponse(accessToken, refreshToken, authenticated, user);
    }

    public void logout (LogoutRequest request) throws ParseException, JOSEException {
        try {
            var signToken = verifyToken(request.getToken(),true);

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken = new InvalidatedToken();
            invalidatedToken.setId(jit);
            invalidatedToken.setExpirytime(expiryTime);

            invalidatedTokenRepository.save(invalidatedToken);
        } catch (AppException exception) {
            System.out.println("token invalid");
        }
    }

    private SignedJWT verifyToken (String token, boolean isRefresh) throws ParseException, JOSEException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);
        
        Date expiryTime = (isRefresh) 
            ? 
            new Date(signedJWT.getJWTClaimsSet().getIssueTime()
                // .toInstant().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS).toEpochMilli())
                .toInstant().plus(ACCESS_TOKEN_VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli())
            :
            signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if(!(verified && expiryTime.after(new Date()))){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // if(invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())){
        //     throw new AppException(ErrorCode.UNAUTHENTICATED);
        // }

        return signedJWT;
    }

    public RefreshTokenReponse refreshToken(IntrospectRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getToken(),true);

        // var jit = signedJWT.getJWTClaimsSet().getJWTID();
        // var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        // InvalidatedToken invalidatedToken = new InvalidatedToken();
        // invalidatedToken.setId(jit);
        // invalidatedToken.setExpirytime(expiryTime);

        // invalidatedTokenRepository.save(invalidatedToken);

        var username = signedJWT.getJWTClaimsSet().getSubject();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        var newToken = generateToken(user,ACCESS_TOKEN_VALID_DURATION);
        return new RefreshTokenReponse(newToken);
    }

    private String generateToken(User user,Long VALID_DURATION){
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
            .subject(user.getUsername())          //người đăng nhập
            .issuer("userservice.com")  //xác định token được issue từ ai (thường là từ domain của service)
            .issueTime(new Date()) //thời gian token được issue
            .expirationTime(new Date(
                Instant.now().plus(VALID_DURATION,ChronoUnit.SECONDS).toEpochMilli()
            ))
            .jwtID(UUID.randomUUID().toString()) //mỗi token sẽ có 1 id riêng
            .claim("scope", buildScope(user)) //quyền của user
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
