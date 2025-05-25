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
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import vn.tuankiet.jobhunter.util.SecurityUtil;
import vn.tuankiet.jobhunter.util.constant.ResumeStateEnum;
import jakarta.persistence.Transient;

@Entity
@Table(name = "HOSOXINVIEC")
@Getter
@Setter
public class Resume {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maHoSo")
    private long id;

    @NotBlank(message = "email không được để trống")
    @Column(name = "email")
    private String email;

    @NotBlank(message = "url không được để trống (upload cv chưa thành công)")
    @Column(name = "linkCV")
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ResumeStateEnum status;

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

    @ManyToOne
    @JoinColumn(name = "maBaiDang")
    private Post post;

    @Transient
    private String message;

    @Transient
    private String attachmentUrl;

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
