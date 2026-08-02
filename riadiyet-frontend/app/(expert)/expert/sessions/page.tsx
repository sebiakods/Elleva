"use client";

import { useState } from "react";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  UserCheck,
  MessageCircle,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/common/Avatar";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import { Reveal } from "@/components/common/Reveal";


const SESSIONS = [
  {
    id:"1",
    name:"Amina Kaddour",
    topic:"Coaching Business Plan",
    requested:"Il y a 2h",
    duration:60,
    status:"pending" as const,
  },

  {
    id:"2",
    name:"Yasmine Bensaid",
    topic:"Stratégie marketing digitale",
    requested:"Hier",
    duration:45,
    status:"accepted" as const,
  },

  {
    id:"3",
    name:"Lina Tabet",
    topic:"Présentation investisseurs",
    requested:"25 juin 2026",
    duration:60,
    status:"completed" as const,
  },

  {
    id:"4",
    name:"Sara Khelil",
    topic:"Introduction à l'ANADE",
    requested:"20 juin 2026",
    duration:30,
    status:"cancelled" as const,
  },
];


const statusMap = {

  pending:{
    label:"En attente",
    tone:"gold" as const,
    icon:Clock,
  },

  accepted:{
    label:"Acceptée",
    tone:"wine" as const,
    icon:CheckCircle2,
  },

  completed:{
    label:"Terminée",
    tone:"rose" as const,
    icon:CheckCircle2,
  },

  cancelled:{
    label:"Annulée",
    tone:"neutral" as const,
    icon:XCircle,
  },

};



function SessionCard({
  s
}:{
  s: typeof SESSIONS[0]
}){


  const status = statusMap[s.status];


  return (

    <div className="card-surface p-5 shadow-card">


      {/* Header */}

      <div className="mb-4 flex items-start justify-between">


        <div className="flex items-center gap-3">

          <Avatar 
            name={s.name}
            size="sm"
          />


          <div>

            <p className="font-semibold text-ink text-sm">
              {s.name}
            </p>


            <p className="text-xs text-ink-soft flex items-center gap-1">

              <MessageCircle size={11}/>

              {s.topic}

            </p>


          </div>


        </div>


        <Badge tone={status.tone}>
          {status.label}
        </Badge>


      </div>





      {/* Info */}

      <div className="mb-4 space-y-2 text-xs text-ink-soft">


        <div className="flex items-center gap-2">

          <CalendarCheck size={12}/>

          Demande : {s.requested}

        </div>


        <div className="flex items-center gap-2">

          <Clock size={12}/>

          Durée : {s.duration} min

        </div>


      </div>






      {/* Actions */}


      {s.status === "pending" && (

        <div className="flex gap-2">


          <Button
            size="sm"
            className="flex-1"
          >

            <UserCheck size={14}/>

            Accepter

          </Button>



          <Button
            variant="secondary"
            size="sm"
          >

            <XCircle size={14}/>

            Refuser

          </Button>


        </div>

      )}







      {s.status === "accepted" && (

        <Button
          size="sm"
          className="w-full"
        >

          Créer une réunion

        </Button>

      )}







      {s.status === "completed" && (

        <Button
          variant="secondary"
          size="sm"
          className="w-full"
        >

          Voir les notes

        </Button>

      )}







      {s.status === "cancelled" && (

        <Button
          variant="secondary"
          size="sm"
          className="w-full"
        >

          Consulter l'historique

        </Button>

      )}



    </div>

  );

}







export default function ExpertSessionsPage(){


  const [search,setSearch] = useState("");



  const filter = (status:string)=>{


    return SESSIONS.filter((s)=>

      s.status === status &&

      (
        s.name
        .toLowerCase()
        .includes(search.toLowerCase())

        ||

        s.topic
        .toLowerCase()
        .includes(search.toLowerCase())
      )

    );

  };






  return (

    <>


      <Header title="Demandes de consultation" />



      <div className="mb-6 flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 w-full max-w-xs">


        <Search
          size={15}
          className="text-ink-soft"
        />


        <input

          value={search}

          onChange={(e)=>setSearch(e.target.value)}

          placeholder="Rechercher une demande…"

          className="bg-transparent text-sm outline-none placeholder:text-ink-soft/60 w-full"

        />


      </div>






      <Tabs

        tabs={[


          {

            label:`Demandes (${filter("pending").length})`,

            content:

            filter("pending").length === 0

            ?

            <div className="card-surface shadow-card">

              <EmptyState

                icon={CalendarCheck}

                title="Aucune demande"

                description="Les demandes de consultation apparaîtront ici."

              />

            </div>


            :

            <div className="grid gap-5 md:grid-cols-2">

              {
                filter("pending")
                .map((s)=>

                  <Reveal key={s.id}>

                    <SessionCard s={s}/>

                  </Reveal>

                )
              }

            </div>

          },






          {

            label:`Acceptées (${filter("accepted").length})`,

            content:

            <div className="grid gap-5 md:grid-cols-2">

              {
                filter("accepted")
                .map((s)=>

                  <Reveal key={s.id}>

                    <SessionCard s={s}/>

                  </Reveal>

                )
              }

            </div>

          },







          {

            label:`Terminées (${filter("completed").length})`,

            content:

            <div className="grid gap-5 md:grid-cols-2">

              {
                filter("completed")
                .map((s)=>

                  <Reveal key={s.id}>

                    <SessionCard s={s}/>

                  </Reveal>

                )
              }

            </div>

          },







          {

            label:`Annulées (${filter("cancelled").length})`,

            content:

            <div className="grid gap-5 md:grid-cols-2">

              {
                filter("cancelled")
                .map((s)=>

                  <Reveal key={s.id}>

                    <SessionCard s={s}/>

                  </Reveal>

                )
              }

            </div>

          },


        ]}

      />


    </>

  );

}