package vn.tuankiet.jobhunter.service;

import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.TimeZone;
import java.util.UUID;
import java.util.ArrayList;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import vn.tuankiet.jobhunter.domain.Company;
import vn.tuankiet.jobhunter.domain.User;
import vn.tuankiet.jobhunter.domain.request.ReqDepositDTO;
import vn.tuankiet.jobhunter.domain.response.ResultPaginationDTO;
import vn.tuankiet.jobhunter.repository.CompanyRepository;
import vn.tuankiet.jobhunter.repository.UserRepository;
import vn.tuankiet.jobhunter.util.constant.PaymentStatusEnum;
import vn.tuankiet.jobhunter.util.constant.TransactionTypeEnum;
import vn.tuankiet.jobhunter.domain.Transaction;
import vn.tuankiet.jobhunter.repository.TransactionRepository;




@Service
public class PaymentService {

    @Value("${tuankiet.vnpay.tmn-code}")
    private String vnp_TmnCode;

    @Value("${tuankiet.vnpay.hash-secret}")
    private String secretKey;

    @Value("${tuankiet.vnpay.vnp-return-url}")
    private String vnp_ReturnUrl;

    @Value("${tuankiet.vnpay.vnp-url}")
    private String vnp_PayUrl;


    private UserRepository userRepository;
    private TransactionRepository transactionRepository;

    PaymentService(UserRepository userRepository, TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    public String createPayment(double amount, User user, String ip ) {
        try {
            final String uuid = UUID.randomUUID().toString().replace("-", "");
            String vnp_TxnRef = uuid;
            String vnp_IpAddr = ip;
            
            // Tạo transaction record
            Transaction transaction = new Transaction();
            transaction.setPaymentRef(vnp_TxnRef);
            transaction.setPaymentStatus(PaymentStatusEnum.UNPAID);
            transaction.setTransactionType(TransactionTypeEnum.DEPOSIT);
            transaction.setAmount(amount);
            transaction.setUser(user);
            transactionRepository.save(transaction);

            String paymentUrl = this.generateVNPayURL(amount, vnp_TxnRef, vnp_IpAddr);
            
            return paymentUrl;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public void updateTransactionStatus(String paymentRef, PaymentStatusEnum status) {
        Optional<Transaction> transactionOptional = transactionRepository.findByPaymentRef(paymentRef);
        if (transactionOptional.isPresent()) {
            Transaction transaction = transactionOptional.get();
            transaction.setPaymentStatus(status);
            
            // Nếu thanh toán thành công, cập nhật số dư user
            if (status == PaymentStatusEnum.SUCCESS) {
                User user = transaction.getUser();
                user.setBalance(user.getBalance() + transaction.getAmount());
                userRepository.save(user);
            }

            transactionRepository.save(transaction);
        }
    }

    public String generateVNPayURL(double doubleAmount, String paymentRef, String ip)
            throws UnsupportedEncodingException {

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";

        long amount = (long) (doubleAmount * 100);

        String vnp_TxnRef = paymentRef;
        String vnp_IpAddr = ip;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");

        // if (bankCode != null && !bankCode.isEmpty()) {
        // vnp_Params.put("vnp_BankCode", bankCode);
        // }
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);

        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<String>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = hmacSHA512(secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnp_PayUrl + "?" + queryUrl;

        return paymentUrl;
    }

    public static String hmacSHA512(final String key, final String data) {
        try {

            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();

        } catch (Exception ex) {
            return "";
        }
    }

}
