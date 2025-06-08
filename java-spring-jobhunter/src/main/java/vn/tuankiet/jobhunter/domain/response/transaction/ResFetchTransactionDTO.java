package vn.tuankiet.jobhunter.domain.response.transaction;

import java.time.Instant;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import vn.tuankiet.jobhunter.util.constant.PaymentStatusEnum;
import vn.tuankiet.jobhunter.util.constant.TransactionTypeEnum;

@Getter
@Setter
public class ResFetchTransactionDTO {
    private long id;
    private String email;
    private String paymentRef;
    private Double amount;
    @Enumerated(EnumType.STRING)
    private PaymentStatusEnum paymentStatus;
    @Enumerated(EnumType.STRING)
    private TransactionTypeEnum transactionType;

    private Instant createdAt;
    private Instant updatedAt;

    private String createdBy;
    private String updatedBy;

    private UserResume user;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class UserResume {
        private long id;
        private String name;
    }
} 