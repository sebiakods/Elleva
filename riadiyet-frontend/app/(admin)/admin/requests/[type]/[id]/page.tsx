"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Check,
  X,
  FileText,
  ExternalLink,
  Mail,
} from "lucide-react";

import { Header } from "@/components/layout/Header";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Application {
  id: string;
  status: ApplicationStatus;
  email: string;
  motivation: string;

  // Expert fields
  fullName?: string;
  title?: string;
  experience?: string;
  specialties?: string;
  languages?: string;
  linkedin?: string;
  portfolio?: string;
  certifications?: string;
  cvPath?: string | null;

  // Institution fields
  organizationName?: string;
  organizationType?: string;
  wilaya?: string;
  contactName?: string;
  contactRole?: string;
  phone?: string;
  website?: string;
  sectors?: string;
  documentPath?: string | null;

  createdAt?: string;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}


const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "En attente",
  APPROVED: "Validée",
  REJECTED: "Refusée",
};


export default function RequestDetailsPage() {

  const params = useParams();
  const router = useRouter();

 const id = params.id as string;
const type = params.type as "expert" | "institution";


const [application, setApplication] =
  useState<Application | null>(null);

  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");

  const [actionLoading,setActionLoading] =
    useState(false);



  // ==========================
  // GET APPLICATION
  // ==========================

  useEffect(()=>{


    const fetchApplication = async()=>{

      try{

        setLoading(true);
        setError("");

        const token = getAuthToken();


       const endpoint =
          type === "expert"
            ? `${API_URL}/api/expert-applications/${id}`
            : `${API_URL}/api/institution-applications/${id}`;

        const res = await fetch(
          endpoint,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : undefined,
          }
        );


        if(res.status === 404){

          setApplication(null);
          return;

        }


        if(!res.ok){

          throw new Error(
            "Impossible de charger la candidature."
          );

        }


        const json = await res.json();

        setApplication(
          json.application
        );


      }catch(err){

        setError(
          err instanceof Error
          ? err.message
          : "Erreur inconnue"
        );


      }finally{

        setLoading(false);

      }

    };


    if(id){
      fetchApplication();
    }


  },[id]);





  // ==========================
  // APPROVE / REJECT
  // ==========================


  const handleDecision = async(
    decision:"approve"|"reject"
  )=>{


    try{


      setActionLoading(true);
      setError("");


      const token=getAuthToken();


      const res = await fetch(
        `${API_URL}/api/expert-applications/${id}/${decision}`,
        {
          method:"PATCH",
          headers: token
          ? {
              Authorization:`Bearer ${token}`
            }
          : undefined
        }
      );


      if(!res.ok){

        throw new Error(
          "Action impossible."
        );

      }


      router.push("/admin/requests");


    }catch(err){


      setError(
        err instanceof Error
        ? err.message
        :"Erreur"
      );


    }finally{

      setActionLoading(false);

    }


  };





  // ==========================
  // OPEN GMAIL NOTIFICATION
  // ==========================


  const notifyExpert = ()=>{


    if(!application) return;



    const subject = encodeURIComponent(
      "Félicitations 🎉 Vous êtes maintenant Experte Ellevadz"
    );


    const body = encodeURIComponent(
`Bonjour ${application.fullName},

Nous avons le plaisir de vous annoncer que votre candidature a été acceptée.

🎉 Félicitations ! Vous êtes maintenant une Experte Ellevadz.

Vous pouvez rejoindre notre réseau de mentores et accompagner les femmes entrepreneures.

Bienvenue dans la communauté Ellevadz.

L'équipe Ellevadz`
    );



    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${application.email}&su=${subject}&body=${body}`,
      "_blank"
    );

  };






  // ==========================
  // LOADING
  // ==========================


  if(loading){

    return(
      <>
        <Header title="Détails candidature"/>

        <div className="p-10 text-gray-500">
          Chargement...
        </div>
      </>
    );

  }





  if(!application){


    return(
      <>
        <Header title="Détails candidature"/>

        <div className="p-10">
          Demande introuvable
        </div>

      </>
    );


  }





  return (

<>
<Header title="Détails candidature"/>


<div className="space-y-6">


<Link
href="/admin/requests"
className="flex items-center gap-2 text-rose-600"
>
<ArrowLeft size={18}/>
Retour aux demandes
</Link>



{error && (

<div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600">
{error}
</div>

)}





{/* HEADER */}

<div className="rounded-2xl border bg-white p-6">


<h1 className="text-2xl font-bold">
{application.fullName}
</h1>


<p className="text-gray-500">
{application.email}
</p>


<span className="inline-block mt-4 rounded-full bg-yellow-100 px-4 py-2 text-sm text-yellow-700">
{STATUS_LABELS[application.status]}
</span>


</div>




{/* INFORMATION */}

<div className="rounded-2xl border bg-white p-6">

<h2 className="mb-5 text-xl font-semibold">
Informations professionnelles
</h2>

<div className="space-y-3 text-sm">

{type === "expert" ? (
  <>
    <p>
      <b>Titre professionnel :</b>{" "}
      {application.title || "—"}
    </p>

    <p>
      <b>Expérience :</b>{" "}
      {application.experience || "—"}
    </p>

    <p>
      <b>Domaines :</b>{" "}
      {application.specialties || "—"}
    </p>

    <p>
      <b>Langues :</b>{" "}
      {application.languages || "—"}
    </p>

    <p>
      <b>Certifications :</b>{" "}
      {application.certifications || "—"}
    </p>
  </>
) : (
  <>
    <p>
      <b>Nom de l'institution :</b>{" "}
      {application.organizationName || "—"}
    </p>

    <p>
      <b>Type d'institution :</b>{" "}
      {application.organizationType || "—"}
    </p>

    <p>
      <b>Wilaya :</b>{" "}
      {application.wilaya || "—"}
    </p>

    <p>
      <b>Nom du contact :</b>{" "}
      {application.contactName || "—"}
    </p>

    <p>
      <b>Fonction du contact :</b>{" "}
      {application.contactRole || "—"}
    </p>

    <p>
      <b>Téléphone :</b>{" "}
      {application.phone || "—"}
    </p>

    <p>
      <b>Secteurs :</b>{" "}
      {application.sectors || "—"}
    </p>
  </>
)}

</div>

</div>





{/* LINKS */}

<div className="rounded-2xl border bg-white p-6">


<h2 className="mb-4 text-xl font-semibold">
Présence professionnelle
</h2>


<div className="space-y-3">


{application.linkedin && (

<a
href={application.linkedin}
target="_blank"
className="flex items-center gap-2 text-rose-600"
>

<ExternalLink size={16}/>
LinkedIn

</a>

)}



{application.portfolio && (

<a
href={application.portfolio}
target="_blank"
className="flex items-center gap-2 text-rose-600"
>

<ExternalLink size={16}/>
Portfolio

</a>

)}



</div>

</div>





{/* MOTIVATION */}

<div className="rounded-2xl border bg-white p-6">

<h2 className="mb-4 text-xl font-semibold">
Motivation
</h2>


<p className="text-gray-600">
{application.motivation}
</p>


</div>






{/* CV */}

<div className="rounded-2xl border bg-white p-6">


<h2 className="mb-4 text-xl font-semibold">
Documents
</h2>



{application.cvPath ? (

<a
href={`${API_URL}/${application.cvPath}`}
target="_blank"
className="flex items-center gap-3 text-rose-600"
>

<FileText size={20}/>
Voir le CV

</a>

):(


<p className="text-gray-500">
Aucun document fourni.
</p>


)}



</div>







{/* ACTIONS */}

<div className="rounded-2xl border bg-white p-6">


<h2 className="mb-5 text-xl font-semibold">
Décision
</h2>


<div className="flex flex-wrap gap-4">



<button
disabled={actionLoading}
onClick={()=>handleDecision("approve")}
className="
flex items-center gap-2
rounded-xl
bg-rose-500
px-5 py-3
text-white
hover:bg-rose-600
disabled:opacity-50
"
>

<Check size={18}/>
Accepter

</button>





<button
disabled={actionLoading}
onClick={()=>handleDecision("reject")}
className="
flex items-center gap-2
rounded-xl
border border-red-300
px-5 py-3
text-red-600
disabled:opacity-50
"
>

<X size={18}/>
Refuser

</button>





<button
onClick={notifyExpert}
className="
flex items-center gap-2
rounded-xl
bg-green-600
px-5 py-3
text-white
hover:bg-green-700
"
>

<Mail size={18}/>
Notifier

</button>




</div>


</div>



</div>

</>

);

}