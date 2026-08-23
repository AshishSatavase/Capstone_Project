"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";

type DematChoice = "existing" | "need";

type Nominee = {
  id: number;
  name: string;
  relationship: string;
  dob: string;
  percentage: string;
};

type FormState = {
  fullName: string;
  mobile: string;
  email: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  occupation: string;
  annualIncome: string;
  addNominee: boolean;
  nominees: Nominee[];
  bankName: string;
  accountNumber: string;
  ifsc: string;
  accountType: string;
  bankStatement: string;
  pan: string;
  aadhaar: string;
  addressProof: string;
  idProof: string;
  dematChoice: DematChoice;
  dpId: string;
  clientId: string;
  depository: string;
  terms: boolean;
  risk: boolean;
  accuracy: boolean;
};

const emptyNominee = (): Nominee => ({
  id: Date.now() + Math.random(),
  name: "",
  relationship: "",
  dob: "",
  percentage: "100",
});

const initialState: FormState = {
  fullName: "",
  mobile: "",
  email: "",
  dob: "",
  gender: "",
  address: "",
  city: "",
  state: "",
  pin: "",
  occupation: "",
  annualIncome: "",
  addNominee: true,
  nominees: [emptyNominee()],
  bankName: "",
  accountNumber: "",
  ifsc: "",
  accountType: "Savings",
  bankStatement: "",
  pan: "",
  aadhaar: "",
  addressProof: "",
  idProof: "",
  dematChoice: "existing",
  dpId: "",
  clientId: "",
  depository: "CDSL",
  terms: false,
  risk: false,
  accuracy: false,
};

const stepLabels = ["Personal Details", "Bank Account", "KYC", "Demat", "Agreements"];

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(initialState);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateNominee = (id: number, key: keyof Omit<Nominee, "id">, value: string) => {
    setForm((prev) => ({
      ...prev,
      nominees: prev.nominees.map((nominee) =>
        nominee.id === id ? { ...nominee, [key]: value } : nominee,
      ),
    }));
  };

  const canAdvance = () => {
    if (step === 0) {
      const nomineeValid =
        form.nominees.length > 0 &&
        form.nominees.every(
          (nominee) =>
            nominee.name &&
            nominee.relationship &&
            nominee.dob &&
            nominee.percentage,
        );

      return Boolean(
        form.fullName &&
          form.mobile &&
          form.email &&
          form.dob &&
          form.gender &&
          form.address &&
          form.city &&
          form.state &&
          form.pin &&
          form.occupation &&
          form.annualIncome &&
          nomineeValid,
      );
    }

    if (step === 1) {
      return Boolean(
        form.bankName &&
          form.accountNumber &&
          form.ifsc &&
          form.accountType,
      );
    }

    if (step === 2) {
      return Boolean(
        form.pan &&
          form.aadhaar,
      );
    }

    if (step === 3) {
      if (form.dematChoice === "existing") {
        return Boolean(form.dpId && form.clientId && form.depository);
      }
      return true;
    }

    return form.terms && form.risk && form.accuracy;
  };

  const nextStep = () => {
    if (step < stepLabels.length - 1 && canAdvance()) {
      setStep((current) => current + 1);
    }
  };

  const previousStep = () => {
    if (step > 0) {
      setStep((current) => current - 1);
    }
  };

  const submitApplication = () => {
    if (canAdvance()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-7 w-7 rounded bg-ubs-red" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-header text-muted">
                FI Execution
              </p>
              <p className="text-sm font-bold uppercase tracking-header text-ink">
                New Account
              </p>
            </div>
          </Link>

          <Link
            href="/login"
            className="text-xs font-semibold uppercase tracking-label text-ink transition-colors hover:text-ubs-red"
          >
            Already registered
          </Link>
        </div>

        {!submitted ? (
          <Card className="overflow-hidden border border-border bg-white">
            <div className="border-b border-border bg-[#fafafa] px-6 py-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-label text-muted">
                    Investor onboarding
                  </p>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
                    Open a trading account
                  </h1>
                </div>

                <div className="rounded border border-border bg-white px-3 py-2 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-label text-muted">
                    Step
                  </p>
                  <p className="text-sm font-bold text-ink">
                    {step + 1}/{stepLabels.length}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-2 md:grid-cols-5">
                {stepLabels.map((label, index) => {
                  const active = index === step;
                  const completed = index < step;

                  return (
                    <div
                      key={label}
                      className={[
                        "flex items-center gap-2 rounded border px-3 py-2 text-[10px] font-semibold uppercase tracking-label",
                        active
                          ? "border-ubs-red bg-white text-ink"
                          : completed
                            ? "border-positive/30 bg-positive/5 text-positive"
                            : "border-border bg-white text-muted",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-5 w-5 items-center justify-center rounded-full text-[9px]",
                          active ? "bg-ubs-red text-white" : completed ? "bg-positive text-white" : "bg-border text-muted",
                        ].join(" ")}
                      >
                        {completed ? <Check className="h-3 w-3" /> : index + 1}
                      </span>
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6">
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <p className="text-lg font-bold text-ink">1. Personal Details</p>
                    <p className="mt-1 text-sm text-muted">
                      Please provide your personal information to proceed with account setup.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="mb-3 text-sm font-semibold uppercase tracking-label text-muted">
                        Basic details
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Full name" required value={form.fullName} onChange={(value) => updateField("fullName", value)} placeholder="Enter full name" />
                        <Field label="Mobile number" required type="tel" value={form.mobile} onChange={(value) => updateField("mobile", value.replace(/\D/g, ""))} placeholder="Enter mobile number" inputMode="numeric" pattern="[0-9]*" />
                        <Field label="Email" required type="email" value={form.email} onChange={(value) => updateField("email", value)} placeholder="Enter email address" />
                        <Field label="Date of birth" required type="date" value={form.dob} onChange={(value) => updateField("dob", value)} />
                        <Field label="Gender" required type="select" value={form.gender} onChange={(value) => updateField("gender", value)} options={["", "Male", "Female", "Other"]} placeholder="Select gender" />
                        <div className="md:col-span-2">
                          <Field label="Residential address" required value={form.address} onChange={(value) => updateField("address", value)} placeholder="House no., street, area" />
                        </div>
                        <Field label="City" required value={form.city} onChange={(value) => updateField("city", value)} placeholder="City" />
                        <Field label="State" required value={form.state} onChange={(value) => updateField("state", value)} placeholder="State" />
                        <Field label="PIN code" required type="tel" value={form.pin} onChange={(value) => updateField("pin", value.replace(/\D/g, ""))} placeholder="110001" inputMode="numeric" pattern="[0-9]*" />
                        <Field label="Occupation" required value={form.occupation} onChange={(value) => updateField("occupation", value)} placeholder="Occupation" />
                        <Field label="Annual income range" required value={form.annualIncome} onChange={(value) => updateField("annualIncome", value)} placeholder="e.g. ₹5L – ₹10L" />
                      </div>
                    </div>

                    <div className="rounded border border-border bg-[#fafafa] p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold uppercase tracking-label text-muted">
                          Nomination <span className="text-ubs-red">*</span>
                        </p>
                        <span className="text-xs font-medium text-muted">
                          One nominee is required
                        </span>
                      </div>

                      {form.addNominee && (
                        <div className="space-y-4">
                          {form.nominees.map((nominee, index) => (
                            <div key={nominee.id} className="rounded border border-border bg-white p-4">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-ink">Nominee {index + 1}</p>
                                {form.nominees.length > 1 && (
                                  <button
                                    type="button"
                                    className="text-xs font-semibold text-ubs-red hover:text-[#b20011]"
                                    onClick={() =>
                                      setForm((prev) => ({
                                        ...prev,
                                        nominees: prev.nominees.filter((item) => item.id !== nominee.id),
                                      }))
                                    }
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Nominee name" required value={nominee.name} onChange={(value) => updateNominee(nominee.id, "name", value)} placeholder="Nominee name" />
                                <Field label="Relationship" required value={nominee.relationship} onChange={(value) => updateNominee(nominee.id, "relationship", value)} placeholder="Father / Mother / Spouse" />
                                <Field label="Nominee DOB" required type="date" value={nominee.dob} onChange={(value) => updateNominee(nominee.id, "dob", value)} />
                                <Field label="Nominee percentage" required value={nominee.percentage} onChange={(value) => updateNominee(nominee.id, "percentage", value)} placeholder="25%" />
                              </div>
                            </div>
                          ))}

                          <div>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded border border-dashed border-ink px-3 py-2 text-xs font-semibold uppercase tracking-label text-ink hover:bg-black/[0.02]"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  nominees: [...prev.nominees, emptyNominee()],
                                }))
                              }
                            >
                              Add nominee
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <p className="text-lg font-bold text-ink">Bank account</p>
                    <p className="mt-1 text-sm text-muted">
                      Enter your primary bank account details for settlements and payouts.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Bank name" required value={form.bankName} onChange={(value) => updateField("bankName", value)} placeholder="Bank name" />
                    <Field label="Account number" required value={form.accountNumber} onChange={(value) => updateField("accountNumber", value)} placeholder="Account number" />
                    <Field label="IFSC" required value={form.ifsc} onChange={(value) => updateField("ifsc", value.toUpperCase())} placeholder="ABCD0123456" />
                    <Field label="Account type" required type="select" value={form.accountType} onChange={(value) => updateField("accountType", value)} options={["Savings", "Current", "NRE", "NRO"]} placeholder="Select account type" />
                  </div>

                  <div className="rounded border border-dashed border-border bg-[#fafafa] p-4">
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded border border-border bg-white px-3 py-2 text-sm font-medium text-ink hover:border-ink">
                      <span>Upload bank statement</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          updateField("bankStatement", file ? file.name : "");
                        }}
                      />
                    </label>
                    <p className="mt-2 text-xs text-muted">PDF, JPG or PNG</p>
                    {form.bankStatement && (
                      <p className="mt-2 text-xs text-muted">Selected: {form.bankStatement}</p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <p className="text-lg font-bold text-ink">KYC</p>
                    <p className="mt-1 text-sm text-muted">
                      Upload the documents required for verification.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="PAN" required value={form.pan} onChange={(value) => updateField("pan", value.toUpperCase())} placeholder="PAN number" />
                    <Field label="Aadhaar number / KYC document" required value={form.aadhaar} onChange={(value) => updateField("aadhaar", value)} placeholder="Aadhaar number or document ID" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <UploadProofField
                      label="Address proof"
                      value={form.addressProof}
                      onChange={(value) => updateField("addressProof", value)}
                    />
                    <UploadProofField
                      label="ID proof"
                      value={form.idProof}
                      onChange={(value) => updateField("idProof", value)}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <p className="text-lg font-bold text-ink">Demat account</p>
                    <p className="mt-1 text-sm text-muted">
                      Choose the option that matches your current setup.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => updateField("dematChoice", "existing")}
                      className={[
                        "rounded border p-4 text-left transition-colors",
                        form.dematChoice === "existing"
                          ? "border-ubs-red bg-red-50"
                          : "border-border bg-white hover:border-ink",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={[
                            "flex h-4 w-4 items-center justify-center rounded-full border",
                            form.dematChoice === "existing" ? "border-ubs-red bg-ubs-red" : "border-border bg-white",
                          ].join(" ")}
                        >
                          {form.dematChoice === "existing" && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                        <span className="text-sm font-medium text-ink">
                          I already have a Demat account
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateField("dematChoice", "need")}
                      className={[
                        "rounded border p-4 text-left transition-colors",
                        form.dematChoice === "need"
                          ? "border-ubs-red bg-red-50"
                          : "border-border bg-white hover:border-ink",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={[
                            "flex h-4 w-4 items-center justify-center rounded-full border",
                            form.dematChoice === "need" ? "border-ubs-red bg-ubs-red" : "border-border bg-white",
                          ].join(" ")}
                        >
                          {form.dematChoice === "need" && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                        <span className="text-sm font-medium text-ink">
                          I need a Demat account
                        </span>
                      </div>
                    </button>
                  </div>

                  {form.dematChoice === "existing" ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="DP ID" required value={form.dpId} onChange={(value) => updateField("dpId", value)} placeholder="DP ID" />
                      <Field label="Client ID" required value={form.clientId} onChange={(value) => updateField("clientId", value)} placeholder="Client ID" />
                      <Field label="Depository" required type="select" value={form.depository} onChange={(value) => updateField("depository", value)} options={["CDSL", "NSDL"]} placeholder="Select depository" />
                    </div>
                  ) : (
                    <div className="rounded border border-dashed border-border bg-[#fafafa] p-5">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-ubs-red" />
                        <p className="text-sm font-semibold text-ink">We&apos;ll help you open one.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <p className="text-lg font-bold text-ink">Agreements & Confirmation</p>
                    <p className="mt-1 text-sm text-muted">
                      Review the application and confirm your declarations.
                    </p>
                  </div>

                  <div className="rounded border border-border bg-[#fafafa] p-4">
                    <p className="text-sm font-semibold uppercase tracking-label text-muted">
                      Review your application
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-label text-ink">
                      {stepLabels.map((label) => (
                        <span
                          key={label}
                          className="inline-flex items-center gap-2 rounded border border-border bg-white px-2 py-1"
                        >
                          {label} <Check className="h-3 w-3 text-positive" />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 rounded border border-border bg-white p-4">
                    <p className="text-sm font-semibold uppercase tracking-label text-muted">
                      Legal documents
                    </p>

                    <div className="space-y-2 text-sm text-ink">
                      {[
                        "Terms & Conditions",
                        "Privacy Policy",
                        "Risk disclosure",
                        "Bond/instrument-specific disclosure",
                        "Brokerage/fees",
                        "Other applicable agreements",
                      ].map((item) => (
                        <div key={item}>
                          <a href="#" className="font-medium text-ink underline decoration-dotted underline-offset-4 hover:text-ubs-red">
                            {item}
                          </a>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      <label className="flex items-center gap-3 text-sm text-ink">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-ubs-red"
                          checked={form.terms}
                          onChange={(event) => updateField("terms", event.target.checked)}
                          required
                        />
                        <span>I agree to the Terms & Conditions</span>
                      </label>

                      <label className="flex items-center gap-3 text-sm text-ink">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-ubs-red"
                          checked={form.risk}
                          onChange={(event) => updateField("risk", event.target.checked)}
                          required
                        />
                        <span>I have read and understood the risk disclosures</span>
                      </label>

                      <label className="flex items-center gap-3 text-sm text-ink">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-ubs-red"
                          checked={form.accuracy}
                          onChange={(event) => updateField("accuracy", event.target.checked)}
                          required
                        />
                        <span>I confirm that the information provided is correct</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className={step === 0 ? "invisible" : ""}
                  onClick={previousStep}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>

                {step < stepLabels.length - 1 ? (
                  <Button type="button" onClick={nextStep} disabled={!canAdvance()}>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" onClick={submitApplication} disabled={!canAdvance()}>
                    Submit Application
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="border border-border bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-positive/10 text-positive">
              <Check className="h-8 w-8" />
            </div>
            <p className="text-2xl font-bold text-ink">Application submitted successfully 🎉</p>
            <p className="mt-3 max-w-xl mx-auto text-sm text-muted">
              We&apos;re verifying your details. You&apos;ll be notified when your account is ready.
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Review again
              </Button>
              <Link href="/login">
                <Button>Go to login</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  placeholder,
  onChange,
  required,
  inputMode,
  pattern,
  options,
}: {
  label: string;
  type?: "text" | "email" | "tel" | "date" | "select";
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  options?: string[];
}) {
  if (type === "select") {
    return (
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-label text-muted">
          {label}
          {required && <span className="ml-1 text-ubs-red">*</span>}
        </span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          className="h-10 w-full rounded-sm border border-border bg-white px-2.5 text-sm text-ink outline-none placeholder:text-faint focus:border-ink"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-label text-muted">
        {label}
        {required && <span className="ml-1 text-ubs-red">*</span>}
      </span>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 text-sm"
        required={required}
        inputMode={inputMode}
        pattern={pattern}
      />
    </label>
  );
}

function UploadProofField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-label text-muted">
        {label}
        {required && <span className="ml-1 text-ubs-red">*</span>}
      </span>

      <div className="rounded border border-dashed border-border bg-[#fafafa] p-3">
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded border border-border bg-white px-3 py-2 text-sm font-medium text-ink hover:border-ink">
          <span>{value ? value : "Upload document"}</span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            required={required}
            onChange={(event) => {
              const file = event.target.files?.[0];
              onChange(file ? file.name : "");
            }}
          />
        </label>
        <p className="mt-2 text-xs text-muted">PDF, JPG or PNG</p>
      </div>
    </label>
  );
}
