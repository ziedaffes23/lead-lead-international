/**
 * Secured Rooftop Archive style contract: a moonstone delegate dossier moves from information to profile,
 * then review and receipt, with optional attachments protected by a constrained server-side storage handoff.
 */
import {
  FormEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CinematicBackground } from "@/components/CinematicBackground";
import { ConferenceHeader } from "@/components/ConferenceHeader";
import { ConferenceFooter } from "@/components/ConferenceFooter";
import { CINEMATIC_ASSETS } from "@/game/assets";
import { trpc } from "@/lib/trpc";
import {
  getContribution,
  getSingleRoomSurcharge,
  shouldShowLcName,
} from "@/data/conferencePricing";
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

const departments = [
  "IM — Information Management",
  "F&L — Finance & Legalities",
  "TM — Talent Management",
  "OGV — Outgoing Global Volunteer",
  "IGV — Incoming Global Volunteer",
  "OGT — Outgoing Global Talent",
  "IGT — Incoming Global Talent",
  "BD — Business Development",
  "MKT — Marketing",
  "Other",
];
const photoTypes = ["image/jpeg", "image/png", "image/webp"];
const identityTypes = ["image/jpeg", "image/png", "application/pdf"];
const phoneCountries = [
  ["+93", "Afghanistan"],
  ["+355", "Albania"],
  ["+213", "Algeria"],
  ["+1-684", "American Samoa"],
  ["+376", "Andorra"],
  ["+244", "Angola"],
  ["+1-264", "Anguilla"],
  ["+1-268", "Antigua and Barbuda"],
  ["+54", "Argentina"],
  ["+374", "Armenia"],
  ["+297", "Aruba"],
  ["+61", "Australia"],
  ["+43", "Austria"],
  ["+994", "Azerbaijan"],
  ["+1-242", "Bahamas"],
  ["+973", "Bahrain"],
  ["+880", "Bangladesh"],
  ["+1-246", "Barbados"],
  ["+375", "Belarus"],
  ["+32", "Belgium"],
  ["+501", "Belize"],
  ["+229", "Benin"],
  ["+1-441", "Bermuda"],
  ["+975", "Bhutan"],
  ["+591", "Bolivia"],
  ["+387", "Bosnia and Herzegovina"],
  ["+267", "Botswana"],
  ["+55", "Brazil"],
  ["+246", "British Indian Ocean Territory"],
  ["+1-284", "British Virgin Islands"],
  ["+673", "Brunei"],
  ["+359", "Bulgaria"],
  ["+226", "Burkina Faso"],
  ["+257", "Burundi"],
  ["+238", "Cabo Verde"],
  ["+855", "Cambodia"],
  ["+237", "Cameroon"],
  ["+1", "Canada"],
  ["+1-345", "Cayman Islands"],
  ["+236", "Central African Republic"],
  ["+235", "Chad"],
  ["+56", "Chile"],
  ["+86", "China"],
  ["+57", "Colombia"],
  ["+269", "Comoros"],
  ["+242", "Congo"],
  ["+243", "Congo, Democratic Republic"],
  ["+682", "Cook Islands"],
  ["+506", "Costa Rica"],
  ["+225", "Côte d’Ivoire"],
  ["+385", "Croatia"],
  ["+53", "Cuba"],
  ["+357", "Cyprus"],
  ["+420", "Czechia"],
  ["+45", "Denmark"],
  ["+253", "Djibouti"],
  ["+1-767", "Dominica"],
  ["+1-809", "Dominican Republic"],
  ["+593", "Ecuador"],
  ["+20", "Egypt"],
  ["+503", "El Salvador"],
  ["+240", "Equatorial Guinea"],
  ["+291", "Eritrea"],
  ["+372", "Estonia"],
  ["+268", "Eswatini"],
  ["+251", "Ethiopia"],
  ["+500", "Falkland Islands"],
  ["+298", "Faroe Islands"],
  ["+679", "Fiji"],
  ["+358", "Finland"],
  ["+33", "France"],
  ["+594", "French Guiana"],
  ["+689", "French Polynesia"],
  ["+241", "Gabon"],
  ["+220", "Gambia"],
  ["+995", "Georgia"],
  ["+49", "Germany"],
  ["+233", "Ghana"],
  ["+350", "Gibraltar"],
  ["+30", "Greece"],
  ["+299", "Greenland"],
  ["+1-473", "Grenada"],
  ["+590", "Guadeloupe"],
  ["+1-671", "Guam"],
  ["+502", "Guatemala"],
  ["+44-1481", "Guernsey"],
  ["+224", "Guinea"],
  ["+245", "Guinea-Bissau"],
  ["+592", "Guyana"],
  ["+509", "Haiti"],
  ["+504", "Honduras"],
  ["+852", "Hong Kong"],
  ["+36", "Hungary"],
  ["+354", "Iceland"],
  ["+91", "India"],
  ["+62", "Indonesia"],
  ["+98", "Iran"],
  ["+964", "Iraq"],
  ["+353", "Ireland"],
  ["+44-1624", "Isle of Man"],
  ["+972", "Israel"],
  ["+39", "Italy"],
  ["+1-876", "Jamaica"],
  ["+81", "Japan"],
  ["+44-1534", "Jersey"],
  ["+962", "Jordan"],
  ["+7", "Kazakhstan"],
  ["+254", "Kenya"],
  ["+686", "Kiribati"],
  ["+850", "North Korea"],
  ["+82", "South Korea"],
  ["+965", "Kuwait"],
  ["+996", "Kyrgyzstan"],
  ["+856", "Laos"],
  ["+371", "Latvia"],
  ["+961", "Lebanon"],
  ["+266", "Lesotho"],
  ["+231", "Liberia"],
  ["+218", "Libya"],
  ["+423", "Liechtenstein"],
  ["+370", "Lithuania"],
  ["+352", "Luxembourg"],
  ["+853", "Macao"],
  ["+261", "Madagascar"],
  ["+265", "Malawi"],
  ["+60", "Malaysia"],
  ["+960", "Maldives"],
  ["+223", "Mali"],
  ["+356", "Malta"],
  ["+692", "Marshall Islands"],
  ["+596", "Martinique"],
  ["+222", "Mauritania"],
  ["+230", "Mauritius"],
  ["+52", "Mexico"],
  ["+691", "Micronesia"],
  ["+373", "Moldova"],
  ["+377", "Monaco"],
  ["+976", "Mongolia"],
  ["+382", "Montenegro"],
  ["+1-664", "Montserrat"],
  ["+212", "Morocco"],
  ["+258", "Mozambique"],
  ["+95", "Myanmar"],
  ["+264", "Namibia"],
  ["+674", "Nauru"],
  ["+977", "Nepal"],
  ["+31", "Netherlands"],
  ["+687", "New Caledonia"],
  ["+64", "New Zealand"],
  ["+505", "Nicaragua"],
  ["+227", "Niger"],
  ["+234", "Nigeria"],
  ["+683", "Niue"],
  ["+672", "Norfolk Island"],
  ["+389", "North Macedonia"],
  ["+1-670", "Northern Mariana Islands"],
  ["+47", "Norway"],
  ["+968", "Oman"],
  ["+92", "Pakistan"],
  ["+680", "Palau"],
  ["+970", "Palestine"],
  ["+507", "Panama"],
  ["+675", "Papua New Guinea"],
  ["+595", "Paraguay"],
  ["+51", "Peru"],
  ["+63", "Philippines"],
  ["+48", "Poland"],
  ["+351", "Portugal"],
  ["+1-787", "Puerto Rico"],
  ["+974", "Qatar"],
  ["+262", "Réunion"],
  ["+40", "Romania"],
  ["+7", "Russia"],
  ["+250", "Rwanda"],
  ["+290", "Saint Helena"],
  ["+1-869", "Saint Kitts and Nevis"],
  ["+1-758", "Saint Lucia"],
  ["+508", "Saint Pierre and Miquelon"],
  ["+1-784", "Saint Vincent and the Grenadines"],
  ["+685", "Samoa"],
  ["+378", "San Marino"],
  ["+239", "São Tomé and Príncipe"],
  ["+966", "Saudi Arabia"],
  ["+221", "Senegal"],
  ["+381", "Serbia"],
  ["+248", "Seychelles"],
  ["+232", "Sierra Leone"],
  ["+65", "Singapore"],
  ["+421", "Slovakia"],
  ["+386", "Slovenia"],
  ["+677", "Solomon Islands"],
  ["+252", "Somalia"],
  ["+27", "South Africa"],
  ["+211", "South Sudan"],
  ["+34", "Spain"],
  ["+94", "Sri Lanka"],
  ["+249", "Sudan"],
  ["+597", "Suriname"],
  ["+46", "Sweden"],
  ["+41", "Switzerland"],
  ["+963", "Syria"],
  ["+886", "Taiwan"],
  ["+992", "Tajikistan"],
  ["+255", "Tanzania"],
  ["+66", "Thailand"],
  ["+670", "Timor-Leste"],
  ["+228", "Togo"],
  ["+690", "Tokelau"],
  ["+676", "Tonga"],
  ["+1-868", "Trinidad and Tobago"],
  ["+216", "Tunisia"],
  ["+90", "Türkiye"],
  ["+993", "Turkmenistan"],
  ["+1-649", "Turks and Caicos Islands"],
  ["+688", "Tuvalu"],
  ["+256", "Uganda"],
  ["+380", "Ukraine"],
  ["+971", "United Arab Emirates"],
  ["+44", "United Kingdom"],
  ["+1", "United States"],
  ["+598", "Uruguay"],
  ["+998", "Uzbekistan"],
  ["+678", "Vanuatu"],
  ["+379", "Vatican City"],
  ["+58", "Venezuela"],
  ["+84", "Vietnam"],
  ["+1-340", "U.S. Virgin Islands"],
  ["+681", "Wallis and Futuna"],
  ["+212", "Western Sahara"],
  ["+967", "Yemen"],
  ["+260", "Zambia"],
  ["+263", "Zimbabwe"],
  ["+", "International / other"],
] as const;

type Track = "" | "International AIESECer" | "EP";
type Position =
  | ""
  | "None"
  | "Manager"
  | "Team Leader"
  | "LCVP"
  | "LCP"
  | "MCVP"
  | "MCP";
type FormState = {
  firstName: string;
  lastName: string;
  passportNumber: string;
  gender: "" | "Male" | "Female";
  phoneCountry: string;
  phone: string;
  email: string;
  track: Track;
  position: Position;
  singleRoom: boolean;
  department: string;
  lcName: string;
  entityName: string;
  mcPosition: string;
  countryOfOrigin: string;
  hostingLc: string;
  allergies: string;
  note: string;
  indemnitySignature: string;
  indemnityAccepted: boolean;
};

type Errors = Partial<Record<keyof FormState, string>>;
type RegistrationStage = 1 | 2 | 3 | 4 | "receipt";
type AttachmentKey = "photo" | "cv" | "identity";
type AttachmentState = { file: File; name: string; size: number } | null;
type UploadedDocuments = {
  photo?: { name: string; url: string };
  cv?: { name: string; url: string };
  identity?: { name: string; url: string };
};
type Receipt = {
  form: FormState;
  price: number;
  currency: string;
  contributionNote: string;
  documents: UploadedDocuments;
  reference: string;
  recordedAt: string;
};

const initial: FormState = {
  firstName: "",
  lastName: "",
  passportNumber: "",
  gender: "",
  phoneCountry: "+216",
  phone: "",
  email: "",
  track: "",
  position: "",
  singleRoom: false,
  department: "",
  lcName: "",
  entityName: "",
  mcPosition: "",
  countryOfOrigin: "",
  hostingLc: "",
  allergies: "",
  note: "",
  indemnitySignature: "",
  indemnityAccepted: false,
};
const informationFields: Array<keyof FormState> = [
  "firstName",
  "lastName",
  "passportNumber",
  "gender",
  "phoneCountry",
  "phone",
  "email",
];

function participationFieldsForTrack(track: Track): Array<keyof FormState> {
  return track === "International AIESECer"
    ? [
        "track",
        "position",
        "department",
        "lcName",
        "entityName",
        "mcPosition",
        "allergies",
        "note",
      ]
    : ["track", "countryOfOrigin", "hostingLc", "allergies", "note"];
}

function contribution(
  form: Pick<FormState, "track" | "singleRoom" | "position">
) {
  return getContribution(form.track, form.singleRoom, form.position);
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
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
    reader.onerror = () =>
      reject(new Error("The selected file could not be read."));
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("The selected file could not be read."));
    reader.readAsDataURL(file);
  });
}

export default function Register() {
  const isEmbedded =
    new URLSearchParams(window.location.search).get("embed") === "1";
  const [form, setForm] = useState<FormState>(initial);
  const [otherDepartment, setOtherDepartment] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "upload" | "error">(
    "idle"
  );
  const [stage, setStage] = useState<RegistrationStage>(1);
  const [attachments, setAttachments] = useState<
    Record<AttachmentKey, AttachmentState>
  >({ photo: null, cv: null, identity: null });
  const [attachmentErrors, setAttachmentErrors] = useState<
    Partial<Record<AttachmentKey, string>>
  >({});
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
    image.onload = () =>
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.src = form.indemnitySignature;
    setSignatureReady(true);
  }, [stage]);
  const submitRegistration = trpc.registration.submit.useMutation();
  const fee = useMemo(
    () => contribution(form),
    [form.track, form.singleRoom, form.position]
  );
  const stageNumber = stage === "receipt" ? 4 : stage;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(current => ({ ...current, [key]: value }));
  const validate = (fields: Array<keyof FormState>) => {
    const next: Errors = {};
    if (fields.includes("firstName") && !form.firstName.trim())
      next.firstName = "First name is required.";
    if (fields.includes("lastName") && !form.lastName.trim())
      next.lastName = "Last name is required.";
    if (fields.includes("passportNumber") && !form.passportNumber.trim())
      next.passportNumber = "Passport number is required.";
    if (fields.includes("gender") && !form.gender)
      next.gender = "Select your gender.";
    if (fields.includes("phoneCountry") && !form.phoneCountry)
      next.phoneCountry = "Select a country code.";
    if (fields.includes("phone") && !form.phone.trim())
      next.phone = "Phone number is required.";
    if (
      fields.includes("email") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(form.email.trim())
    )
      next.email = "Use a valid email address.";
    if (fields.includes("track") && !form.track)
      next.track = "Select your participant type.";
    if (
      fields.includes("position") &&
      form.track === "International AIESECer" &&
      !form.position
    )
      next.position = "Select a position.";
    if (
      fields.includes("department") &&
      form.track === "International AIESECer" &&
      (!form.department ||
        (form.department === "Other" && !otherDepartment.trim()))
    )
      next.department = "Select or enter a department.";
    if (
      fields.includes("lcName") &&
      form.track === "International AIESECer" &&
      shouldShowLcName(form.position) &&
      !form.lcName.trim()
    )
      next.lcName = "Enter your LC name.";
    if (
      fields.includes("entityName") &&
      form.track === "International AIESECer" &&
      !form.entityName.trim()
    )
      next.entityName = "Enter your entity name.";
    if (
      fields.includes("mcPosition") &&
      form.track === "International AIESECer" &&
      ["MCVP"].includes(form.position) &&
      !form.mcPosition.trim()
    )
      next.mcPosition = "Enter your MC position.";
    if (
      fields.includes("countryOfOrigin") &&
      form.track === "EP" &&
      !form.countryOfOrigin.trim()
    )
      next.countryOfOrigin = "Enter your country of origin.";
    if (
      fields.includes("hostingLc") &&
      form.track === "EP" &&
      !form.hostingLc.trim()
    )
      next.hostingLc = "Enter the hosting LC.";
    if (fields.includes("allergies") && !form.allergies.trim())
      next.allergies =
        "Enter none if you have no allergies or dietary concerns.";
    if (fields.includes("note") && !form.note.trim())
      next.note = "Enter none if you have no additional note.";
    if (
      fields.includes("indemnitySignature") &&
      !form.indemnitySignature.trim()
    )
      next.indemnitySignature =
        "Draw your virtual signature before continuing.";
    if (fields.includes("indemnityAccepted") && !form.indemnityAccepted)
      next.indemnityAccepted = "You must accept the indemnity agreement.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const goTo = (nextStage: 1 | 2 | 3 | 4) => {
    setErrors({});
    setStatus("idle");
    setStage(nextStage);
  };
  const continueToParticipation = () => {
    if (validate(informationFields)) goTo(2);
  };
  const validateAttachments = () => {
    const next: Partial<Record<AttachmentKey, string>> = {};
    if (!attachments.identity) next.identity = "Passport upload is required.";
    if (!attachments.photo) next.photo = "Profile photo is required.";
    if (!attachments.cv) next.cv = "CV / résumé is required.";
    setAttachmentErrors(next);
    return Object.keys(next).length === 0;
  };
  const continueToSignature = () => {
    if (
      validate(participationFieldsForTrack(form.track)) &&
      validateAttachments()
    )
      goTo(3);
  };
  const getSignaturePoint = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
    };
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
  const continueToReview = () => {
    if (validate(["indemnitySignature", "indemnityAccepted"])) goTo(4);
  };
  const selectAttachment = (key: AttachmentKey, candidate?: File) => {
    if (!candidate) return;
    const isValid =
      key === "photo"
        ? photoTypes.includes(candidate.type) &&
          candidate.size <= 3 * 1024 * 1024
        : key === "identity"
          ? identityTypes.includes(candidate.type) &&
            candidate.size <= 5 * 1024 * 1024
          : candidate.type === "application/pdf" &&
            candidate.size <= 5 * 1024 * 1024;
    if (!isValid) {
      setAttachmentErrors(current => ({
        ...current,
        [key]:
          key === "photo"
            ? "Use a JPG, PNG, or WebP image up to 3 MB."
            : key === "identity"
              ? "Use a JPG, PNG, or PDF document up to 5 MB."
              : "Use a PDF CV up to 5 MB.",
      }));
      return;
    }
    setAttachmentErrors(current => ({ ...current, [key]: undefined }));
    setAttachments(current => ({
      ...current,
      [key]: { file: candidate, name: candidate.name, size: candidate.size },
    }));
    setDocuments(null);
  };
  const removeAttachment = (key: AttachmentKey) => {
    setAttachments(current => ({ ...current, [key]: null }));
    setAttachmentErrors(current => ({ ...current, [key]: undefined }));
    setDocuments(null);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("idle");
    setSubmissionMessage("");
    if (!validate(informationFields)) {
      setStage(1);
      return;
    }
    const participationValidationFields = participationFieldsForTrack(
      form.track
    );
    if (!validate(participationValidationFields)) {
      setStage(2);
      return;
    }
    if (!validateAttachments()) {
      setStage(2);
      return;
    }
    if (!validate(["indemnitySignature", "indemnityAccepted"])) {
      setStage(3);
      return;
    }
    if (!form.track) {
      setStage(2);
      return;
    }
    const track = form.track;
    const position: Exclude<Position, ""> =
      track === "EP" ? "None" : (form.position as Exclude<Position, "">);
    const selectedDepartment =
      track === "EP"
        ? "None"
        : form.department === "Other"
          ? otherDepartment.trim()
          : form.department;
    const selectedLcName =
      track === "EP" || !shouldShowLcName(position)
        ? "None"
        : form.lcName.trim();
    const selectedEntityName = track === "EP" ? "None" : form.entityName.trim();
    const selectedMcPosition =
      track === "International AIESECer" &&
      ["MCVP"].includes(position)
        ? form.mcPosition.trim()
        : "None";
    const selectedCountryOfOrigin =
      track === "EP" ? form.countryOfOrigin.trim() : "None";
    const selectedHostingLc = track === "EP" ? form.hostingLc.trim() : "None";
    const selectedFee = getContribution(track, form.singleRoom, position);
    if (!selectedFee) {
      setStage(2);
      return;
    }
    setStatus("sending");
    setSubmissionMessage("");
    let nextDocuments = documents;
    let inlineDocuments = {
      photoDataUrl: "",
      cvDataUrl: "",
      identityDataUrl: "",
    };
    if (attachments.photo || attachments.cv || attachments.identity) {
      try {
        const [photoData, cvData, identityData] = await Promise.all([
          attachments.photo
            ? readFileAsDataUrl(attachments.photo.file)
            : Promise.resolve(undefined),
          attachments.cv
            ? readFileAsDataUrl(attachments.cv.file)
            : Promise.resolve(undefined),
          attachments.identity
            ? readFileAsDataUrl(attachments.identity.file)
            : Promise.resolve(undefined),
        ]);
        inlineDocuments = {
          photoDataUrl: photoData ?? "",
          cvDataUrl: cvData ?? "",
          identityDataUrl: identityData ?? "",
        };
      } catch (error) {
        setSubmissionMessage(
          error instanceof Error
            ? error.message
            : "The documents could not be read."
        );
        setStatus("upload");
        return;
      }
    }
    try {
      const confirmation = await submitRegistration.mutateAsync({
        ...form,
        passportNumber: form.passportNumber.trim(),
        gender: form.gender as "Male" | "Female",
        phoneCountry: form.phoneCountry.trim(),
        phone: form.phone.trim(),
        department: selectedDepartment,
        lcName: selectedLcName,
        entityName: selectedEntityName,
        mcPosition: selectedMcPosition,
        countryOfOrigin: selectedCountryOfOrigin,
        hostingLc: selectedHostingLc,
        track,
        position,
        price: selectedFee.price,
        currency: selectedFee.currency,
        photoUrl: nextDocuments?.photo?.url ?? "",
        photoDataUrl: inlineDocuments.photoDataUrl,
        photoName: nextDocuments?.photo?.name ?? attachments.photo?.name ?? "",
        cvUrl: nextDocuments?.cv?.url ?? "",
        cvDataUrl: inlineDocuments.cvDataUrl,
        cvName: nextDocuments?.cv?.name ?? attachments.cv?.name ?? "",
        identityUrl: nextDocuments?.identity?.url ?? "",
        identityDataUrl: inlineDocuments.identityDataUrl,
        identityName:
          nextDocuments?.identity?.name ?? attachments.identity?.name ?? "",
      });
      const receiptDocuments = confirmation.documents ?? nextDocuments ?? {};
      setReceipt({
        form: {
          ...form,
          passportNumber: form.passportNumber.trim(),
          phoneCountry: form.phoneCountry.trim(),
          phone: form.phone.trim(),
          department: selectedDepartment,
          lcName: selectedLcName,
          entityName: selectedEntityName,
          mcPosition: selectedMcPosition,
          position,
          countryOfOrigin: selectedCountryOfOrigin,
          hostingLc: selectedHostingLc,
        },
        price: selectedFee.price,
        currency: selectedFee.currency,
        contributionNote: selectedFee.note,
        documents: receiptDocuments,
        reference: `LL26-${String(Date.now()).slice(-6)}`,
        recordedAt: new Date().toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      });
      setStage("receipt");
    } catch (error) {
      setSubmissionMessage(
        error instanceof Error
          ? error.message
          : "The registration service could not confirm your record."
      );
      setStatus("error");
    }
  };
  const error = (key: keyof FormState) =>
    errors[key] ? (
      <small className="field-error" role="alert">
        {errors[key]}
      </small>
    ) : null;
  const progressClass = (value: 1 | 2 | 3 | 4) =>
    stageNumber === value
      ? "is-active"
      : stageNumber > value
        ? "is-complete"
        : "";
  const heading =
    stage === "receipt"
      ? "Registration receipt"
      : stage === 1
        ? "Basic information"
        : stage === 2
          ? "Participation details"
          : stage === 3
            ? "Indemnity signature"
            : "Review your dossier";

  return (
    <main className="registration-site chase-route chase-register cinematic-world-root">
      <CinematicBackground tone="dossier" />
      <div className="route-entry-wipe" aria-hidden="true" />
      <div className="route-pressure-lines" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="dossier-relic-route" aria-hidden="true">
        <i />
      </div>
      <div
        className="register-backdrop"
        style={{
          backgroundImage: `url(${CINEMATIC_ASSETS.thynaRooftopBackground})`,
        }}
        aria-hidden="true"
      />
      <div className="register-rails" aria-hidden="true">
        <i />
        <i />
      </div>
      <img
        className="register-courier"
        src={CINEMATIC_ASSETS.courierGrab}
        alt=""
        aria-hidden="true"
      />
      <div className="register-relic-trace" aria-hidden="true">
        <i />
      </div>
      {isEmbedded ? (
        <header className="register-header">
          <button
            type="button"
            className="back-link"
            onClick={() =>
              window.parent.postMessage(
                { type: "lead-lead-registration-close" },
                window.location.origin
              )
            }
          >
            ← CLOSE REGISTRATION
          </button>
          <div className="register-event-brand">
            <img
              src="/manus-storage/lead-lead-2k26-emblem_777efc54.png"
              alt="Lead & Lead 2K26 conference logo"
            />
            <span>
              LEAD &amp; LEAD <small>2K26 CONFERENCE</small>
            </span>
          </div>
        </header>
      ) : (
        <ConferenceHeader current="register" />
      )}
      <div className="register-layout">
        <aside className="dossier-intro">
          <p className="eyebrow">CHAPTER VI / DELEGATE DOSSIER</p>
          <h1>
            {stage === "receipt" ? "The record is sealed." : "Answer the call."}
          </h1>
          <dl>
            <div>
              <dt>STARTS</dt>
              <dd>10 September 2026</dd>
            </div>
            <div>
              <dt>DURATION</dt>
              <dd>
                {form.track
                  ? `${form.track} · 3 days`
                  : "International AIESECer · 3 days / EP · 3 days"}
              </dd>
            </div>
            <div>
              <dt>HOST</dt>
              <dd>LC Thyna</dd>
            </div>
            <div>
              <dt>VENUE</dt>
              <dd>Amir Palace</dd>
            </div>
          </dl>
        </aside>
        <section className="dossier-panel" aria-labelledby="registration-title">
          <div className="dossier-heading">
            <p>
              {stage === "receipt"
                ? "DELEGATE RECEIPT / RECORD CONFIRMED"
                : `REGISTRATION RECORD / STEP ${stage} OF 4`}
            </p>
            <h2 id="registration-title">{heading}</h2>
            <span />
          </div>
          {stage !== "receipt" && (
            <div
              className="dossier-progress"
              aria-label={`Registration step ${stage} of 4`}
            >
              <span className={progressClass(1)}>
                <b>01</b>
                <i>Information</i>
              </span>
              <em />
              <span className={progressClass(2)}>
                <b>02</b>
                <i>Participation</i>
              </span>
              <em />
              <span className={progressClass(3)}>
                <b>03</b>
                <i>Signature</i>
              </span>
              <em />
              <span className={progressClass(4)}>
                <b>04</b>
                <i>Review</i>
              </span>
            </div>
          )}
          {stage === "receipt" && receipt ? (
            <section className="registration-receipt" aria-live="polite">
              <div className="receipt-seal">✓</div>
              <p className="receipt-kicker">REGISTRATION RECEIVED</p>
              <h3>Thank you, {receipt.form.firstName}.</h3>
              <p className="receipt-copy">
                Your registration was submitted successfully.
              </p>
              <div className="receipt-reference">
                <span>REFERENCE</span>
                <strong>{receipt.reference}</strong>
              </div>
              <button
                className="bronze-button receipt-home"
                type="button"
                onClick={() =>
                  isEmbedded
                    ? window.parent.postMessage(
                        { type: "lead-lead-registration-close" },
                        window.location.origin
                      )
                    : window.location.assign("/home")
                }
              >
                {isEmbedded ? "CLOSE REGISTRATION" : "RETURN TO THE GATHERING"}{" "}
                <b>→</b>
              </button>
            </section>
          ) : (
            <form onSubmit={submit} noValidate>
              {stage === 1 && (
                <div className="registration-step registration-step--information">
                  <p className="step-intro">
                    Use your official details so the organising team can
                    identify your registration.
                  </p>
                  <div className="form-grid two">
                    <label>
                      First name
                      <input
                        value={form.firstName}
                        onChange={event =>
                          update("firstName", event.target.value)
                        }
                        placeholder="Foulen"
                        required
                        aria-invalid={Boolean(errors.firstName)}
                      />
                      {error("firstName")}
                    </label>
                    <label>
                      Last name
                      <input
                        value={form.lastName}
                        onChange={event =>
                          update("lastName", event.target.value)
                        }
                        placeholder="Fouléni"
                        required
                        aria-invalid={Boolean(errors.lastName)}
                      />
                      {error("lastName")}
                    </label>
                    <label>
                      Gender
                      <select
                        value={form.gender}
                        onChange={event =>
                          update(
                            "gender",
                            event.target.value as FormState["gender"]
                          )
                        }
                        required
                        aria-invalid={Boolean(errors.gender)}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      {error("gender")}
                    </label>
                  </div>
                  <div className="form-grid two">
                    <label>
                      Passport number
                      <input
                        value={form.passportNumber}
                        onChange={event =>
                          update("passportNumber", event.target.value)
                        }
                        placeholder="Enter your passport number"
                        required
                        autoComplete="off"
                        aria-invalid={Boolean(errors.passportNumber)}
                      />
                      {error("passportNumber")}
                    </label>
                    <label>
                      Country code
                      <select
                        value={form.phoneCountry}
                        onChange={event =>
                          update("phoneCountry", event.target.value)
                        }
                        required
                        aria-invalid={Boolean(errors.phoneCountry)}
                      >
                        {phoneCountries.map(([code, country]) => (
                          <option value={code} key={`${code}-${country}`}>
                            {code} · {country}
                          </option>
                        ))}
                      </select>
                      {error("phoneCountry")}
                    </label>
                  </div>
                  <div className="form-grid two">
                    <label>
                      Phone number
                      <input
                        value={form.phone}
                        onChange={event => update("phone", event.target.value)}
                        placeholder="Enter your phone number"
                        inputMode="tel"
                        required
                        aria-invalid={Boolean(errors.phone)}
                      />
                      {error("phone")}
                    </label>
                    <label>
                      Email
                      <input
                        type="email"
                        value={form.email}
                        onChange={event => update("email", event.target.value)}
                        placeholder="foulen.fouleni@mail.com"
                        autoComplete="email"
                        required
                        aria-invalid={Boolean(errors.email)}
                      />
                      {error("email")}
                    </label>
                  </div>
                  <button
                    className="bronze-button submit-button"
                    type="button"
                    onClick={continueToParticipation}
                  >
                    CONTINUE <b>→</b>
                  </button>
                </div>
              )}
              {stage === 2 && (
                <div className="registration-step registration-step--participation">
                  <p className="step-intro">
                    Choose your participant type and complete only the details
                    relevant to your profile.
                  </p>
                  {fee ? (
                    <div className="contribution-card">
                      <p>YOUR CONTRIBUTION</p>
                      <strong>
                        {fee.price} <small>{fee.currency}</small>
                      </strong>
                      <span>
                        {fee.note} Payment is not collected through this page.
                      </span>
                    </div>
                  ) : (
                    <div className="contribution-card contribution-card--pending">
                      <p>CONTRIBUTION</p>
                      <span>
                        Select a participant type to reveal your contribution.
                      </span>
                    </div>
                  )}
                  <div className="form-grid two">
                    <label>
                      Participant type
                      <select
                        required
                        value={form.track}
                        onChange={event => {
                          const track = event.target.value as Track;
                          setForm(current => ({
                            ...current,
                            track,
                            position: track === "EP" ? "None" : "",
                            mcPosition: track === "EP" ? "None" : "",
                            department: track === "EP" ? "None" : "",
                            countryOfOrigin:
                              track === "EP" ? current.countryOfOrigin : "None",
                            hostingLc:
                              track === "EP" ? current.hostingLc : "None",
                            lcName: track === "EP" ? "None" : "",
                            entityName: track === "EP" ? "None" : "",
                          }));
                        }}
                        aria-invalid={Boolean(errors.track)}
                      >
                        <option value="">Select participant type</option>
                        <option>International AIESECer</option>
                        <option>EP</option>
                      </select>
                      {error("track")}
                    </label>
                    {form.track === "International AIESECer" && (
                      <label>
                        Position
                        <select
                          required
                          value={form.position}
                          onChange={event => {
                            const position = event.target.value as Position;
                            setForm(current => ({
                              ...current,
                              position,
                              mcPosition: ["MCVP"].includes(position)
                                ? current.mcPosition === "None"
                                  ? ""
                                  : current.mcPosition
                                : "None",
                              lcName: shouldShowLcName(position)
                                ? current.lcName === "None"
                                  ? ""
                                  : current.lcName
                                : "None",
                            }));
                          }}
                          aria-invalid={Boolean(errors.position)}
                        >
                          <option value="">Select position</option>
                          {[
                            "Manager",
                            "Team Leader",
                            "LCVP",
                            "LCP",
                            "MCVP",
                            "MCP",
                          ].map(position => (
                            <option key={position}>{position}</option>
                          ))}
                        </select>
                        {error("position")}
                      </label>
                    )}
                    {form.track === "International AIESECer" &&
                      ["MCVP"].includes(form.position) && (
                        <label>
                          MC position
                          <input
                            value={form.mcPosition}
                            onChange={event =>
                              update("mcPosition", event.target.value)
                            }
                            placeholder="Write your MC position"
                            autoComplete="organization-title"
                            required
                            aria-invalid={Boolean(errors.mcPosition)}
                          />
                          {error("mcPosition")}
                        </label>
                      )}
                    {form.track === "EP" && (
                      <>
                        <label>
                          Hosting LC
                          <input
                            value={form.hostingLc}
                            onChange={event =>
                              update("hostingLc", event.target.value)
                            }
                            placeholder="Enter the hosting LC"
                            autoComplete="organization"
                            required
                            aria-invalid={Boolean(errors.hostingLc)}
                          />
                          {error("hostingLc")}
                        </label>
                        <label>
                          Country of origin
                          <input
                            value={form.countryOfOrigin}
                            onChange={event =>
                              update("countryOfOrigin", event.target.value)
                            }
                            placeholder="Enter your country of origin"
                            required
                            aria-invalid={Boolean(errors.countryOfOrigin)}
                          />
                          {error("countryOfOrigin")}
                        </label>
                      </>
                    )}
                  </div>
                  {form.track === "International AIESECer" && (
                    <div className="form-grid two">
                      {shouldShowLcName(form.position) && (
                        <label>
                          LC name
                          <input
                            value={form.lcName}
                            onChange={event =>
                              update("lcName", event.target.value)
                            }
                            placeholder="Write your LC name"
                            autoComplete="organization"
                            required
                            aria-invalid={Boolean(errors.lcName)}
                          />
                          {error("lcName")}
                        </label>
                      )}
                      <label>
                        Entity name
                        <input
                          value={form.entityName}
                          onChange={event =>
                            update("entityName", event.target.value)
                          }
                          placeholder="Write your entity name"
                          autoComplete="organization"
                          required
                          aria-invalid={Boolean(errors.entityName)}
                        />
                        {error("entityName")}
                      </label>
                    </div>
                  )}
                  {form.track && (
                    <label className="single-room-option">
                      <input
                        type="checkbox"
                        checked={form.singleRoom}
                        onChange={event =>
                          update("singleRoom", event.target.checked)
                        }
                      />
                      <span>
                        <strong>Single room</strong>
                        <small>
                          +{getSingleRoomSurcharge(form.position, form.track)}{" "}
                          EUR total
                        </small>
                      </span>
                    </label>
                  )}
                  {form.track === "International AIESECer" && (
                    <div className="department-fields">
                      <label>
                        Department
                        <select
                          required
                          value={form.department}
                          onChange={event => {
                            update("department", event.target.value);
                            if (event.target.value !== "Other")
                              setOtherDepartment("");
                          }}
                          aria-invalid={Boolean(errors.department)}
                        >
                          <option value="">Select your department</option>
                          {departments.map(department => (
                            <option key={department}>{department}</option>
                          ))}
                        </select>
                        {error("department")}
                      </label>
                      {form.department === "Other" && (
                        <label>
                          Department name
                          <input
                            value={otherDepartment}
                            onChange={event =>
                              setOtherDepartment(event.target.value)
                            }
                            placeholder="Write your department"
                            required
                          />
                        </label>
                      )}
                    </div>
                  )}
                  <div className="attachment-grid">
                    <label className="attachment-field attachment-field--identity">
                      Passport document{" "}
                      <small>Required · JPG, PNG, or PDF · max 5 MB</small>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf,.pdf"
                        required
                        onChange={event =>
                          selectAttachment("identity", event.target.files?.[0])
                        }
                      />
                      {attachments.identity && (
                        <strong>
                          {attachments.identity.name}
                          <button
                            type="button"
                            onClick={() => removeAttachment("identity")}
                          >
                            REMOVE
                          </button>
                        </strong>
                      )}
                      {attachmentErrors.identity && (
                        <small className="field-error" role="alert">
                          {attachmentErrors.identity}
                        </small>
                      )}
                    </label>
                    <label className="attachment-field">
                      Profile photo{" "}
                      <small>Required · JPG, PNG, or WebP · max 3 MB</small>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        required
                        onChange={event =>
                          selectAttachment("photo", event.target.files?.[0])
                        }
                      />
                      {attachments.photo && (
                        <strong>
                          {attachments.photo.name}
                          <button
                            type="button"
                            onClick={() => removeAttachment("photo")}
                          >
                            REMOVE
                          </button>
                        </strong>
                      )}
                      {attachmentErrors.photo && (
                        <small className="field-error" role="alert">
                          {attachmentErrors.photo}
                        </small>
                      )}
                    </label>
                    <label className="attachment-field">
                      CV / résumé <small>Required · PDF · max 15 MB</small>
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        required
                        onChange={event =>
                          selectAttachment("cv", event.target.files?.[0])
                        }
                      />
                      {attachments.cv && (
                        <strong>
                          {attachments.cv.name}
                          <button
                            type="button"
                            onClick={() => removeAttachment("cv")}
                          >
                            REMOVE
                          </button>
                        </strong>
                      )}
                      {attachmentErrors.cv && (
                        <small className="field-error" role="alert">
                          {attachmentErrors.cv}
                        </small>
                      )}
                    </label>
                  </div>
                  <label>
                    Allergies{" "}
                    <small>Required · enter “None” if not applicable</small>
                    <textarea
                      value={form.allergies}
                      onChange={event =>
                        update("allergies", event.target.value)
                      }
                      rows={3}
                      placeholder="List allergies or dietary concerns, or enter None"
                      required
                      aria-invalid={Boolean(errors.allergies)}
                    />
                    {error("allergies")}
                  </label>
                  <label>
                    Additional note{" "}
                    <small>Required · enter “None” if not applicable</small>
                    <textarea
                      value={form.note}
                      onChange={event => update("note", event.target.value)}
                      rows={3}
                      placeholder="Add a note for the organising team, or enter None"
                      required
                      aria-invalid={Boolean(errors.note)}
                    />
                    {error("note")}
                  </label>
                  <div className="registration-actions">
                    <button
                      className="step-back-button"
                      type="button"
                      onClick={() => goTo(1)}
                    >
                      ← BACK
                    </button>
                    <button
                      className="bronze-button"
                      type="button"
                      onClick={continueToSignature}
                    >
                      SIGNATURE <b>→</b>
                    </button>
                  </div>
                </div>
              )}
              {stage === 3 && (
                <div className="registration-step registration-step--signature">
                  <p className="step-intro">
                    Confirm the event indemnity before reviewing your
                    registration.
                  </p>
                  <div className="indemnity-card">
                    <p className="eyebrow">INDEMNITY SIGNATURE</p>
                    <h3>Respect the gathering.</h3>
                    <p>
                      I, {form.firstName || "the undersigned"}, agree that I
                      will not bring alcohol or any other prohibited substances
                      or items to Lead &amp; Lead 2K26.
                    </p>
                    <div className="signature-field">
                      <div className="signature-field__header">
                        <label htmlFor="virtual-signature">
                          Draw your signature below
                        </label>
                        <button
                          className="signature-clear"
                          type="button"
                          onClick={clearSignature}
                          disabled={!signatureReady}
                        >
                          CLEAR
                        </button>
                      </div>
                      <canvas
                        id="virtual-signature"
                        ref={signatureCanvasRef}
                        className="virtual-signature"
                        width={1200}
                        height={300}
                        onPointerDown={startSignature}
                        onPointerMove={drawSignature}
                        onPointerUp={finishSignature}
                        onPointerCancel={finishSignature}
                        onPointerLeave={finishSignature}
                        role="img"
                        aria-label="Draw your indemnity signature"
                      />
                      {error("indemnitySignature")}
                    </div>
                    <label className="indemnity-consent">
                      <input
                        type="checkbox"
                        checked={form.indemnityAccepted}
                        onChange={event =>
                          update("indemnityAccepted", event.target.checked)
                        }
                        required
                        aria-invalid={Boolean(errors.indemnityAccepted)}
                      />
                      <span>I agree to this indemnity statement.</span>
                    </label>
                    {error("indemnityAccepted")}
                    <div className="registration-actions">
                      <button
                        className="step-back-button"
                        type="button"
                        onClick={() => goTo(2)}
                      >
                        ← BACK
                      </button>
                      <button
                        className="bronze-button"
                        type="button"
                        onClick={continueToReview}
                      >
                        REVIEW <b>→</b>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {stage === 4 && (
                <div className="registration-step registration-review">
                  <p className="step-intro">
                    Review your information before submitting it. A receipt
                    appears only after the registration sheet confirms your
                    record.
                  </p>
                  <div className="review-grid">
                    <section className="review-section">
                      <h4>Delegate</h4>
                      <p>
                        {form.firstName} {form.lastName}
                      </p>
                      <p>Passport: {form.passportNumber}</p>
                      <p>Gender: {form.gender || "Gender pending"}</p>
                      <p>{form.email}</p>
                    </section>
                    <section className="review-section">
                      <h4>Participation</h4>
                      <p>
                        {form.track || "Participant type pending"}
                        {form.track === "International AIESECer"
                          ? ` / ${form.position || "Position pending"}`
                          : ""}
                      </p>
                      {form.track === "International AIESECer" ? (
                        <>
                          <p>
                            {form.department === "Other"
                              ? otherDepartment || "Department pending"
                              : form.department || "Department pending"}
                          </p>
                          {shouldShowLcName(form.position) && (
                            <p>LC: {form.lcName || "LC pending"}</p>
                          )}
                          {["MCVP"].includes(form.position) && (
                            <p>
                              MC position:{" "}
                              {form.mcPosition || "MC position pending"}
                            </p>
                          )}
                          <p>Entity: {form.entityName || "Entity pending"}</p>
                        </>
                      ) : (
                        <>
                          <p>
                            Country of origin:{" "}
                            {form.countryOfOrigin || "Country pending"}
                          </p>
                          <p>
                            Hosting LC: {form.hostingLc || "Hosting LC pending"}
                          </p>
                        </>
                      )}
                      <p>
                        {form.singleRoom
                          ? `Single room · +${getSingleRoomSurcharge(
                              form.position,
                              form.track
                            )} EUR total`
                          : "Shared room"}
                      </p>
                      <p>Contribution: {fee?.price ?? "—"} EUR</p>
                      <p>Virtual indemnity signature captured</p>
                    </section>
                  </div>
                  <div className="registration-actions">
                    <button
                      className="step-back-button"
                      type="button"
                      onClick={() => goTo(3)}
                    >
                      ← BACK
                    </button>
                    <button
                      className="bronze-button"
                      disabled={
                        status === "sending" ||
                        submitRegistration.isPending
                      }
                      type="submit"
                    >
                      {status === "sending" ||
                      submitRegistration.isPending
                        ? "RECORDING…"
                        : "SUBMIT REGISTRATION"}
                      <b>→</b>
                    </button>
                  </div>
                  {status === "sending" && (
                    <p className="form-status" role="status">
                      Saving your registration. Please keep this page open.
                    </p>
                  )}
                  {(status === "upload" || status === "error") && (
                    <p className="form-status error" role="alert">
                      Error: {submissionMessage || "Registration not submitted."}
                    </p>
                  )}
                </div>
              )}
            </form>
          )}
        </section>
      </div>
      {!isEmbedded && <ConferenceFooter />}
    </main>
  );
}
