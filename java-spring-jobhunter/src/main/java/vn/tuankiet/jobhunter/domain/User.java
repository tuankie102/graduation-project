package vn.tuankiet.jobhunter.domain;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import vn.tuankiet.jobhunter.util.SecurityUtil;
import vn.tuankiet.jobhunter.util.constant.GenderEnum;

@Entity
@Table(name = "NGUOIDUNG")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maNguoiDung")
    private long id;

    @Column(name = "ten")
    private String name;

    @NotBlank(message = "email không được để trống")
    @Column(name = "email")
    private String email;

    @NotBlank(message = "matKhau không được để trống")
    @Column(name = "matKhau")
    private String password;

    @Column(name = "tuoi")
    private int age;

    @Enumerated(EnumType.STRING)
    @Column(name = "gioiTinh")
    private GenderEnum gender;

    @Column(name = "diaChi")
    private String address;

    @Column(name = "refreshToken", columnDefinition = "MEDIUMTEXT")
    private String refreshToken;

    @Column(name = "ngayTao")
    private Instant createdAt;
    @Column(name = "ngayCapNhat")
    private Instant updatedAt;
    @Column(name = "nguoiTao")
    private String createdBy;
    @Column(name = "nguoiCapNhat")
    private String updatedBy;

    @ManyToOne
    @JoinColumn(name = "maCongTy")
    private Company company;

    @ManyToOne
    @JoinColumn(name = "maVaiTro")
    private Role role;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Post> posts;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
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
