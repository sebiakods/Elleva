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
  coverUrl?: string | null;
  price?: number;
}

interface PaymentPageProps {
  params: Promise<{
    id: string;
  }>;
}

type PaymentMethod = "baridimob" | "ccp" | "card";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const FIXED_PRICE_DZD = 1900;

export default function CoursePaymentPage({
  params,
}: PaymentPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("baridimob");

  const [transactionRef, setTransactionRef] = useState("");
  const [senderAccount, setSenderAccount] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  /*
   * ============================================================
   * LOAD COURSE
   * ============================================================
   *
   * Authentication is handled by the HTTP-only cookie.
   *
   * IMPORTANT:
   * We do NOT use:
   * - localStorage
   * - sessionStorage
   * - accessToken
   * - token
   * - Authorization: Bearer ...
   *
   * credentials: "include" tells the browser to send the
   * authentication cookie to the backend.
   */
  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    async function loadCourse() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/courses/${id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        /*
         * If the session cookie is missing/expired, the backend
         * should return 401.
         */
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const json = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            json?.message ||
              "Impossible de charger cette formation."
          );
        }

        const data = (json?.data || json) as CourseDetail;

        if (!data?.id) {
          throw new Error(
            "Les informations de cette formation sont invalides."
          );
        }

        if (!cancelled) {
          setCourse({
            ...data,
            price: FIXED_PRICE_DZD,
          });
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Erreur de chargement du cours:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de récupérer les informations de la formation."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  /*
   * ============================================================
   * PAYMENT / ENROLLMENT
   * ============================================================
   *
   * IMPORTANT:
   * There is no localStorage anymore.
   *
   * The backend should receive the payment information and use
   * the authenticated user from the HTTP-only cookie.
   *
   * Change the endpoint below if your backend uses a different
   * payment/enrollment route.
   */
  async function handleEnrollment(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!course || submitting || success) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      /*
       * For now, create FormData because the receipt is a file.
       */
      const formData = new FormData();

      formData.append("courseId", course.id);
      formData.append("paymentMethod", paymentMethod);
      formData.append(
        "transactionRef",
        transactionRef.trim()
      );
      formData.append(
        "senderAccount",
        senderAccount.trim()
      );
      formData.append(
        "amount",
        String(FIXED_PRICE_DZD)
      );

      if (receiptFile) {
        formData.append("receipt", receiptFile);
      }

      /*
       * NO Authorization header.
       *
       * The authentication cookie is automatically sent.
       */
      const response = await fetch(
        `${API_URL}/courses/${course.id}/payment`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          json?.message ||
            "Impossible de confirmer le paiement."
        );
      }

      setSuccess(true);

      /*
       * Give the success message a moment before redirecting.
       */
      window.setTimeout(() => {
        router.push(`/dashboard/courses/${course.id}`);
      }, 1800);
    } catch (err) {
      console.error(
        "Erreur de paiement:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors du paiement."
      );

      setSubmitting(false);
    }
  }

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

  return (
    <div className="mx-auto my-8 max-w-4xl p-6">
      <Link
        href="/dashboard/courses"
        className="mb-6 inline-flex items-center gap-1.5 font-body text-sm font-medium text-[#e0156a] hover:text-[#7a1352]"
      >
        <ArrowLeft size={15} />
        Retour aux formations
      </Link>

      {/* ERROR */}
      {error && !success && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="font-body text-sm font-semibold text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-[#e9f9ef] p-4 text-[#176b3a]">
          <CheckCircle2
            size={20}
            className="shrink-0"
          />

          <p className="font-body text-sm font-semibold">
            Paiement confirmé avec succès ! Redirection
            vers la formation...
          </p>
        </div>
      )}

      <form
        onSubmit={handleEnrollment}
        className="grid grid-cols-1 gap-8 md:grid-cols-3"
      >
        {/* ======================================================
            LEFT
        ====================================================== */}
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

          {/* PAYMENT FORM */}
          <div className="card-surface space-y-5 p-6">
            <div>
              <span className="mb-1 block font-script text-lg text-[#e0156a]">
                Presque terminé
              </span>

              <h2 className="font-display text-lg font-bold text-[#1e1620]">
                Méthode de paiement
              </h2>

              <p className="mt-1 font-body text-xs text-[#1e1620]/50">
                Sélectionnez votre méthode de paiement et
                renseignez les informations de la transaction.
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
                    disabled={submitting || success}
                    onClick={() =>
                      setPaymentMethod(option.id)
                    }
                    className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-4 text-center font-body transition-all ${
                      active
                        ? "bg-gradient-to-br from-[#e0156a] to-[#7a1352] text-white shadow-[0_12px_25px_-10px_rgba(224,21,106,0.5)]"
                        : "border border-[#f1e9de] bg-[#fdfbf8] text-[#1e1620]/60 hover:border-[#e0156a]/30 hover:text-[#7a1352]"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
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
                Elleva Platform
              </p>
            </div>

            {/* SENDER */}
            <div>
              <label
                htmlFor="senderAccount"
                className="mb-1.5 block font-body text-xs font-semibold text-[#7a1352]"
              >
                Numéro CCP / RIP / Nom de l'émetteur
              </label>

              <input
                id="senderAccount"
                type="text"
                required
                disabled={submitting || success}
                value={senderAccount}
                onChange={(event) =>
                  setSenderAccount(event.target.value)
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
                Numéro de transaction / Référence
              </label>

              <input
                id="transactionRef"
                type="text"
                required
                disabled={submitting || success}
                value={transactionRef}
                onChange={(event) =>
                  setTransactionRef(event.target.value)
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
                  submitting || success
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
                  disabled={submitting || success}
                  onChange={(event) => {
                    const file =
                      event.target.files?.[0] || null;

                    setReceiptFile(file);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* ======================================================
            RIGHT SUMMARY
        ====================================================== */}
        <div className="space-y-6">
          <div className="card-surface p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-[#1e1620]">
              Récapitulatif
            </h2>

            <div className="space-y-3 font-body text-sm">
              <div className="flex justify-between text-[#1e1620]/60">
                <span>Prix de la formation</span>
                <span>
                  {FIXED_PRICE_DZD.toLocaleString("fr-FR")} DZD
                </span>
              </div>

              <div className="flex justify-between text-[#1e1620]/60">
                <span>Frais de traitement</span>
                <span className="text-[#176b3a]">
                  Gratuit
                </span>
              </div>

              <div className="my-3 border-t border-[#f1e9de]" />

              <div className="flex justify-between font-bold text-[#1e1620]">
                <span>Total</span>

                <span className="text-[#e0156a]">
                  {FIXED_PRICE_DZD.toLocaleString("fr-FR")} DZD
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || success}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e0156a] to-[#7a1352] py-3.5 font-body font-semibold text-white shadow-lg transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Traitement...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={16} />
                  Paiement confirmé
                </>
              ) : (
                `Confirmer le paiement (${FIXED_PRICE_DZD.toLocaleString(
                  "fr-FR"
                )} DZD)`
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}