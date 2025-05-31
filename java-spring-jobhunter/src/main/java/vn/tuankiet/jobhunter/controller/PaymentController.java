package vn.tuankiet.jobhunter.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import jakarta.validation.Valid;
import vn.tuankiet.jobhunter.domain.User;
import vn.tuankiet.jobhunter.domain.request.ReqDepositDTO;
import vn.tuankiet.jobhunter.repository.UserRepository;
import vn.tuankiet.jobhunter.service.PaymentService;
import vn.tuankiet.jobhunter.service.UserService;
import vn.tuankiet.jobhunter.util.SecurityUtil;
import vn.tuankiet.jobhunter.util.annotation.ApiMessage;
import vn.tuankiet.jobhunter.util.constant.PaymentStatusEnum;
import vn.tuankiet.jobhunter.util.error.IdInvalidException;




@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private PaymentService paymentService;
    private UserService userService;
    private SecurityUtil securityUtil;
    @Value("${tuankiet.frontend-url}")
    private String frontendUrl;


    PaymentController(PaymentService paymentService, UserService userService, SecurityUtil securityUtil) {
        this.paymentService = paymentService;
        this.userService = userService;
        this.securityUtil = securityUtil;
    }

    @PostMapping("/deposit")
    @ApiMessage("Create a payment")
    public ResponseEntity<?> createPayment(
        @RequestBody @Valid ReqDepositDTO reqDepositDTO
    ) throws IdInvalidException {
        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get() : "";
        if (email.equals("")) {
            throw new IdInvalidException("Access Token không hợp lệ");
        }

        Double amount = reqDepositDTO.getAmount();
        User user = userService.fetchUserByEmail(email);
        String ip = securityUtil.getCurrentUserIp();
            
        String vnpayUrl = paymentService.createPayment(amount, user, ip);
        HashMap<String, String> res = new HashMap<>();
        res.put("paymentUrl", vnpayUrl);
        res.put("balance", String.valueOf(user.getBalance()));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/return")
    public ResponseEntity<?> paymentReturn(
        @RequestParam("vnp_ResponseCode") Optional<String> vnpayResponseCode,
        @RequestParam("vnp_TxnRef") Optional<String> paymentRef,
        @RequestParam("vnp_Amount") Optional<String> amount,
        HttpServletResponse response
    ) throws IdInvalidException, IOException {
        if (vnpayResponseCode.isPresent() && paymentRef.isPresent()) {
            // thanh toán qua VNPAY, cập nhật trạng thái transaction
            PaymentStatusEnum paymentStatus = null; 
            if (vnpayResponseCode.get().equals("00")) {
                paymentStatus = PaymentStatusEnum.SUCCESS;
                response.sendRedirect(frontendUrl + "?payment=success");
            } else {
                paymentStatus = PaymentStatusEnum.FAILED;
                response.sendRedirect(frontendUrl + "?payment=failed");
            }
            this.paymentService.updateTransactionStatus(paymentRef.get(), paymentStatus);
        }
        return null;
    }
}
