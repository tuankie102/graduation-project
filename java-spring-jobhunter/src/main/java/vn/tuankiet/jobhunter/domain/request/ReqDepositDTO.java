package vn.tuankiet.jobhunter.domain.request;


import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReqDepositDTO {

    @NotNull(message = "Amount is required")
    private double amount;
}
