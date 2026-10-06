package com.ricebowl.api.infra.security;

import com.ricebowl.api.domain.user.User;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class AccountMailService {
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String from;
    private final String publicUrl;

    public AccountMailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.mail.from:}") String from,
            @Value("${app.public-url:http://localhost:5173}") String publicUrl) {
        this.mailSenderProvider = mailSenderProvider;
        this.from = from;
        this.publicUrl = publicUrl.replaceAll("/$", "");
    }

    public void sendVerification(User user, String rawToken) {
        send(
                user.getEmail(),
                "Confirme seu e-mail no RiceBowl",
                "Confirme sua conta acessando: " + publicUrl + "/verify-email?token=" + rawToken
                        + "\n\nSe você não criou esta conta, ignore esta mensagem.");
    }

    public void sendPasswordReset(User user, String rawToken) {
        send(
                user.getEmail(),
                "Redefinição de senha do RiceBowl",
                "Redefina sua senha acessando: " + publicUrl + "/reset-password?token=" + rawToken
                        + "\n\nO link é temporário e de uso único. Se você não solicitou, ignore esta mensagem.");
    }

    private void send(String recipient, String subject, String body) {
        var sender = mailSenderProvider.getIfAvailable();
        if (sender == null || from.isBlank()) {
            throw new IllegalStateException("Email delivery is not configured");
        }
        var message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);
        sender.send(message);
    }
}
