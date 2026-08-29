/**
 * Secured Rooftop Archive style contract: a moonstone delegate dossier moves from information to profile,
 * then review and receipt, with optional attachments protected by a constrained server-side storage handoff.
 */
import { FormEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { CinematicBackground } from "@/components/CinematicBackground";
import { ConferenceHeader } from "@/components/ConferenceHeader";
import { ConferenceFooter } from "@/components/ConferenceFooter";
import { CINEMATIC_ASSETS } from "@/game/assets";
import { trpc } from "@/lib/trpc";
import { LOCAL_COMMITTEES, localCommitteeFromSearch } from "@shared/registration";
import { getContribution } from "@/data/conferencePricing";
import "@/styles/conference.css";
import "@/styles/motion.css";
import "@/styles/rooftop-chase-pages.css";
import "@/styles/cinematic-polish.css";
import "@/styles/rooftop-chase-refinement.css";
import "@/styles/route-world-overhaul.css";
import "@/styles/registration-flow.css";
import "@/styles/registration-cinematic-refinement.css";
import "@/styles/registration-review-receipt.css";
import "@/styles/registration-attachments.css";
import "@/styles/registration-polish.css";
import "@/styles/registration-depth.css";
import "@/styles/registration-refresh.css";
import "@/styles/registration-contrast-fix.css";
import "@/styles/registration-homeworld.css";
import "@/styles/conference-navigation.css";
import "@/styles/mobile-layout.css";
import "@/styles/registration-final-fixes.css";
import "@/styles/mobile-final-fixes.css";
import "@/styles/layout-system.css";
import "@/styles/mobile-overhaul.css";

const lcs = LOCAL_COMMITTEES;
const departments = ["IM — Information Management", "F&L — Finance & Legalities", "TM — Talent Management", "OGV — Outgoing Global Volunteer", "IGV — Incoming Global Volunteer", "OGT — Outgoing Global Talent", "IGT — Incoming Global Talent", "BD — Business Development", "MKT — Marketing", "Other"];
const photoTypes = ["image/jpeg", "image/png", "image/webp"];
const identityTypes = ["image/jpeg", "image/png", "application/pdf"];
const phoneCountries = [
  ["+216", "Tunisia"], ["+33", "France"], ["+49", "Germany"], ["+39", "Italy"], ["+34", "Spain"], ["+44", "United Kingdom"], ["+1", "United States / Canada"], ["+20", "Egypt"], ["+212", "Morocco"], ["+213", "Algeria"], ["+971", "United Arab Emirates"], ["+90", "Türkiye"], ["+", "International / other"],
] as const;

type Nationality = "" | "Tunisian";
type Track = "" | "MMB" | "EB";
type Position = "" | "Manager" | "Team Leader" | "LCVP" | "LCP";
type FormState = { firstName: string; lastName: string; cin: string; lc: string; phoneCountry: string; phone: string; email: string; nationality: Nationality; track: Track; position: Position; singleRoom: boolean; department: string; allergies: string; note: string; indemnitySignature: string; indemnityAccepted: boolean; };
type Errors = Partial<Record<keyof FormState, string>>;
type RegistrationStage = 1 | 2 | 3 | 4 | "receipt";
type AttachmentKey = "photo" | "cv" | "identity";
type AttachmentState = { file: File; name: string; size: number } | null;
type UploadedDocuments = { photo?: { name: string; url: string }; cv?: { name: string; url: string }; identity?: { name: string; url: string } };
type Receipt = { form: FormState; price: number; currency: string; contributionNote: string; documents: UploadedDocuments; reference: string; recordedAt: string };

const initial: FormState = { firstName: "", lastName: "", cin: "", lc: "", phoneCountry: "+216", phone: "", email: "", nationality: "Tunisian", track: "", position: "", singleRoom: false, department: "", allergies: "", note: "", indemnitySignature: "", indemnityAccepted: false };
const informationFields: Array<keyof FormState> = ["firstName", "lastName", "cin", "lc", "phoneCountry", "phone", "email"];
const participationFields: Array<keyof FormState> = ["track", "position", "department", "allergies", "note"];

function contribution(form: Pick<FormState, "nationality" | "track" | "singleRoom">) {
  return getContribution(form.nationality, form.track, form.singleRoom);
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 1 : 2)} MB`;
}

function digitsOnly(value: string, maxLength?: number) {
  const digits = value.replace(/\D/g, "");
  return maxLength ? digits.slice(0, maxLength) : digits;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The selected file could not be read."));
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("The selected file could not be read."));
    reader.readAsDataURL(file);
  });
}

export default function Register() {
  const isEmbedded = new URLSearchParams(window.location.search).get("embed") === "1";
  const [form, setForm] = useState<FormState>(() => ({ ...initial, lc: localCommitteeFromSearch(window.location.search, "") }));
  const [otherDepartment, setOtherDepartment] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "upload" | "error">("idle");
  const [stage, setStage] = useState<RegistrationStage>(1);
  const [attachments, setAttachments] = useState<Record<AttachmentKey, AttachmentState>>({ photo: null, cv: null, identity: null });
  const [attachmentErrors, setAttachmentErrors] = useState<Partial<Record<AttachmentKey, string>>>({});
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [documents, setDocuments] = useState<UploadedDocuments | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const signatureDrawingRef = useRef(false);
  const [signatureReady, setSignatureReady] = useState(false);
  useEffect(() => {
    if (stage !== 3) return;
    const canvas = signatureCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#e7b764";
    if (!form.indemnitySignature.startsWith("data:image/")) return;
    const image = new Image();
    image.onload = () => context.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.src = form.indemnitySignature;
    setSignatureReady(true);
  }, [stage]);
  const uploadDocuments = trpc.registration.uploadDocuments.useMutation();
  const submitRegistration = trpc.registration.submit.useMutation();
  const recordLeaderboard = trpc.registration.record.useMutation();
  const fee = useMemo(() => contribution(form), [form.nationality, form.track, form.singleRoom]);
  const stageNumber = stage === "receipt" ? 4 : stage;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const validate = (fields: Array<keyof FormState>) => {
    const next: Errors = {};
    if (fields.includes("firstName") && !form.firstName.trim()) next.firstName = "First name is required.";
    if (fields.includes("lastName") && !form.lastName.trim()) next.lastName = "Last name is required.";
    if (fields.includes("cin") && !/^\d+$/.test(form.cin.trim())) next.cin = form.cin.trim() ? "CIN number must contain digits only." : "CIN number is required.";
    if (fields.includes("lc") && !form.lc) next.lc = "Select a local committee.";
    if (fields.includes("phoneCountry") && !form.phoneCountry) next.phoneCountry = "Select a country code.";
    if (fields.includes("phone") && !/^\d{8}$/.test(form.phone.trim())) next.phone = "Phone number must contain exactly 8 digits.";
    if (fields.includes("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(form.email.trim())) next.email = "Use a valid email address.";
    if (fields.includes("nationality") && !form.nationality) next.nationality = "Select your nationality.";
    if (fields.includes("track") && !form.track) next.track = "Select your conference track.";
    if (fields.includes("position") && !form.position) next.position = "Select a position.";
    if (fields.includes("department") && form.position !== "LCP" && (!form.department || (form.department === "Other" && !otherDepartment.trim()))) next.department = "Select or enter a department.";
    if (fields.includes("allergies") && !form.allergies.trim()) next.allergies = "Enter none if you have no allergies or dietary concerns.";
    if (fields.includes("note") && !form.note.trim()) next.note = "Enter none if you have no additional note.";
    if (fields.includes("indemnitySignature") && !form.indemnitySignature.trim()) next.indemnitySignature = "Draw your virtual signature before continuing.";
    if (fields.includes("indemnityAccepted") && !form.indemnityAccepted) next.indemnityAccepted = "You must accept the indemnity agreement.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const goTo = (nextStage: 1 | 2 | 3 | 4) => { setErrors({}); setStatus("idle"); setStage(nextStage); };
  const continueToParticipation = () => { if (validate(informationFields)) goTo(2); };
  const validateAttachments = () => {
    const next: Partial<Record<AttachmentKey, string>> = {};
    if (!attachments.identity) next.identity = "CIN or passport upload is required.";
    if (!attachments.photo) next.photo = "Profile photo is required.";
    if (!attachments.cv) next.cv = "CV / résumé is required.";
    setAttachmentErrors(next);
    return Object.keys(next).length === 0;
  };
  const continueToSignature = () => { const fields = form.position === "LCP" ? participationFields.filter((field) => field !== "department") : participationFields; if (validate(fields) && validateAttachments()) goTo(3); };
  const getSignaturePoint = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * (canvas.width / bounds.width), y: (event.clientY - bounds.top) * (canvas.height / bounds.height) };
  };
  const startSignature = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    const point = getSignaturePoint(event);
    if (!canvas || !point) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const context = canvas.getContext("2d");
    if (!context) return;
    signatureDrawingRef.current = true;
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#e7b764";
    context.beginPath();
    context.moveTo(point.x, point.y);
  };
  const drawSignature = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!signatureDrawingRef.current) return;
    const point = getSignaturePoint(event);
    const context = signatureCanvasRef.current?.getContext("2d");
    if (!point || !context) return;
    event.preventDefault();
    context.lineTo(point.x, point.y);
    context.stroke();
  };
  const finishSignature = () => {
    if (!signatureDrawingRef.current) return;
    signatureDrawingRef.current = false;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    update("indemnitySignature", canvas.toDataURL("image/png"));
    setSignatureReady(true);
  };
  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
    update("indemnitySignature", "");
    setSignatureReady(false);
  };
  const continueToReview = () => { if (validate(["indemnitySignature", "indemnityAccepted"])) goTo(4); };
  const selectAttachment = (key: AttachmentKey, candidate?: File) => {
    if (!candidate) return;
    const isValid = key === "photo" ? photoTypes.includes(candidate.type) && candidate.size <= 3 * 1024 * 1024 : key === "identity" ? identityTypes.includes(candidate.type) && candidate.size <= 5 * 1024 * 1024 : candidate.type === "application/pdf" && candidate.size <= 15 * 1024 * 1024;
    if (!isValid) {
      setAttachmentErrors((current) => ({ ...current, [key]: key === "photo" ? "Use a JPG, PNG, or WebP image up to 3 MB." : key === "identity" ? "Use a JPG, PNG, or PDF document up to 5 MB." : "Use a PDF CV up to 15 MB." }));
      return;
    }
    setAttachmentErrors((current) => ({ ...current, [key]: undefined }));
    setAttachments((current) => ({ ...current, [key]: { file: candidate, name: candidate.name, size: candidate.size } }));
    setDocuments(null);
  };
  const removeAttachment = (key: AttachmentKey) => {
    setAttachments((current) => ({ ...current, [key]: null }));
    setAttachmentErrors((current) => ({ ...current, [key]: undefined }));
    setDocuments(null);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("idle");
    setSubmissionMessage("");
    if (!validate(informationFields)) { setStage(1); return; }
    const participationValidationFields = form.position === "LCP" ? participationFields.filter((field) => field !== "department") : participationFields;
    if (!validate(participationValidationFields)) { setStage(2); return; }
    if (!validateAttachments()) { setStage(2); return; }
    if (!validate(["indemnitySignature", "indemnityAccepted"])) { setStage(3); return; }
    if (!form.track || !form.position) { setStage(2); return; }
    const track = form.track;
    const position = form.position;
    const selectedDepartment = form.position === "LCP" ? "None" : form.department === "Other" ? otherDepartment.trim() : form.department;
    const selectedFee = contribution(form);
    if (!selectedFee) { setStage(2); return; }
    setStatus("sending");
    let nextDocuments = documents;
    if (!nextDocuments && (attachments.photo || attachments.cv || attachments.identity)) {
      try {
        const [photoData, cvData, identityData] = await Promise.all([
          attachments.photo ? readFileAsDataUrl(attachments.photo.file) : Promise.resolve(undefined),
          attachments.cv ? readFileAsDataUrl(attachments.cv.file) : Promise.resolve(undefined),
          attachments.identity ? readFileAsDataUrl(attachments.identity.file) : Promise.resolve(undefined),
        ]);
        nextDocuments = await uploadDocuments.mutateAsync({
          photo: attachments.photo && photoData ? { name: attachments.photo.name, mimeType: attachments.photo.file.type, dataUrl: photoData } : undefined,
          cv: attachments.cv && cvData ? { name: attachments.cv.name, mimeType: attachments.cv.file.type, dataUrl: cvData } : undefined,
          identity: attachments.identity && identityData ? { name: attachments.identity.name, mimeType: attachments.identity.file.type, dataUrl: identityData } : undefined,
        });
        setDocuments(nextDocuments);
      } catch {
        setStatus("upload");
        return;
      }
    }
    try {
      const confirmation = await submitRegistration.mutateAsync({ ...form, department: selectedDepartment, nationality: "Tunisian", track, position, price: selectedFee.price, currency: selectedFee.currency, photoUrl: nextDocuments?.photo?.url ?? "", photoName: nextDocuments?.photo?.name ?? "", cvUrl: nextDocuments?.cv?.url ?? "", cvName: nextDocuments?.cv?.name ?? "", identityUrl: nextDocuments?.identity?.url ?? "", identityName: nextDocuments?.identity?.name ?? "" });
      const receiptDocuments = confirmation.documents ?? nextDocuments ?? {};
      try {
        await recordLeaderboard.mutateAsync({ lc: form.lc, email: form.email });
      } catch {
        // The organiser endpoint has already accepted the record; a later successful submission can repair a transient leaderboard sync failure.
      }
      setReceipt({ form: { ...form, department: selectedDepartment }, price: selectedFee.price, currency: selectedFee.currency, contributionNote: selectedFee.note, documents: receiptDocuments, reference: `LL26-${String(Date.now()).slice(-6)}`, recordedAt: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) });
      setStage("receipt");
    } catch (error) {
      setSubmissionMessage("Registration not submitted.");
      setStatus("error");
    }
  };
  const error = (key: keyof FormState) => errors[key] ? <small className="field-error" role="alert">{errors[key]}</small> : null;
  const progressClass = (value: 1 | 2 | 3 | 4) => stageNumber === value ? "is-active" : stageNumber > value ? "is-complete" : "";
  const heading = stage === "receipt" ? "Registration receipt" : stage === 1 ? "Basic information" : stage === 2 ? "Participation details" : stage === 3 ? "Indemnity signature" : "Review your dossier";

  return (
    <main className="registration-site chase-route chase-register cinematic-world-root">
      <CinematicBackground tone="dossier" />
      <div className="route-entry-wipe" aria-hidden="true" />
      <div className="route-pressure-lines" aria-hidden="true"><i /><i /><i /></div>
      <div className="dossier-relic-route" aria-hidden="true"><i /></div>
      <div className="register-backdrop" style={{ backgroundImage: `url(${CINEMATIC_ASSETS.thynaRooftopBackground})` }} aria-hidden="true" />
      <div className="register-rails" aria-hidden="true"><i /><i /></div>
      <img className="register-courier" src={CINEMATIC_ASSETS.courierGrab} alt="" aria-hidden="true" />
      <div className="register-relic-trace" aria-hidden="true"><i /></div>
      {isEmbedded ? <header className="register-header"><button type="button" className="back-link" onClick={() => window.parent.postMessage({ type: "lead-lead-registration-close" }, window.location.origin)}>← CLOSE REGISTRATION</button><div className="register-event-brand"><img src="/manus-storage/lead-lead-2k26-emblem_777efc54.png" alt="Lead & Lead 2K26 conference logo" /><span>LEAD &amp; LEAD <small>2K26 CONFERENCE</small></span></div></header> : <ConferenceHeader current="register" />}
      <div className="register-layout">
        <aside className="dossier-intro"><p className="eyebrow">CHAPTER VI / DELEGATE DOSSIER</p><h1>{stage === "receipt" ? "The record is sealed." : "Answer the call."}</h1><dl><div><dt>STARTS</dt><dd>10 September 2026</dd></div><div><dt>DURATION</dt><dd>{form.track ? `${form.track} · ${form.track === "MMB" ? "3" : "4"} days` : "MMB · 3 days / EB · 4 days"}</dd></div><div><dt>HOST</dt><dd>LC Thyna</dd></div><div><dt>VENUE</dt><dd>Amir Palace</dd></div></dl></aside>
        <section className="dossier-panel" aria-labelledby="registration-title">
          <div className="dossier-heading"><p>{stage === "receipt" ? "DELEGATE RECEIPT / RECORD CONFIRMED" : `REGISTRATION RECORD / STEP ${stage} OF 4`}</p><h2 id="registration-title">{heading}</h2><span /></div>
          {stage !== "receipt" && <div className="dossier-progress" aria-label={`Registration step ${stage} of 4`}><span className={progressClass(1)}><b>01</b><i>Information</i></span><em /><span className={progressClass(2)}><b>02</b><i>Participation</i></span><em /><span className={progressClass(3)}><b>03</b><i>Signature</i></span><em /><span className={progressClass(4)}><b>04</b><i>Review</i></span></div>}
          {stage === "receipt" && receipt ? <section className="registration-receipt" aria-live="polite"><div className="receipt-seal">✓</div><p className="receipt-kicker">REGISTRATION RECEIVED</p><h3>Thank you, {receipt.form.firstName}.</h3><p className="receipt-copy">Your registration was submitted successfully.</p><div className="receipt-reference"><span>REFERENCE</span><strong>{receipt.reference}</strong></div><button className="bronze-button receipt-home" type="button" onClick={() => isEmbedded ? window.parent.postMessage({ type: "lead-lead-registration-close" }, window.location.origin) : window.location.assign("/home")}>{isEmbedded ? "CLOSE REGISTRATION" : "RETURN TO THE GATHERING"} <b>→</b></button></section> : <form onSubmit={submit} noValidate>
            {stage === 1 && <div className="registration-step registration-step--information"><p className="step-intro">Use your official details so the organising team can identify your registration.</p><div className="form-grid two"><label>First name<input value={form.firstName} onChange={(event) => update("firstName", event.target.value)} placeholder="Foulen" required aria-invalid={Boolean(errors.firstName)} />{error("firstName")}</label><label>Last name<input value={form.lastName} onChange={(event) => update("lastName", event.target.value)} placeholder="Fouléni" required aria-invalid={Boolean(errors.lastName)} />{error("lastName")}</label></div><div className="form-grid two"><label>CIN number<input value={form.cin} onChange={(event) => update("cin", digitsOnly(event.target.value))} placeholder="Enter your CIN number" required inputMode="numeric" pattern="[0-9]*" aria-invalid={Boolean(errors.cin)} />{error("cin")}</label><label>Local committee<select required value={form.lc} onChange={(event) => update("lc", event.target.value)}><option value="">Select your LC</option>{lcs.map((lc) => <option key={lc}>{lc}</option>)}</select>{error("lc")}</label></div><div className="form-grid two"><label>Country code<select value={form.phoneCountry} onChange={(event) => update("phoneCountry", event.target.value)} required aria-invalid={Boolean(errors.phoneCountry)}>{phoneCountries.map(([code, country]) => <option value={code} key={`${code}-${country}`}>{code} · {country}</option>)}</select>{error("phoneCountry")}</label><label>Phone number<input value={form.phone} onChange={(event) => update("phone", digitsOnly(event.target.value, 8))} placeholder="55555555" inputMode="tel" required maxLength={8} pattern="[0-9]{8}" aria-invalid={Boolean(errors.phone)} />{error("phone")}</label><label>Email<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="foulen.fouleni@mail.com" autoComplete="email" required aria-invalid={Boolean(errors.email)} />{error("email")}</label></div><button className="bronze-button submit-button" type="button" onClick={continueToParticipation}>CONTINUE <b>→</b></button></div>}
            {stage === 2 && <div className="registration-step registration-step--participation"><p className="step-intro">Select your participation package and complete the delegate record.</p>{fee ? <div className="contribution-card"><p>YOUR CONTRIBUTION</p><strong>{fee.price} <small>{fee.currency}</small></strong><span>{fee.note} Payment is not collected through this page.</span></div> : <div className="contribution-card contribution-card--pending"><p>CONTRIBUTION</p><span>Select a track to reveal your contribution.</span></div>}<div className="form-grid two"><label>Track<select required value={form.track} onChange={(event) => { const track = event.target.value as Track; setForm((current) => ({ ...current, track, position: "" })); }} aria-invalid={Boolean(errors.track)}><option value="">Select track</option><option>MMB</option><option>EB</option></select>{error("track")}</label><label>Position<select required value={form.position} onChange={(event) => update("position", event.target.value as Position)} aria-invalid={Boolean(errors.position)} disabled={!form.track}><option value="">Select position</option>{(form.track === "EB" ? ["LCVP", "LCP"] : form.track === "MMB" ? ["Manager", "Team Leader"] : []).map((position) => <option key={position}>{position}</option>)}</select>{error("position")}</label></div>{form.nationality && form.track && <label className="single-room-option"><input type="checkbox" checked={form.singleRoom} onChange={(event) => update("singleRoom", event.target.checked)} /><span><strong>Single room</strong><small>+{form.track === "MMB" ? 100 : 150} TND</small></span></label>}{form.position !== "LCP" && <div className="department-fields"><label>Department<select required value={form.department} onChange={(event) => { update("department", event.target.value); if (event.target.value !== "Other") setOtherDepartment(""); }} aria-invalid={Boolean(errors.department)}><option value="">Select your department</option>{departments.map((department) => <option key={department}>{department}</option>)}</select>{error("department")}</label>{form.department === "Other" && <label>Department name<input value={otherDepartment} onChange={(event) => setOtherDepartment(event.target.value)} placeholder="Write your department" required /></label>}</div>}<div className="attachment-grid"><label className="attachment-field attachment-field--identity">CIN / passport <small>Required · JPG, PNG, or PDF · max 5 MB</small><input type="file" accept="image/jpeg,image/png,application/pdf,.pdf" required onChange={(event) => selectAttachment("identity", event.target.files?.[0])} />{attachments.identity && <strong>{attachments.identity.name}<button type="button" onClick={() => removeAttachment("identity")}>REMOVE</button></strong>}{attachmentErrors.identity && <small className="field-error" role="alert">{attachmentErrors.identity}</small>}</label><label className="attachment-field">Profile photo <small>Required · JPG, PNG, or WebP · max 3 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => selectAttachment("photo", event.target.files?.[0])} />{attachments.photo && <strong>{attachments.photo.name}<button type="button" onClick={() => removeAttachment("photo")}>REMOVE</button></strong>}{attachmentErrors.photo && <small className="field-error" role="alert">{attachmentErrors.photo}</small>}</label><label className="attachment-field">CV / résumé <small>Required · PDF · max 15 MB</small><input type="file" accept="application/pdf,.pdf" required onChange={(event) => selectAttachment("cv", event.target.files?.[0])} />{attachments.cv && <strong>{attachments.cv.name}<button type="button" onClick={() => removeAttachment("cv")}>REMOVE</button></strong>}{attachmentErrors.cv && <small className="field-error" role="alert">{attachmentErrors.cv}</small>}</label></div><label>Allergies <small>Required · enter “None” if not applicable</small><textarea value={form.allergies} onChange={(event) => update("allergies", event.target.value)} rows={3} placeholder="List allergies or dietary concerns, or enter None" required aria-invalid={Boolean(errors.allergies)} />{error("allergies")}</label><label>Additional note <small>Required · enter “None” if not applicable</small><textarea value={form.note} onChange={(event) => update("note", event.target.value)} rows={3} placeholder="Add a note for the organising team, or enter None" required aria-invalid={Boolean(errors.note)} />{error("note")}</label><div className="registration-actions"><button className="step-back-button" type="button" onClick={() => goTo(1)}>← BACK</button><button className="bronze-button" type="button" onClick={continueToSignature}>SIGNATURE <b>→</b></button></div></div>}
            {stage === 3 && <div className="registration-step registration-step--signature"><p className="step-intro">Confirm the event indemnity before reviewing your registration.</p><div className="indemnity-card"><p className="eyebrow">INDEMNITY SIGNATURE</p><h3>Respect the gathering.</h3><p>I, {form.firstName || "the undersigned"}, agree that I will not bring alcohol or any other prohibited substances or items to Lead &amp; Lead 2K26.</p><div className="signature-field"><div className="signature-field__header"><label htmlFor="virtual-signature">Draw your signature below</label><button className="signature-clear" type="button" onClick={clearSignature} disabled={!signatureReady}>CLEAR</button></div><canvas id="virtual-signature" ref={signatureCanvasRef} className="virtual-signature" width={1200} height={300} onPointerDown={startSignature} onPointerMove={drawSignature} onPointerUp={finishSignature} onPointerCancel={finishSignature} onPointerLeave={finishSignature} role="img" aria-label="Draw your indemnity signature" />{error("indemnitySignature")}</div><label className="indemnity-consent"><input type="checkbox" checked={form.indemnityAccepted} onChange={(event) => update("indemnityAccepted", event.target.checked)} required aria-invalid={Boolean(errors.indemnityAccepted)} /><span>I agree to this indemnity statement.</span></label>{error("indemnityAccepted")}<div className="registration-actions"><button className="step-back-button" type="button" onClick={() => goTo(2)}>← BACK</button><button className="bronze-button" type="button" onClick={continueToReview}>REVIEW <b>→</b></button></div></div></div>}
            {stage === 4 && <div className="registration-step registration-review"><p className="step-intro">Review your information before submitting it. A receipt appears only after the registration sheet confirms your record.</p><div className="review-grid"><section className="review-section"><h4>Delegate</h4><p>{form.firstName} {form.lastName}</p><p>{form.lc}</p><p>{form.email}</p></section><section className="review-section"><h4>Participation</h4><p>{form.nationality || "Nationality pending"} / {form.track || "Track pending"} / {form.position || "Position pending"}</p><p>{form.position === "LCP" ? "None" : form.department === "Other" ? otherDepartment || "Department pending" : form.department || "Department pending"}</p><p>{form.singleRoom ? `Single room · +${form.track === "MMB" ? 100 : 150} TND` : "Shared room"}</p><p>Virtual indemnity signature captured</p></section></div><div className="registration-actions"><button className="step-back-button" type="button" onClick={() => goTo(3)}>← BACK</button><button className="bronze-button" disabled={status === "sending" || uploadDocuments.isPending || submitRegistration.isPending} type="submit">{status === "sending" || uploadDocuments.isPending || submitRegistration.isPending ? "RECORDING…" : "SUBMIT REGISTRATION"}<b>→</b></button></div>{status === "sending" && <p className="form-status" role="status">Saving your registration. Please keep this page open.</p>}{status === "upload" && <p className="form-status error" role="alert">Error: registration not submitted.</p>}{status === "error" && <p className="form-status error" role="alert">Error: registration not submitted.</p>}</div>}
          </form>}
        </section>
      </div>
      {!isEmbedded && <ConferenceFooter />}
    </main>
  );
}
