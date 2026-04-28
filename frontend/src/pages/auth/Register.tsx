import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { authAPI, getAuthTokenFromResponse } from "../../api";
import useStore from "../../store/useStore";

// Daum postcode service type definition
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          zonecode: string;
          address: string;
          addressType: string;
          userSelectedType: string;
          noSelected: string;
          userLanguageType: string;
          roadAddress: string;
          jibunAddress: string;
          buildingName: string;
          apartment: string;
          autoRoadAddress: string;
          autoJibunAddress: string;
          sido: string;
          sigungu: string;
          bname: string;
          roadname: string;
        }) => void;
        onresize?: (size: { width: number; height: number }) => void;
        width?: string;
        height?: string;
      }) => {
        open: () => void;
      };
    };
  }
}

interface FormData {
  // Step 1
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  // Step 2
  phoneNumber: string;
  postalCode: string;
  address: string;
  detailAddress: string;
  // Step 3 - Terms Agreement
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToMarketing: boolean;
}

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,16}$/;

export default function Register() {
  const navigate = useNavigate();
  const login = useStore((state) => state.login);

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phoneNumber: "",
    postalCode: "",
    address: "",
    detailAddress: "",
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToMarketing: false,
  });

  const isPasswordValid = PASSWORD_REGEX.test(formData.password);
  const passwordMatch = formData.password === formData.passwordConfirm && formData.password !== "";
  const isStep1Valid = formData.name && formData.email && isPasswordValid && passwordMatch;
  const isStep2Valid = Boolean(formData.phoneNumber.trim());
  const isStep3Valid = formData.agreeToTerms && formData.agreeToPrivacy;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        setFormData((prev) => ({
          ...prev,
          postalCode: data.zonecode,
          address: data.address,
        }));
      }
    }).open();
  };

  const handleStep1Submit = (e: FormEvent) => {
    console.log("Step 1 submitted, isStep1Valid:", isStep1Valid);
    e.preventDefault();
    setErrorMessage("");

    if (isStep1Valid) {
      setStep(2);
      console.log("Moving to step 2");
    } else {
      console.log("Step 1 validation failed");
    }
  };

  const handleStep2Submit = () => {
    console.log("Step 2 submitted");
    setErrorMessage("");
    if (!isStep2Valid) {
      setErrorMessage("Phone number is required.");
      return;
    }
    setStep(3);
    console.log("Moving to step 3");
  };

  const handleStep3Submit = () => {
    console.log("Step 3 submitted, isStep3Valid:", isStep3Valid);
    if (isStep3Valid) {
      setStep(4);
      console.log("Moving to step 4");
    } else {
      console.log("Step 3 validation failed");
    }
  };

  const handleFinalSubmit = async () => {
    console.log("handleFinalSubmit called");
    setErrorMessage("");
    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phoneNumber: formData.phoneNumber.trim(),
      address: {
        postalCode: formData.postalCode.trim() || null,
        address: formData.address.trim() || null,
        detailAddress: formData.detailAddress.trim() || null
      },
      agreeToTerms: formData.agreeToTerms,
      agreeToPrivacy: formData.agreeToPrivacy,
      agreeToMarketing: formData.agreeToMarketing,
    };

    console.log("Registration request payload:", payload);

    try {
      const registerResponse = await authAPI.register(payload);
      console.log("Registration response:", registerResponse);

      const registerData = registerResponse?.data ?? {};
      let userToLogin = registerData.user ?? registerData.data ?? null;
      let token = getAuthTokenFromResponse(registerResponse);

      if (!token || !userToLogin) {
        const loginResponse = await authAPI.login(formData.email.trim(), formData.password);
        const loginData = loginResponse?.data ?? {};
        userToLogin = loginData.user ?? {
          email: formData.email.trim(),
          name: formData.name.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          address: {
            postalCode: formData.postalCode.trim(),
            address: formData.address.trim(),
            detailAddress: formData.detailAddress.trim()
          }
        };
        token = getAuthTokenFromResponse(loginResponse) ?? token;
      }

      if (!token) {
        setErrorMessage("Could not complete sign in because the session token was not issued.");
        return;
      }

      login(userToLogin, token, true);
      navigate("/mypage");
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error?.response?.data);
      const status = error?.response?.status;
      const errorMessage = error?.response?.data?.message || error?.response?.data;

      if (status === 409) {
        setErrorMessage("This email is already registered.");
        setStep(1);
      } else if (status === 400) {
        setErrorMessage(typeof errorMessage === 'string' ? errorMessage : "Please check your input details.");
      } else {
        setErrorMessage("Registration failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-md">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-colors ${
                  step >= stepNum
                    ? "bg-black text-white"
                    : "bg-white border border-black/20 text-black/40"
                }`}
              >
                {step > stepNum ? <Check size={18} /> : stepNum}
              </div>
              {stepNum < 4 && (
                <div
                  className={`w-8 h-px transition-colors ${
                    step > stepNum ? "bg-black" : "bg-black/20"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-light text-black mb-2">
                Create Account
              </h1>
              <p className="text-sm text-black/50">
                Start your hund journey
              </p>
            </div>

            <form onSubmit={handleStep1Submit} className="flex flex-col gap-5 mb-8">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-black tracking-wide uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full h-12 px-4 bg-white border border-black/20 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-black tracking-wide uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full h-12 pl-9 pr-4 bg-white border border-black/20 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-black tracking-wide uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="English, numbers & symbols (8-16 chars)"
                    className="w-full h-12 pl-9 pr-10 bg-white border border-black/20 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="flex items-center gap-2 mt-1">
                    {isPasswordValid ? (
                      <div className="flex items-center gap-1 text-xs text-green-700">
                        <Check size={14} />
                        Valid password
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-red-700">
                        <X size={14} />
                        Must have English, number & symbol (8-16)
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Password Confirm */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-black tracking-wide uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none"
                  />
                  <input
                    type={showPasswordConfirm ? "text" : "password"}
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full h-12 pl-9 pr-10 bg-white border border-black/20 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPasswordConfirm ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                {formData.passwordConfirm && (
                  <div className="flex items-center gap-2 mt-1">
                    {passwordMatch ? (
                      <div className="flex items-center gap-1 text-xs text-green-700">
                        <Check size={14} />
                        Passwords match
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-red-700">
                        <X size={14} />
                        Passwords don't match
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!isStep1Valid}
                className="h-12 bg-black text-white text-sm font-medium tracking-wide uppercase hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-4"
              >
                Next
              </button>
              {errorMessage ? (
                <p className="text-xs text-center text-red-700">{errorMessage}</p>
              ) : null}
            </form>

            <p className="text-center text-sm text-black/60">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-black font-medium hover:opacity-70 transition-opacity"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* Step 2: Additional Info */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-light text-black mb-2">
                Additional Information
              </h1>
              <p className="text-sm text-black/50">
                Phone number is required
              </p>
            </div>

            <div className="flex flex-col gap-5 mb-8">
              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-black tracking-wide uppercase">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none"
                  />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="010-1234-5678"
                    className="w-full h-12 pl-9 pr-4 bg-white border border-black/20 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-black tracking-wide uppercase">
                  Address
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="Postal code"
                    className="w-1/3 h-12 px-4 bg-white border border-black/20 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={openDaumPostcode}
                    className="flex-1 h-12 border border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
                  >
                    Search Address
                  </button>
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  className="w-full h-12 px-4 bg-white border border-black/20 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                  readOnly
                />
                <input
                  type="text"
                  name="detailAddress"
                  value={formData.detailAddress}
                  onChange={handleInputChange}
                  placeholder="Unit / apartment / landmark"
                  className="w-full h-12 px-4 bg-white border border-black/20 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 h-12 border border-black text-black text-sm font-medium tracking-wide uppercase hover:bg-black hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleStep2Submit}
                disabled={!isStep2Valid}
                className="flex-1 h-12 bg-black text-white text-sm font-medium tracking-wide uppercase hover:bg-black/80 transition-colors"
              >
                Next
              </button>
            </div>
            {errorMessage ? (
              <p className="text-xs text-center text-red-700 mt-4">{errorMessage}</p>
            ) : null}
          </div>
        )}

        {/* Step 3: Terms Agreement */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-light text-black mb-2">
                Terms & Conditions
              </h1>
              <p className="text-sm text-black/50">
                Please agree to continue
              </p>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              {/* Terms of Service */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 accent-black"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-black/80">
                  <span className="text-red-500">*</span> I agree to the Terms of Service
                </label>
              </div>

              {/* Privacy Policy */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToPrivacy"
                  name="agreeToPrivacy"
                  checked={formData.agreeToPrivacy}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 accent-black"
                />
                <label htmlFor="agreeToPrivacy" className="text-sm text-black/80">
                  <span className="text-red-500">*</span> I agree to the Privacy Policy
                </label>
              </div>

              {/* Marketing Agreement */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToMarketing"
                  name="agreeToMarketing"
                  checked={formData.agreeToMarketing}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 accent-black"
                />
                <label htmlFor="agreeToMarketing" className="text-sm text-black/80">
                  Receive marketing emails (optional)
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 h-12 border border-black text-black text-sm font-medium tracking-wide uppercase hover:bg-black hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleStep3Submit}
                disabled={!isStep3Valid}
                className="flex-1 h-12 bg-black text-white text-sm font-medium tracking-wide uppercase hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Agree & Continue
              </button>
            </div>
            {errorMessage ? (
              <p className="text-xs text-center text-red-700 mt-4">{errorMessage}</p>
            ) : null}
          </div>
        )}

        {/* Step 4: Completion */}
        {step === 4 && (
          <div>
            <div className="text-center mb-12">
              <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-6">
                <Check size={32} />
              </div>
              <h1 className="text-3xl font-light text-black mb-3">
                Welcome to PAWHAUS!
              </h1>
              <p className="text-sm text-black/60">
                Your account has been successfully created. Let's get started!
              </p>
              <p className="text-sm text-red-600 mt-4">
                DEBUG: loading={loading.toString()}, step={step}
              </p>
            </div>

            <div className="flex flex-col gap-3 mb-8">
              <button
                onClick={() => {
                  console.log("Step 4 button clicked");
                  handleFinalSubmit();
                }}
                disabled={loading}
                className="h-12 bg-red-600 text-white text-sm font-medium tracking-wide uppercase hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ zIndex: 999, position: 'relative' }}
              >
                {loading ? "Signing in..." : "CLICK ME - Sign In & Continue"}
              </button>

              <button
                onClick={() => {
                  console.log("Test button clicked");
                }}
                className="h-12 bg-blue-600 text-white text-sm font-medium"
              >
                TEST BUTTON
              </button>

              <Link
                to="/"
                className="h-12 border border-black text-black text-sm font-medium tracking-wide uppercase hover:bg-black hover:text-white transition-colors flex items-center justify-center"
              >
                Go to Home
              </Link>
            </div>
            {errorMessage ? (
              <p className="text-xs text-center text-red-700 mb-4">{errorMessage}</p>
            ) : null}

            <p className="text-center text-xs text-black/40">
              You can sign in anytime with your email and password
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
