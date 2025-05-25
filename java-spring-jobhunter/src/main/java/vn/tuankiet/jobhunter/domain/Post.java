package vn.tuankiet.jobhunter.domain;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import vn.tuankiet.jobhunter.util.SecurityUtil;

@Entity
@Table(name = "BAIDANG")
@Getter
@Setter
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maBaiDang")
    private long id;

    @Column(name = "tieuDe")
    private String title;

    @Column(name = "noiDung", columnDefinition = "TEXT")
    private String content;

    @Column(name = "ngayBatDau")
    private Instant startDate;
    @Column(name = "ngayKetThuc")
    private Instant endDate;
    @Column(name = "hoatDong")
    private boolean active;
    @Column(name = "ngayTao")
    private Instant createdAt;
    @Column(name = "ngayCapNhat")
    private Instant updatedAt;
    @Column(name = "nguoiTao")
    private String createdBy;
    @Column(name = "nguoiCapNhat")
    private String updatedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maNguoiDung")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maCongViec")
    private Job job;

    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Resume> resumes;

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