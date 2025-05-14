package vn.tuankiet.jobhunter.util;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.util.Base64;

@Service
public class SecurityUtil {
    @Value("${tuankiet.jwt.base64-secret}")
    private String jwtSecret;

    @Value("${tuankiet.jwt.token-validity-in-seconds}")
    private long jwtExpiration;

    public static final MacAlgorithm JWT_ALGORITHM = MacAlgorithm.HS512;

    public void createToken(Authentication authentication) {

    }

}
