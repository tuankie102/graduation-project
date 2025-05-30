package vn.tuankiet.jobhunter.controller;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.tuankiet.jobhunter.domain.Role;
import vn.tuankiet.jobhunter.domain.User;
import vn.tuankiet.jobhunter.domain.request.ReqChangePasswordDTO;
import vn.tuankiet.jobhunter.domain.request.ReqLoginDTO;
import vn.tuankiet.jobhunter.domain.response.ResCreateUserDTO;
import vn.tuankiet.jobhunter.domain.response.ResLoginDTO;
import vn.tuankiet.jobhunter.domain.response.ResUpdateUserDTO;
import vn.tuankiet.jobhunter.service.UserService;
import vn.tuankiet.jobhunter.service.EmailVerificationService;
import vn.tuankiet.jobhunter.service.RoleService;
import vn.tuankiet.jobhunter.domain.request.ReqVerifyCode;
import vn.tuankiet.jobhunter.util.constant.GenderEnum;
import vn.tuankiet.jobhunter.util.SecurityUtil;
import vn.tuankiet.jobhunter.util.annotation.ApiMessage;
import vn.tuankiet.jobhunter.util.error.EmailVerificationException;
import vn.tuankiet.jobhunter.util.error.IdInvalidException;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final SecurityUtil securityUtil;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final RoleService roleService;

    @Value("${tuankiet.jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;

    public AuthController(
            AuthenticationManagerBuilder authenticationManagerBuilder,
            SecurityUtil securityUtil,
            UserService userService,
            PasswordEncoder passwordEncoder,
            EmailVerificationService emailVerificationService,
            RoleService roleService) {
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.securityUtil = securityUtil;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.emailVerificationService = emailVerificationService;
        this.roleService = roleService;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ResLoginDTO> login(@Valid @RequestBody ReqLoginDTO loginDto) {
        // Nạp input gồm username/password vào Security
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                loginDto.getUsername(), loginDto.getPassword());

        // xác thực người dùng => cần viết hàm loadUserByUsername
        Authentication authentication = authenticationManagerBuilder.getObject()
                .authenticate(authenticationToken);

        // set thông tin người dùng đăng nhập vào context (có thể sử dụng sau này)
        SecurityContextHolder.getContext().setAuthentication(authentication);

        ResLoginDTO res = new ResLoginDTO();
        User currentUserDB = this.userService.handleGetUserByUsername(loginDto.getUsername());
        if (currentUserDB != null) {
            ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                    currentUserDB.getId(),
                    currentUserDB.getEmail(),
                    currentUserDB.getName(),
                    currentUserDB.getAge(),
                    currentUserDB.getGender(),
                    currentUserDB.getAddress(),
                    currentUserDB.getRole(),
                    currentUserDB.getCompany());
            res.setUser(userLogin);
        }

        // create access token
        String access_token = this.securityUtil.createAccessToken(authentication.getName(), res);
        res.setAccessToken(access_token);

        // create refresh token
        String refresh_token = this.securityUtil.createRefreshToken(loginDto.getUsername(), res);

        // update user
        this.userService.updateUserToken(refresh_token, loginDto.getUsername());

        // set cookies
        ResponseCookie resCookies = ResponseCookie
                .from("refresh_token", refresh_token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenExpiration)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, resCookies.toString())
                .body(res);
    }

    @GetMapping("/auth/account")
    @ApiMessage("fetch account")
    public ResponseEntity<ResLoginDTO.UserGetAccount> getAccount() {
        String email = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        User currentUserDB = this.userService.handleGetUserByUsername(email);
        ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin();
        ResLoginDTO.UserGetAccount userGetAccount = new ResLoginDTO.UserGetAccount();

        if (currentUserDB != null) {
            userLogin.setId(currentUserDB.getId());
            userLogin.setEmail(currentUserDB.getEmail());
            userLogin.setName(currentUserDB.getName());
            userLogin.setAge(currentUserDB.getAge());
            userLogin.setGender(currentUserDB.getGender());
            userLogin.setAddress(currentUserDB.getAddress());
            userLogin.setRole(currentUserDB.getRole());
            userLogin.setCompany(currentUserDB.getCompany());

            userGetAccount.setUser(userLogin);
        }
        return ResponseEntity.ok().body(userGetAccount);
    }

    @GetMapping("/auth/refresh")
    @ApiMessage("Get User by refresh token")
    public ResponseEntity<ResLoginDTO> getRefreshToken(
            @CookieValue(name = "refresh_token", defaultValue = "abc") String refresh_token) throws IdInvalidException {
        if (refresh_token.equals("abc")) {
            throw new IdInvalidException("Bạn không có refresh token ở cookie");
        }
        // check valid
        Jwt decodedToken = this.securityUtil.checkValidRefreshToken(refresh_token);
        String email = decodedToken.getSubject();

        // check user by token + email
        User currentUser = this.userService.getUserByRefreshTokenAndEmail(refresh_token, email);
        if (currentUser == null) {
            throw new IdInvalidException("Refresh Token không hợp lệ");
        }

        // issue new token/set refresh token as cookies
        ResLoginDTO res = new ResLoginDTO();
        User currentUserDB = this.userService.handleGetUserByUsername(email);
        if (currentUserDB != null) {
            ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                    currentUserDB.getId(),
                    currentUserDB.getEmail(),
                    currentUserDB.getName(),
                    currentUserDB.getAge(),
                    currentUserDB.getGender(),
                    currentUserDB.getAddress(),
                    currentUserDB.getRole(),
                    currentUserDB.getCompany());
            res.setUser(userLogin);
        }

        // create access token
        String access_token = this.securityUtil.createAccessToken(email, res);
        res.setAccessToken(access_token);

        // create refresh token
        String new_refresh_token = this.securityUtil.createRefreshToken(email, res);

        // update user
        this.userService.updateUserToken(new_refresh_token, email);

        // set cookies
        ResponseCookie resCookies = ResponseCookie
                .from("refresh_token", new_refresh_token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenExpiration)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, resCookies.toString())
                .body(res);
    }

    @PostMapping("/auth/logout")
    @ApiMessage("Logout User")
    public ResponseEntity<Void> logout() throws IdInvalidException {
        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get() : "";

        if (email.equals("")) {
            throw new IdInvalidException("Access Token không hợp lệ");
        }

        // update refresh token = null
        this.userService.updateUserToken(null, email);

        // remove refresh token cookie
        ResponseCookie deleteSpringCookie = ResponseCookie
                .from("refresh_token", null)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteSpringCookie.toString())
                .body(null);
    }

    @PostMapping("/auth/register")
    @ApiMessage("Registering code has been sent to your email")
    public ResponseEntity<ResCreateUserDTO> register(@Valid @RequestBody User postManUser) throws IdInvalidException {
        boolean isEmailExist = this.userService.isEmailExist(postManUser.getEmail());
        if (isEmailExist) {
            throw new IdInvalidException(
                    "Email " + postManUser.getEmail() + " đã tồn tại, vui lòng sử dụng email khác.");
        }

        emailVerificationService.generateAndSaveVerificationCode(postManUser);
        ResCreateUserDTO response = new ResCreateUserDTO();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/verify")
    @ApiMessage("Verify registration code")
    public ResponseEntity<ResCreateUserDTO> verifyCode(@Valid @RequestBody User user) {
            emailVerificationService.verifyCode(user.getEmail(), user.getCode());
            // Create user account
            String hashPassword = this.passwordEncoder.encode(user.getPassword());
            user.setPassword(hashPassword);

            if (user.getRole() == null) {
                Role userRole = this.roleService.findByName("NORMAL_USER");
                user.setRole(userRole);
            }
                
            User createdUser = this.userService.handleCreateUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(this.userService.convertToResCreateUserDTO(createdUser));

    }

    @PutMapping("/auth/change-password")
    @ApiMessage("Change password successfully")
    public ResponseEntity<ResUpdateUserDTO> changePassword(@Valid @RequestBody ReqChangePasswordDTO reqChangePasswordDTO) throws IdInvalidException {
        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get() : "";
        if (email.equals("")) {
            throw new IdInvalidException("Access Token không hợp lệ");
        }

        User currentUser = this.userService.handleGetUserByUsername(email);
        if (currentUser == null) {
            throw new IdInvalidException("Không tìm thấy người dùng");
        }

        // Verify old password
        if (!this.passwordEncoder.matches(reqChangePasswordDTO.getOldPassword(), currentUser.getPassword())) {
            throw new IdInvalidException("Mật khẩu cũ không đúng");
        }

        // Update new password
        String hashedNewPassword = this.passwordEncoder.encode(reqChangePasswordDTO.getNewPassword());
        currentUser.setPassword(hashedNewPassword);
        User updatedUser = this.userService.handleUpdateUser(currentUser);

        return ResponseEntity.ok().body(this.userService.convertToResUpdateUserDTO(updatedUser));
    }

    @PutMapping("/auth/update-info")
    @ApiMessage("Update user information successfully")
    public ResponseEntity<ResUpdateUserDTO> updateUserInfo(@Valid @RequestBody ResUpdateUserDTO userDTO) throws IdInvalidException {
        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get() : "";
        if (email.equals("")) {
            throw new IdInvalidException("Access Token không hợp lệ");
        }

        User currentUser = this.userService.handleGetUserByUsername(email);
        if (currentUser == null) {
            throw new IdInvalidException("Không tìm thấy người dùng");
        }

        // Update user information
        currentUser.setName(userDTO.getName());
        currentUser.setAge(userDTO.getAge());
        currentUser.setAddress(userDTO.getAddress());
        currentUser.setGender(userDTO.getGender());

        User updatedUser = this.userService.handleUpdateUser(currentUser);
        return ResponseEntity.ok().body(this.userService.convertToResUpdateUserDTO(updatedUser));
    }
}
