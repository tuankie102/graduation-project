package vn.tuankiet.jobhunter.domain;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;
import vn.tuankiet.jobhunter.util.SecurityUtil;
import vn.tuankiet.jobhunter.util.constant.LevelEnum;

@Entity
@Table(name = "CONGVIEC")
@Getter
@Setter
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maCongViec")
    private long id;

    @NotBlank(message = "name không được để trống")
    @Column(name = "ten")
    private String name;

    @NotBlank(message = "location không được để trống")
    @Column(name = "viTri")
    private String location;

    @Column(name = "luongCoBan")
    private double salary;

    @Column(name = "soLuong")
    private int quantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "capDo")
    private LevelEnum level;

    @Column(name = "moTa", columnDefinition = "MEDIUMTEXT")
    private String description;

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

    @ManyToOne
    @JoinColumn(name = "maCongTy")
    private Company company;

    @ManyToMany(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "jobs" })
    @JoinTable(name = "CHITIETCONGVIEC", joinColumns = @JoinColumn(name = "maCongViec"), inverseJoinColumns = @JoinColumn(name = "maKyNang"))
    private List<Skill> skills;

    @OneToMany(mappedBy = "job", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Post> posts;

    @PrePersist
    public void handleBeforeCreate() {
        this.createdAt = Instant.now();
        this.createdBy = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
    }

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedAt = Instant.now();
        this.updatedBy = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
    }
}
