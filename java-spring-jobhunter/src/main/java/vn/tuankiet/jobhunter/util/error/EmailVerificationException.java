package vn.tuankiet.jobhunter.util.error;
 
public class EmailVerificationException extends RuntimeException {
    public EmailVerificationException(String message) {
        super(message);
    }
} 