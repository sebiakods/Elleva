"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Send,
  MessageSquare,
  FileText,
  Star,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";


export default function BusinessPlanReviewPage() {

  const router = useRouter();


  const [score,setScore] = useState(80);
  const [comment,setComment] = useState("");



  // Temporary data
  // Later replace with API call

  const plan = {
    title:"Atelier Lumière — Bougies artisanales",
    owner:"Amina Kaddour",
    sector:"Artisanat",
    submitted:"Il y a 2h",
    description:
      "Création et vente de bougies artisanales personnalisées.",
  };



  const submitReview = () => {

    console.log({
      score,
      comment
    });

    alert("Évaluation envoyée");

  };



  return (
    <>

      <Header title="Révision du Business Plan" />


      <div className="mb-6">

        <Button
          variant="secondary"
          onClick={()=>router.push("/expert/business-plans")}
        >

          <ArrowLeft size={16}/>
          Retour

        </Button>

      </div>



      <div className="grid gap-6 lg:grid-cols-3">


        {/* LEFT */}

        <div className="lg:col-span-2 space-y-6">



          <div className="card-surface p-6">


            <div className="flex justify-between items-start">

              <div>

                <Badge tone="rose">
                  Business Plan
                </Badge>


                <h1 className="mt-3 text-xl font-semibold text-ink">
                  {plan.title}
                </h1>


                <p className="mt-2 text-sm text-ink-soft">
                  Par {plan.owner}
                </p>


              </div>


              <Badge tone="gold">
                En attente
              </Badge>


            </div>


          </div>




          <div className="card-surface p-6">


            <h2 className="mb-4 font-semibold flex gap-2 items-center">

              <FileText size={18}/>
              Présentation du projet

            </h2>


            <p className="text-sm text-ink-soft leading-relaxed">

              {plan.description}

            </p>



          </div>





          <div className="card-surface p-6">


            <h2 className="mb-4 font-semibold">
              Commentaires
            </h2>


            <textarea

              rows={6}

              className="w-full rounded-xl border p-3"

              placeholder="Écrivez vos remarques pour l'entrepreneure..."

              value={comment}

              onChange={(e)=>setComment(e.target.value)}

            />


          </div>



        </div>





        {/* RIGHT */}

        <div className="space-y-6">


          <div className="card-surface p-6">


            <h2 className="mb-4 font-semibold flex gap-2">

              <Star size={18}/>
              Évaluation

            </h2>



            <input

              type="range"

              min="0"

              max="100"

              value={score}

              onChange={(e)=>setScore(Number(e.target.value))}

              className="w-full"

            />



            <div className="mt-3 text-center">

              <span className="text-3xl font-bold text-rose-600">

                {score}

              </span>

              <span>
                /100
              </span>


            </div>


          </div>





          <div className="card-surface p-6">


            <h2 className="mb-4 font-semibold">
              Actions
            </h2>


            <div className="space-y-3">


              <Button
                className="w-full"
                onClick={submitReview}
              >

                <Send size={16}/>
                Envoyer l'avis

              </Button>



              <Button
                variant="secondary"
                className="w-full"
              >

                <CheckCircle2 size={16}/>
                Valider le plan

              </Button>



            </div>


          </div>




        </div>


      </div>

    </>
  );
}