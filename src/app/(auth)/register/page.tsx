"use client";

import React, { useState } from "react";
import Link from "next/link";
import { INDIAN_STATES } from "@/lib/constants";
import { isValidEmail, isValidMobile } from "@/lib/utils";
import { useBranding } from "@/context/BrandingContext";

interface RegisterFormData {
  fullName: string;
  businessName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
  agreeTerms: boolean;
}

const initialFormData: RegisterFormData = {
  fullName: "",
  businessName: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  state: "",
  city: "",
  pincode: "",
  address: "",
  agreeTerms: false,
};

export default function RegisterPage() {
  const { branding } = useBranding();
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<{
    userId: string;
    username: string;
    fullName: string;
  } | null>(null);

  const validateField = (name: keyof RegisterFormData, value: string | boolean) => {
    let error = "";

    switch (name) {
      case "fullName":
        if (typeof value === "string" && !value.trim()) {
          error = "Full name is required";
        }
        break;
      case "businessName":
        if (typeof value === "string" && !value.trim()) {
          error = "Business or shop name is required";
        }
        break;
      case "email":
        if (typeof value === "string") {
          if (!value.trim()) error = "Email address is required";
          else if (!isValidEmail(value.trim())) error = "Enter a valid email address";
        }
        break;
      case "mobile":
        if (typeof value === "string") {
          if (!value.trim()) error = "10-digit mobile number is required";
          else if (!isValidMobile(value.trim())) error = "Must be a valid 10-digit Indian mobile (starts with 6-9)";
        }
        break;
      case "password":
        if (typeof value === "string") {
          if (!value) error = "Password is required";
          else if (value.length < 8) error = "Password must be at least 8 characters";
          else if (!/[A-Z]/.test(value) || !/[0-9]/.test(value)) error = "Include at least one uppercase letter and one number";
        }
        break;
      case "confirmPassword":
        if (typeof value === "string") {
          if (!value) error = "Please confirm your password";
          else if (value !== formData.password) error = "Passwords do not match";
        }
        break;
      case "state":
        if (typeof value === "string" && !value) {
          error = "Please select your state";
        }
        break;
      case "city":
        if (typeof value === "string" && !value.trim()) {
          error = "City is required";
        }
        break;
      case "pincode":
        if (typeof value === "string") {
          if (!value.trim()) error = "Pincode is required";
          else if (!/^\d{6}$/.test(value.trim())) error = "Must be a 6-digit PIN code";
        }
        break;
      case "address":
        if (typeof value === "string" && !value.trim()) {
          error = "Street/Shop address is required";
        }
        break;
      case "agreeTerms":
        if (value !== true) {
          error = "You must accept the terms and conditions";
        }
        break;
    }

    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[name] = error;
      else delete next[name];
      return next;
    });

    return !error;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    validateField(name as keyof RegisterFormData, val);

    // If password changed, re-validate confirm password if filled
    if (name === "password" && formData.confirmPassword) {
      if (val !== formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.confirmPassword;
          return next;
        });
      }
    }
  };

  const validateAll = () => {
    let isValid = true;
    (Object.keys(formData) as Array<keyof RegisterFormData>).forEach((field) => {
      const pass = validateField(field, formData[field]);
      if (!pass) isValid = false;
    });
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    if (!validateAll()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          businessName: formData.businessName.trim(),
          email: formData.email.trim(),
          mobile: formData.mobile.trim(),
          username: formData.mobile.trim(), // auto-derived from mobile number
          password: formData.password,
          state: formData.state,
          city: formData.city.trim(),
          pincode: formData.pincode.trim(),
          address: formData.address.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setRegisteredUser({
        userId: data.user?.userId || "Generated",
        username: formData.mobile,
        fullName: formData.fullName,
      });
      setIsLoading(false);
    } catch (err: unknown) {
      console.error("Register error:", err);
      setServerError("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isSuccess && registeredUser) {
    return (
      <div className="card shadow-xl border border-gray-200/80 p-6 sm:p-8 bg-white text-center animate-fadeIn">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Registration Submitted!</h2>
        <p className="text-sm text-gray-600 mt-2">
          Thank you for applying to join the {branding?.appName || "Recharge Pro"} Retailer network, <span className="font-semibold text-gray-800">{registeredUser.fullName}</span>.
        </p>

        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 my-6 text-left">
          <div className="text-xs uppercase tracking-wider font-semibold text-blue-800 mb-2">
            Application Details
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Retailer ID:</span>
              <span className="font-mono font-semibold text-navy-800">{registeredUser.userId}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Login ID (Mobile):</span>
              <span className="font-medium text-gray-800">{registeredUser.username}</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-blue-100">
              <span className="text-gray-500 block text-xs">Account Status:</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Active &bull; Float ₹25,000 Credited
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Your merchant account is automatically approved with a simulated starter float of ₹25,000. You can immediately proceed to login and test mobile recharges, BBPS utility bills, and DMT remittance.
        </p>

        <Link href="/login" className="btn-primary w-full py-2.5">
          Proceed to Login &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="card shadow-xl border border-gray-200/80 p-6 sm:p-8 bg-white">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Retailer Registration
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Join {branding?.appName || "Recharge Pro"} to start offering recharges, utility bill payments & AEPS
        </p>
      </div>

      {serverError && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2.5 animate-fadeIn">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="leading-snug">{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Personal & Business Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="label">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              disabled={isLoading}
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Ramesh Kumar"
              className={`input-field ${errors.fullName ? "border-red-400" : ""}`}
            />
            {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="businessName" className="label">
              Shop / Business Name <span className="text-red-500">*</span>
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              disabled={isLoading}
              value={formData.businessName}
              onChange={handleChange}
              placeholder="e.g. Ramesh Telecom"
              className={`input-field ${errors.businessName ? "border-red-400" : ""}`}
            />
            {errors.businessName && <p className="text-xs text-red-600 mt-1">{errors.businessName}</p>}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="label">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              disabled={isLoading}
              value={formData.email}
              onChange={handleChange}
              placeholder="ramesh@gmail.com"
              className={`input-field ${errors.email ? "border-red-400" : ""}`}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="mobile" className="label">
              Mobile Number (10 digits) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-medium text-gray-500">
                +91
              </span>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                maxLength={10}
                disabled={isLoading}
                value={formData.mobile}
                onChange={handleChange}
                placeholder="9876543210"
                className={`input-field pl-12 ${errors.mobile ? "border-red-400" : ""}`}
              />
            </div>
            {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
          </div>
        </div>

        {/* Password & Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="label">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 chars, 1 uppercase, 1 digit"
                className={`input-field pr-10 ${errors.password ? "border-red-400" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                disabled={isLoading}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-type password"
                className={`input-field pr-10 ${errors.confirmPassword ? "border-red-400" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* State, City & Pincode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="state" className="label">
              State <span className="text-red-500">*</span>
            </label>
            <select
              id="state"
              name="state"
              disabled={isLoading}
              value={formData.state}
              onChange={handleChange}
              className={`select-field ${errors.state ? "border-red-400" : ""}`}
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
          </div>

          <div>
            <label htmlFor="city" className="label">
              City <span className="text-red-500">*</span>
            </label>
            <input
              id="city"
              name="city"
              type="text"
              disabled={isLoading}
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Pune"
              className={`input-field ${errors.city ? "border-red-400" : ""}`}
            />
            {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="pincode" className="label">
              PIN Code <span className="text-red-500">*</span>
            </label>
            <input
              id="pincode"
              name="pincode"
              type="text"
              maxLength={6}
              disabled={isLoading}
              value={formData.pincode}
              onChange={handleChange}
              placeholder="411001"
              className={`input-field ${errors.pincode ? "border-red-400" : ""}`}
            />
            {errors.pincode && <p className="text-xs text-red-600 mt-1">{errors.pincode}</p>}
          </div>
        </div>

        {/* Full Address */}
        <div>
          <label htmlFor="address" className="label">
            Shop / Business Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            rows={2}
            disabled={isLoading}
            value={formData.address}
            onChange={handleChange}
            placeholder="Shop No. 12, Main Market Road, Near Post Office"
            className={`input-field resize-none ${errors.address ? "border-red-400" : ""}`}
          />
          {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
        </div>

        {/* Terms checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-0.5 w-4 h-4 rounded text-navy-500 border-gray-300 focus:ring-navy-500 cursor-pointer shrink-0"
            />
            <span>
              I agree to the{" "}
              <span className="text-navy-600 font-semibold underline">Terms of Service</span>,{" "}
              <span className="text-navy-600 font-semibold underline">Privacy Policy</span>, and agree
              to provide valid KYC documents upon request.
            </span>
          </label>
          {errors.agreeTerms && <p className="text-xs text-red-600 mt-1">{errors.agreeTerms}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-2.5 text-base shadow-md mt-4"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </>
          ) : (
            "Register as Retailer"
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-navy-600 font-semibold hover:text-navy-700 hover:underline transition-colors"
          >
            Sign In to your account
          </Link>
        </p>
      </div>
    </div>
  );
}
