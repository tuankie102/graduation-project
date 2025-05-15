package vn.tuankiet.jobhunter.domain;

import java.time.Instant;
import java.util.List;

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
import com.fasterxml.jackson.annotation.JsonIgnore;

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
    private String tieuDe;

    @Column(name = "noiDung", columnDefinition = "TEXT")
    private String noiDung;
    
    @Column(name = "ngayBatDau")
    private Instant ngayBatDau;
    @Column(name = "ngayKetThuc")
    private Instant ngayKetThuc;
    @Column(name = "hoatDong")
    private boolean active;
    @Column(name = "ngayTao")
    private Instant ngayTao;
    @Column(name = "ngayCapNhat")
    private Instant ngayCapNhat;
    @Column(name = "nguoiTao")
    private String nguoiTao;
    @Column(name = "nguoiCapNhat")
    private String nguoiCapNhat;

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
        this.ngayTao = Instant.now();
    }

    @PreUpdate
    public void handleBeforeUpdate() {
        this.ngayCapNhat = Instant.now();
    }
} 