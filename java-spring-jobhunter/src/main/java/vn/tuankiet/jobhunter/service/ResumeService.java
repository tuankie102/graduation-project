package vn.tuankiet.jobhunter.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.turkraft.springfilter.builder.FilterBuilder;
import com.turkraft.springfilter.converter.FilterSpecification;
import com.turkraft.springfilter.converter.FilterSpecificationConverter;
import com.turkraft.springfilter.parser.FilterParser;
import com.turkraft.springfilter.parser.node.FilterNode;

import vn.tuankiet.jobhunter.domain.Post;
import vn.tuankiet.jobhunter.domain.Resume;
import vn.tuankiet.jobhunter.domain.User;
import vn.tuankiet.jobhunter.domain.response.ResultPaginationDTO;
import vn.tuankiet.jobhunter.domain.response.email.ResEmailResume;
import vn.tuankiet.jobhunter.domain.response.resume.ResCreateResumeDTO;
import vn.tuankiet.jobhunter.domain.response.resume.ResFetchResumeDTO;
import vn.tuankiet.jobhunter.domain.response.resume.ResUpdateResumeDTO;
import vn.tuankiet.jobhunter.repository.PostRepository;
import vn.tuankiet.jobhunter.repository.ResumeRepository;
import vn.tuankiet.jobhunter.repository.UserRepository;
import vn.tuankiet.jobhunter.util.SecurityUtil;

@Service
public class ResumeService {
    @Autowired
    FilterBuilder fb;

    @Autowired
    private FilterParser filterParser;

    @Autowired
    private FilterSpecificationConverter filterSpecificationConverter;

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public ResumeService(
            ResumeRepository resumeRepository,
            UserRepository userRepository,
            PostRepository postRepository) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    public Optional<Resume> fetchById(long id) {
        return this.resumeRepository.findById(id);
    }

    public boolean checkResumeExistByUserAndPost(Resume resume) {
        // check user by id
        if (resume.getUser() == null) {
			return false;
		}
        Optional<User> userOptional = this.userRepository.findById(resume.getUser().getId());
        // check job by id
        if (userOptional.isEmpty() || (resume.getPost() == null)) {
			return false;
		}
        Optional<Post> postOptional = this.postRepository.findById(resume.getPost().getId());
        if (postOptional.isEmpty()) {
			return false;
		}

        return true;
    }

    public ResCreateResumeDTO create(Resume resume) {
        resume = this.resumeRepository.save(resume);

        ResCreateResumeDTO res = new ResCreateResumeDTO();
        res.setId(resume.getId());
        res.setCreatedBy(resume.getCreatedBy());
        res.setCreatedAt(resume.getCreatedAt());

        return res;
    }

    public ResUpdateResumeDTO update(Resume resume) {
        resume = this.resumeRepository.save(resume);
        ResUpdateResumeDTO res = new ResUpdateResumeDTO();
        res.setUpdatedAt(resume.getUpdatedAt());
        res.setUpdatedBy(resume.getUpdatedBy());
        return res;
    }

    public void delete(long id) {
        this.resumeRepository.deleteById(id);
    }

    public ResFetchResumeDTO getResume(Resume resume) {
        ResFetchResumeDTO res = new ResFetchResumeDTO();
        res.setId(resume.getId());
        res.setEmail(resume.getEmail());
        res.setUrl(resume.getUrl());
        res.setStatus(resume.getStatus());
        res.setCreatedAt(resume.getCreatedAt());
        res.setCreatedBy(resume.getCreatedBy());
        res.setUpdatedAt(resume.getUpdatedAt());
        res.setUpdatedBy(resume.getUpdatedBy());

        if (resume.getPost() != null) {
            res.setCompanyName(resume.getPost().getJob().getCompany().getName());
            res.setJobName(resume.getPost().getJob().getName());
        }

        res.setUser(new ResFetchResumeDTO.UserResume(resume.getUser().getId(), resume.getUser().getName()));
        res.setPost(new ResFetchResumeDTO.PostResume(resume.getPost().getId(), resume.getPost().getTitle()));

        return res;
    }

    public ResultPaginationDTO fetchAllResume(Specification<Resume> spec, Pageable pageable) {
        Page<Resume> pageUser = this.resumeRepository.findAll(spec, pageable);
        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());

        mt.setPages(pageUser.getTotalPages());
        mt.setTotal(pageUser.getTotalElements());

        rs.setMeta(mt);

        // remove sensitive data
        List<ResFetchResumeDTO> listResume = pageUser.getContent()
                .stream().map(item -> this.getResume(item))
                .collect(Collectors.toList());

        rs.setResult(listResume);

        return rs;
    }

    public ResultPaginationDTO fetchResumeByUser(Pageable pageable) {
        // query builder
        String email = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        FilterNode node = filterParser.parse("email='" + email + "'");
        FilterSpecification<Resume> spec = filterSpecificationConverter.convert(node);
        Page<Resume> pageResume = this.resumeRepository.findAll(spec, pageable);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());

        mt.setPages(pageResume.getTotalPages());
        mt.setTotal(pageResume.getTotalElements());

        rs.setMeta(mt);

        // remove sensitive data
        List<ResFetchResumeDTO> listResume = pageResume.getContent()
                .stream().map(item -> this.getResume(item))
                .collect(Collectors.toList());

        rs.setResult(listResume);

        return rs;
    }

    public ResEmailResume convertResumeToSendEmail(Resume resume, String message) {
        ResEmailResume res = new ResEmailResume();
        res.setJob(new ResEmailResume.JobEmail(resume.getPost().getJob().getName(), new ResEmailResume.CompanyEmail(resume.getPost().getJob().getCompany().getName())));
        res.setStatus(resume.getStatus().toString());
        res.setEmail(resume.getUser().getEmail());
        res.setMessage(message);
        return res;
    }
}
