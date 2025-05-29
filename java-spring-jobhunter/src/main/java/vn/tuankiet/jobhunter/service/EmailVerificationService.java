package vn.tuankiet.jobhunter.service;

import java.time.Instant;
import java.util.Optional;
import java.util.Random;

import org.springframework.stereotype.Service;

import vn.tuankiet.jobhunter.domain.EmailVerification;
import vn.tuankiet.jobhunter.domain.User;
import vn.tuankiet.jobhunter.repository.EmailVerificationRepository;
import vn.tuankiet.jobhunter.util.error.EmailVerificationException;

@Service
public class EmailVerificationService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final EmailService emailService;

    public EmailVerificationService(
            EmailVerificationRepository emailVerificationRepository,
            EmailService emailService) {
        this.emailVerificationRepository = emailVerificationRepository;
        this.emailService = emailService;
    }

    public String generateAndSaveVerificationCode(User user) {
        String code = String.format("%06d", new Random().nextInt(999999));
        
        EmailVerification verification = new EmailVerification();
        verification.setEmail(user.getEmail());
        verification.setCode(code);
        verification.setExpiryTime(Instant.now().plusSeconds(300)); // 5 minutes
        emailVerificationRepository.save(verification);

        System.out.println("Sending email to " + user.getEmail() + " with code " + code);
        emailService.sendEmailFromTemplateSync(user.getEmail(), "Xác thực đăng ký tài khoản JobHunter", "verification-code", user.getName(), "code", code);
        return code;
    }

    public EmailVerification verifyCode(String email, String code) {
        Optional<EmailVerification> verificationOpt = emailVerificationRepository.findTopByEmailOrderByIdDesc(email);
        if (verificationOpt.isEmpty()) {
            throw new EmailVerificationException("Email không tồn tại trong hệ thống");
        }

        EmailVerification verification = verificationOpt.get();
        if (verification.isVerified()) {
            throw new EmailVerificationException("Email đã được xác thực");
        }
        if (!verification.getCode().equals(code)) {
            throw new EmailVerificationException("Mã xác thực không đúng");
        }
        if (verification.getExpiryTime().isBefore(Instant.now())) {
            throw new EmailVerificationException("Mã xác thực đã hết hạn");
        }

        verification.setVerified(true);
        return emailVerificationRepository.save(verification);
    }
} 