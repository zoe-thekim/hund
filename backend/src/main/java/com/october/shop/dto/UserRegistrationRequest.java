package com.october.shop.dto;

import com.october.shop.model.Address;
import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class UserRegistrationRequest {

    @NotBlank(message = "이름은 필수입니다.")
    @Size(max = 100, message = "이름은 100자를 초과할 수 없습니다.")
    private String name;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Size(max = 255, message = "이메일은 255자를 초과할 수 없습니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, max = 255, message = "비밀번호는 8자 이상이어야 합니다.")
    private String password;

    @NotBlank(message = "휴대폰 번호는 필수입니다.")
    @Pattern(regexp = "^010-\\d{4}-\\d{4}$", message = "올바른 휴대폰 번호 형식이 아닙니다.")
    private String phoneNumber;

    private Address address;

    @AssertTrue(message = "이용약관에 동의해야 합니다.")
    private Boolean agreeToTerms;

    @AssertTrue(message = "개인정보 수집 및 이용에 동의해야 합니다.")
    private Boolean agreeToPrivacy;

    private Boolean agreeToMarketing = false;
}
