"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Smartphone,
  Landmark,
  CreditCard,
  UploadCloud,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface CourseDetail {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  coverUrl?: string;
  price?: number;
}

interface PaymentPageProps {
  params: Promise<{
    id: string;
  }>;
}

type PaymentMethod = "baridimob" | "ccp" | "card";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api";

export default function CoursePaymentPage({
  params,
}: PaymentPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [course, setCourse] =
    useState<CourseDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("baridimob");

  const [transactionRef, setTransactionRef] =
    useState("");

  const [senderAccount, setSenderAccount] =
    useState("");

  const [receiptFile, setReceiptFile] =
    useState<File | null>(null);

  /*
   * ============================================================
   * LOAD COURSE
   * ============================================================
   *
   * Backend is ONLY used to display course information.
   *
   * There is NO payment request.
   */

  useEffect(() => {
    async function loadCourse() {
      try {
        /*
         * First try the course stored by the catalog.
         */
        const stored =
          sessionStorage.getItem("paymentCourse");

        if (stored) {
          try {
            const parsed =
              JSON.parse(stored) as CourseDetail;

            if (
              parsed.id === id ||
              parsed.slug === id
            ) {
              setCourse(parsed);
              setLoading(false);
              return;
            }
          } catch {
            sessionStorage.removeItem(
              "paymentCourse"
            );
          }
        }

        /*
         * If it is not in sessionStorage, retrieve
         * the course from the backend.
         *
         * This is still ONLY course display data.
         */
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken");

        const res = await fetch(
          `${API_URL}/courses/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error(
            "Impossible de charger cette formation."
          );
        }

        const json = await res.json();

        const data = (json.data ||
          json) as CourseDetail;

        setCourse(data);
      } catch (err) {
        console.error(
          "Erreur de chargement du cours:",
          err
        );

        setError(
          "Impossible de récupérer les informations de la formation."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [id]);

  /*
   * ============================================================
   * STATIC DEMO PAYMENT
   * ============================================================
   *
   * IMPORTANT:
   *
   * No backend request.
   * No payment API.
   * No database.
   * No validation.
   *
   * We simply remember:
   *
   * course_payment_<courseId> = true
   */

  const handleEnrollment = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!course || submitting || success) {
      return;
    }

    setError(null);
    setSubmitting(true);

    /*
     * ==========================================
     * STATIC PAYMENT STATE
     * ==========================================
     */

    localStorage.setItem(
      `course_payment_${course.id}`,
      "true"
    );

    /*
     * Update UI.
     */
    setSuccess(true);

    /*
     * Clean selected course.
     */
    sessionStorage.removeItem(
      "paymentCourse"
    );

    /*
     * Redirect after success message.
     */
    setTimeout(() => {
      router.push(
        `/dashboard/courses/${course.id}`
      );
    }, 1800);
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2
          size={32}
          className="animate-spin text-[#e0156a]"
        />

        <p className="font-body text-sm font-medium text-[#7a1352]/70">
          Chargement des informations du cours...
        </p>
      </div>
    );
  }

  /*
   * ============================================================
   * COURSE NOT FOUND
   * ============================================================
   */

  if (!course) {
    return (
      <div className="mx-auto my-8 max-w-4xl p-6">
        <Link
          href="/dashboard/courses"
          className="mb-6 inline-flex items-center gap-1.5 font-body text-sm font-medium text-[#e0156a] hover:text-[#7a1352]"
        >
          <ArrowLeft size={15} />
          Retour aux formations
        </Link>

        <div className="card-surface p-12 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#ffe3ee]">
            <CreditCard
              size={24}
              className="text-[#e0156a]"
            />
          </div>

          <h1 className="mb-3 font-display text-2xl font-bold text-[#1e1620]">
            Formation introuvable
          </h1>

          <p className="mb-6 font-body text-sm text-[#1e1620]/60">
            {error ||
              "Cette formation n'existe pas ou n'est plus disponible."}
          </p>

          <Link
            href="/dashboard/courses"
            className="inline-flex rounded-full bg-gradient-to-r from-[#e0156a] to-[#7a1352] px-6 py-3 font-body text-sm font-medium text-white hover:brightness-105"
          >
            Voir les formations
          </Link>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PAYMENT OPTIONS
   * ============================================================
   */

  const paymentOptions: {
    id: PaymentMethod;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
  }[] = [
    {
      id: "baridimob",
      icon: <Smartphone size={18} />,
      title: "BaridiMob",
      subtitle: "Virement RIP",
    },
    {
      id: "ccp",
      icon: <Landmark size={18} />,
      title: "CCP / Versement",
      subtitle: "Bureau de poste",
    },
    {
      id: "card",
      icon: <CreditCard size={18} />,
      title: "Edahabia / CIB",
      subtitle: "Carte bancaire",
    },
  ];

  /*
   * ============================================================
   * PAYMENT PAGE
   * ============================================================
   */

  return (
    <div className="mx-auto my-8 max-w-4xl p-6">
      <Link
        href="/dashboard/courses"
        className="mb-6 inline-flex items-center gap-1.5 font-body text-sm font-medium text-[#e0156a] hover:text-[#7a1352]"
      >
        <ArrowLeft size={15} />
        Retour aux formations
      </Link>

      <form
        onSubmit={handleEnrollment}
        className="grid grid-cols-1 gap-8 md:grid-cols-3"
      >
        {/* LEFT */}
        <div className="space-y-6 md:col-span-2">
          {/* COURSE */}
          <div className="card-surface relative overflow-hidden p-6">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-[#ffc1d8] to-[#e0156a]/10 opacity-60 blur-2xl" />

            <span className="relative rounded-full bg-[#ffe3ee] px-3 py-1 font-body text-[11px] font-semibold tracking-wide text-[#7a1352]">
              {course.category || "Formation"}
            </span>

            <h1 className="relative mb-2 mt-3 font-display text-2xl font-bold text-[#1e1620]">
              {course.title}
            </h1>

            {course.description && (
              <p className="relative font-body text-sm leading-relaxed text-[#1e1620]/60">
                {course.description}
              </p>
            )}

            {course.level && (
              <div className="relative mt-4">
                <span className="inline-flex rounded-full bg-[#f6efe1] px-3 py-1 font-body text-[11px] font-semibold tracking-wide text-[#8a6d1f]">
                  Niveau : {course.level}
                </span>
              </div>
            )}
          </div>

          {/* PAYMENT */}
          <div className="card-surface space-y-5 p-6">
            <div>
              <span className="mb-1 block font-script text-lg text-[#e0156a]">
                Presque terminé
              </span>

              <h2 className="font-display text-lg font-bold text-[#1e1620]">
                Méthode de paiement
              </h2>

              <p className="mt-1 font-body text-xs text-[#1e1620]/50">
                Cette démonstration accepte
                n'importe quelles informations.
              </p>
            </div>

            {/* METHODS */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {paymentOptions.map((option) => {
                const active =
                  paymentMethod === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      setPaymentMethod(option.id)
                    }
                    className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-4 text-center font-body transition-all ${
                      active
                        ? "bg-gradient-to-br from-[#e0156a] to-[#7a1352] text-white shadow-[0_12px_25px_-10px_rgba(224,21,106,0.5)]"
                        : "border border-[#f1e9de] bg-[#fdfbf8] text-[#1e1620]/60 hover:border-[#e0156a]/30 hover:text-[#7a1352]"
                    }`}
                  >
                    {active && (
                      <span className="absolute right-2 top-2">
                        <Sparkles
                          size={11}
                          className="text-white"
                        />
                      </span>
                    )}

                    <span
                      className={
                        active
                          ? "text-white"
                          : "text-[#e0156a]"
                      }
                    >
                      {option.icon}
                    </span>

                    <span className="text-sm font-bold">
                      {option.title}
                    </span>

                    <span
                      className={
                        active
                          ? "text-[11px] text-white/80"
                          : "text-[11px] text-[#1e1620]/40"
                      }
                    >
                      {option.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* COORDINATES */}
            <div className="space-y-1 rounded-2xl border border-[#eadfc4] bg-[#f6efe1] p-4 font-body text-xs text-[#6b5620]">
              <p className="mb-1 flex items-center gap-1.5 text-sm font-bold text-[#8a6d1f]">
                <Sparkles size={13} />
                Coordonnées pour l'envoi
              </p>

              <p>
                <span className="font-semibold">
                  RIP BaridiMob :
                </span>{" "}
                00799999000000000000
              </p>

              <p>
                <span className="font-semibold">
                  N° CCP :
                </span>{" "}
                0000000 Clé 00
              </p>

              <p>
                <span className="font-semibold">
                  Nom du bénéficiaire :
                </span>{" "}
                Nom de votre Entreprise / Plateforme
              </p>
            </div>

            {/* SENDER */}
            <div>
              <label
                htmlFor="senderAccount"
                className="mb-1.5 block font-body text-xs font-semibold text-[#7a1352]"
              >
                Numéro CCP / RIP / Nom de
                l'émetteur
              </label>

              <input
                id="senderAccount"
                type="text"
                required
                disabled={submitting}
                value={senderAccount}
                onChange={(e) =>
                  setSenderAccount(e.target.value)
                }
                placeholder="Ex : 00799999... ou Votre Nom"
                className="w-full rounded-2xl border border-[#f1e9de] bg-[#fdfbf8] p-3 font-body text-sm text-[#1e1620] outline-none focus:border-[#e0156a]/40 disabled:opacity-60"
              />
            </div>

            {/* TRANSACTION */}
            <div>
              <label
                htmlFor="transactionRef"
                className="mb-1.5 block font-body text-xs font-semibold text-[#7a1352]"
              >
                Numéro de transaction /
                Référence
              </label>

              <input
                id="transactionRef"
                type="text"
                required
                disabled={submitting}
                value={transactionRef}
                onChange={(e) =>
                  setTransactionRef(e.target.value)
                }
                placeholder="Ex : TXN-9842104"
                className="w-full rounded-2xl border border-[#f1e9de] bg-[#fdfbf8] p-3 font-body text-sm text-[#1e1620] outline-none focus:border-[#e0156a]/40 disabled:opacity-60"
              />
            </div>

            {/* RECEIPT */}
            <div>
              <label
                htmlFor="receipt"
                className="mb-1.5 block font-body text-xs font-semibold text-[#7a1352]"
              >
                Reçu de paiement{" "}
                <span className="font-normal text-[#1e1620]/40">
                  (Optionnel)
                </span>
              </label>

              <label
                htmlFor="receipt"
                className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#e0156a]/30 bg-[#fdfbf8] p-3.5 font-body text-xs hover:border-[#e0156a]/50 ${
                  submitting
                    ? "pointer-events-none opacity-60"
                    : ""
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ffe3ee]">
                  <UploadCloud
                    size={15}
                    className="text-[#e0156a]"
                  />
                </span>

                <span className="min-w-0 truncate text-[#1e1620]/60">
                  {receiptFile ? (
                    <span className="font-semibold text-[#7a1352]">
                      {receiptFile.name}
                    </span>
                  ) : (
                    "Cliquez pour ajouter une image ou un PDF"
                  )}
                </span>

                <input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  disabled={submitting}
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0] || null;

                    if (!file) {
                      setReceiptFile(null);
                      return;
                    }

                    const validType =
                      file.type.startsWith("image/") ||
                      file.type ===
                        "application/pdf";

                    if (!validType) {
                      setError(
                        "Veuillez sélectionner une image ou un PDF."
                      );

                      e.target.value = "";
                      setReceiptFile(null);
                      return;
                    }

                    if (
                      file.size >
                      10 * 1024 * 1024
                    ) {
                      setError(
                        "Le fichier ne doit pas dépasser 10 MB."
                      );

                      e.target.value = "";
                      setReceiptFile(null);
                      return;
                    }

                    setError(null);
                    setReceiptFile(file);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-1">
          <div className="card-surface sticky top-6 space-y-4 p-6 shadow-bloom">
            <h2 className="font-display text-lg font-bold text-[#1e1620]">
              Récapitulatif
            </h2>

            <div className="space-y-3 border-t border-[#f1e9de] pt-4 font-body text-sm">
              <div className="flex justify-between gap-4 text-[#1e1620]/60">
                <span>Formation</span>

                <span className="max-w-[150px] truncate font-medium text-[#1e1620]">
                  {course.title}
                </span>
              </div>

              <div className="flex justify-between text-[#1e1620]/60">
                <span>Prix</span>

                <span className="font-semibold text-[#1e1620]">
                  {course.price
                    ? `${course.price} DZD`
                    : "Gratuit"}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#f1e9de] pt-3 text-base font-bold">
                <span>Total</span>

                <span className="text-gradient-rise font-display text-lg">
                  {course.price
                    ? `${course.price} DZD`
                    : "0 DZD"}
                </span>
              </div>
            </div>

            {/* DEMO NOTICE */}
            <div className="rounded-xl border border-[#f5b8cf] bg-[#ffe3ee] p-3 font-body text-xs text-[#7a1352]">
              <p className="mb-1 font-semibold">
                Paiement de démonstration
              </p>

              <p className="text-[#7a1352]/70">
                Les informations saisies sont
                uniquement utilisées pour cette
                démonstration. Aucun paiement réel
                n'est vérifié.
              </p>
            </div>

            {/* SUCCESS */}
            {success && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-start gap-3 rounded-xl border border-[#86cfa5] bg-[#e9f9ef] p-4 text-[#176b3a]"
              >
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-body text-sm font-bold">
                    Paiement enregistré avec succès !
                  </p>

                  <p className="mt-1 font-body text-xs text-[#176b3a]/75">
                    Votre accès à cette formation
                    est maintenant disponible.
                  </p>
                </div>
              </div>
            )}

            {/* ERROR */}
            {error && !success && (
              <div
                role="alert"
                className="rounded-xl border border-[#f5b8cf] bg-[#ffe3ee] p-3 font-body text-xs text-[#a8123f]"
              >
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={submitting || success}
              className="focus-ring group/btn relative w-full overflow-hidden rounded-full bg-gradient-to-r from-[#e0156a] to-[#7a1352] py-3 text-center font-body text-sm font-semibold text-white transition-all hover:brightness-105 disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {submitting && (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                )}

                {success
                  ? "Paiement enregistré ✓"
                  : submitting
                    ? "Traitement..."
                    : "Envoyer ma preuve de paiement"}
              </span>

              {!submitting && !success && (
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}