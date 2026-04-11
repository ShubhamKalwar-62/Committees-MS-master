package com.example.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:no-reply@committee.local}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendRegistrationSuccessEmail(String toEmail, String name) {
        if (!mailEnabled) {
            logger.debug("Mail sending disabled (app.mail.enabled=false). Skipping email to {}", toEmail);
            return false;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Registration Successful");
        message.setText(
            "Hello " + (name == null || name.isBlank() ? "User" : name) + ",\n\n"
                + "Your registration was successful!\n\n"
                + "Thank you."
        );

        mailSender.send(message);
        logger.info("Registration success email sent to {}", toEmail);
        return true;
    }
}
