package vn.tuankiet.jobhunter.service;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.mail.MailException;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;

import vn.tuankiet.jobhunter.domain.response.email.ResEmailResume;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final MailSender mailSender;
    private final JavaMailSender javaMailSender;
    private final SpringTemplateEngine templateEngine;

    public EmailService(MailSender mailSender,
            JavaMailSender javaMailSender,
            SpringTemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.javaMailSender = javaMailSender;
        this.templateEngine = templateEngine;
    }

    public void sendSimpleEmail() {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo("kietboi51@gmail.com");
        msg.setSubject("Testing from Spring Boot");
        msg.setText("Hello World from Spring Boot Email");
        this.mailSender.send(msg);
    }

    public void sendEmailSync(String to, String subject, String content, boolean isMultipart, boolean isHtml) {
        // Prepare message using a Spring helper
        MimeMessage mimeMessage = this.javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper message = new MimeMessageHelper(mimeMessage, isMultipart, StandardCharsets.UTF_8.name());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content, isHtml);
            this.javaMailSender.send(mimeMessage);
        } catch (MailException | MessagingException e) {
            System.out.println("ERROR SEND EMAIL: " + e);
        }
    }

    @Async
    public void sendEmailFromTemplateSync(String to, String subject, String templateName, String name, String objectName, Object value) {
        try {
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable(objectName, value);

            String htmlContent = templateEngine.process(templateName, context);

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // Handle attachment if exists
            if (value instanceof ResEmailResume) {
                ResEmailResume resume = (ResEmailResume) value;
                if (resume.getAttachmentUrl() != null && !resume.getAttachmentUrl().isEmpty()) {
                    try {
                        // Get current path and add storage/resume
                        String currentPath = System.getProperty("user.dir");
                        String filePath = currentPath + "/upload/resume/" + resume.getAttachmentUrl();
                        System.out.println("Looking for file: " + filePath);
                        FileSystemResource res = new FileSystemResource(new File(filePath));

                        // Read file as byte array
                        // Path path = Paths.get(filePath);
                        // byte[] content = Files.readAllBytes(path);
                        
                        // Add attachment
                        helper.addAttachment(resume.getAttachmentUrl(), res);
                        System.out.println("File attached successfully");
                    } catch (Exception e) {
                        System.out.println("Error adding attachment: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }
            javaMailSender.send(message);
        } catch (Exception e) {
            System.out.println("Error sending email: " + e.getMessage());
            e.printStackTrace();
        }
    }

}
