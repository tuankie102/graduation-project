package vn.tuankiet.jobhunter.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import vn.tuankiet.jobhunter.util.SecurityUtil;
import vn.tuankiet.jobhunter.util.constant.PaymentStatusEnum;
import vn.tuankiet.jobhunter.util.constant.TransactionTypeEnum;
@Entity
@Table(name = "GIAODICH")
@Getter
@Setter
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maGiaoDich")
    private long id;

    @NotNull(message = "maThamChieu không được để trống")
    @Column(name = "maThamChieu", unique = true)
    private String paymentRef;

    @NotNull(message = "soTien không được để trống")
    @Column(name = "soTien")
    private double amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai")
    private PaymentStatusEnum paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "loaiGiaoDich")
    private TransactionTypeEnum transactionType;

    @Column(name = "ngayTao")
    private Instant createdAt;
    @Column(name = "ngayCapNhat")
    private Instant updatedAt;
    @Column(name = "nguoiTao")
    private String createdBy;
    @Column(name = "nguoiCapNhat")
    private String updatedBy;

    @ManyToOne
    @JoinColumn(name = "maNguoiDung")
    private User user;


    @PrePersist
    public void handleBeforeCreate() {
        this.createdBy = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        this.updatedAt = Instant.now();
    }
}
