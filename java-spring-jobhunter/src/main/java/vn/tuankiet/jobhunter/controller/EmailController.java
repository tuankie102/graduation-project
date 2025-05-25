package vn.tuankiet.jobhunter.controller;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.tuankiet.jobhunter.domain.Company;
import vn.tuankiet.jobhunter.domain.Job;
import vn.tuankiet.jobhunter.domain.Resume;
import vn.tuankiet.jobhunter.domain.Skill;
import vn.tuankiet.jobhunter.domain.response.email.ResEmailJob;
import vn.tuankiet.jobhunter.service.EmailService;
import vn.tuankiet.jobhunter.service.SubscriberService;
import vn.tuankiet.jobhunter.util.annotation.ApiMessage;
import vn.tuankiet.jobhunter.util.constant.LevelEnum;

@RestController
@RequestMapping("/api/v1")
public class EmailController {

    private final EmailService emailService;
    private final SubscriberService subscriberService;

    public EmailController(EmailService emailService,
            SubscriberService subscriberService) {
        this.emailService = emailService;
        this.subscriberService = subscriberService;
    }

    @GetMapping("/email")
    @ApiMessage("Send simple email")
    // @Scheduled(cron = "*/30 * * * * *")
    // @Transactional
    public String sendSimpleEmail() {
        //test job 1
        Job job1 = new Job();
        job1.setName("Software Engineer");
        job1.setLocation("Ho Chi Minh City");
        job1.setSalary(1500);
        job1.setQuantity(2);
        job1.setLevel(LevelEnum.SENIOR);
        job1.setDescription("Looking for experienced software engineer");
        job1.setActive(true);
        Company company1 = new Company();
        company1.setName("Google");
        company1.setAddress("Mountain View, CA");
        company1.setDescription("Leading technology company");
        job1.setCompany(company1);
        List<Skill> skills1 = Arrays.asList(
            createSkill("Java"),
            createSkill("Python"),
            createSkill("C++")
        );
        job1.setSkills(skills1);

        //test job 2
        Job job2 = new Job();
        job2.setName("Frontend Developer");
        job2.setLocation("Ha Noi");
        job2.setSalary(1200);
        job2.setQuantity(3);
        job2.setLevel(LevelEnum.JUNIOR);
        job2.setDescription("Looking for junior frontend developer");
        job2.setActive(true);
        Company company2 = new Company();
        company2.setName("Facebook");
        company2.setAddress("Ha Noi, VN"); 
        company2.setDescription("Leading social media company");
        job2.setCompany(company2);
        List<Skill> skills2 = Arrays.asList(
            createSkill("React"),
            createSkill("JavaScript"),
            createSkill("HTML/CSS")
        );
        job2.setSkills(skills2);

        //test danh sách jobs
        List<Job> jobs = Arrays.asList(job1, job2);
        List<ResEmailJob> resEmailJobs = jobs.stream().map(
            job -> this.subscriberService.convertJobToSendEmail(job)).collect(Collectors.toList());

        //send email with list jobs
        this.emailService.sendEmailFromTemplateSync("kietboi51@gmail.com", "test send email", "job", "kiet", "jobs", resEmailJobs);
        return "ok";
    }

    @PostMapping("/email/resume-status")
    @ApiMessage("Send resume status notification email")
    public String sendResumeStatusEmail(@RequestBody Resume resume) {
        if (resume.getUser() == null || resume.getUser().getEmail() == null) {
            return "User email not found";
        }

        String subject = "Your Resume Status Update - " + resume.getPost().getJob().getName();
        this.emailService.sendEmailFromTemplateSync(
            resume.getUser().getEmail(),
            subject,
            "resume",
            resume.getUser().getName(),
            "resume",
            resume
        );
        return "Email sent successfully";
    }

    private Skill createSkill(String name) {
        Skill skill = new Skill();
        skill.setName(name);
        skill.setCreatedAt(Instant.now());
        skill.setUpdatedAt(Instant.now());
        skill.setCreatedBy("kiet");
        skill.setUpdatedBy("kiet");
        return skill;
    }
}
