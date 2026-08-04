"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Plus,
  Landmark,
  Calendar,
  Users,
  Trash2,
  Pencil,
  Eye,
  MoreHorizontal,
  Filter,
  Wallet,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";


type ProgramStatus = "published" | "draft" | "closed";


interface Program {
  id: number;
  title: string;
  category: string;
  amount: string;
  applications: number;
  openingDate: string;
  closingDate: string;
  status: ProgramStatus;
}


export default function InstitutionProgramsPage() {

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");


  useEffect(() => {

    async function loadPrograms(){

      try{

        const token =
          localStorage.getItem("accessToken");


        const res = await fetch(
          `${API_URL}/programs`,
          {
            headers:{
              Authorization:`Bearer ${token}`,
            }
          }
        );


        const data = await res.json();


        const items =
          data.data?.items ||
          data.items ||
          data ||
          [];


        setPrograms(
          items.map((p:any)=>({

            id:p.id,

            title:p.title,

            category:
              p.category || "Autre",

            amount:
              p.amount ||
              `${p.amountMin ?? 0} - ${p.amountMax ?? 0} DZD`,

            applications:
              p.applications ??
              0,

            openingDate:
              p.openingDate ||
              "-",

            closingDate:
              p.closingDate ||
              "-",

            status:
              p.isPublished
                ? "published"
                : "draft"

          }))
        );


      }catch(error){

        console.error(
          "Loading programs:",
          error
        );

      }

    }


    loadPrograms();


  },[API_URL]);




  async function deleteProgram(
    id:number,
    title:string
  ){

    if(
      !confirm(
        `Supprimer "${title}" ?`
      )
    )
    return;


    try{


      const token =
        localStorage.getItem("accessToken");


      const res =
        await fetch(
          `${API_URL}/programs/${id}`,
          {
            method:"DELETE",

            headers:{
              Authorization:
              `Bearer ${token}`,
            },
          }
        );



      if(!res.ok){

        const error =
          await res.json();

        alert(
          error.message ||
          "Erreur suppression"
        );

        return;

      }



      setPrograms(prev =>
        prev.filter(
          p=>p.id !== id
        )
      );


    }catch(error){

      console.error(error);

      alert(
        "Erreur serveur"
      );

    }

  }





  const filteredPrograms =
    useMemo(()=>{

      return programs.filter(program=>{


        const matchesSearch =

          program.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )

          ||

          program.category
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );



        const matchesFilter =

          filter === "all"

          ||

          program.status === filter;



        return (
          matchesSearch &&
          matchesFilter
        );

      });


    },[
      programs,
      search,
      filter
    ]);




  const published =
    programs.filter(
      p=>p.status==="published"
    ).length;



  const drafts =
    programs.filter(
      p=>p.status==="draft"
    ).length;



  const totalApplications =
    programs.reduce(
      (sum,p)=>
      sum+p.applications,
      0
    );



  return (
<>
<Header title="Programmes de financement"/>


<div className="mx-auto max-w-7xl space-y-8">


{/* HERO */}

<div className="
flex flex-col gap-6 rounded-3xl 
bg-gradient-to-r from-rose-600 to-fuchsia-600 
p-8 text-white 
lg:flex-row lg:items-center lg:justify-between
">

<div>

<Badge tone="gold">
Offres publiées
</Badge>


<h1 className="mt-4 font-display text-4xl">
Programmes de financement
</h1>


<p className="mt-3 max-w-2xl text-white/90">
Gérez tous vos programmes de financement.
Publiez de nouvelles opportunités,
suivez les candidatures et modifiez vos offres.
</p>


</div>



<Link href="/institution/programs/new">

<Button className="
bg-white text-rose-600 
hover:bg-white/90
">

<Plus size={18}/>

Publier un programme

</Button>

</Link>


</div>
{/* STATISTICS */}

<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">


<Card hover={false}>
<div className="flex items-center justify-between">

<div>
<p className="text-sm text-ink-soft">
Programmes
</p>

<h2 className="mt-2 text-3xl font-bold">
{programs.length}
</h2>
</div>


<div className="rounded-2xl bg-rose-100 p-4 text-rose-600">
<Landmark size={24}/>
</div>


</div>
</Card>



<Card hover={false}>
<div className="flex items-center justify-between">

<div>
<p className="text-sm text-ink-soft">
Publiés
</p>

<h2 className="mt-2 text-3xl font-bold">
{published}
</h2>
</div>


<div className="rounded-2xl bg-green-100 p-4 text-green-600">
<Eye size={24}/>
</div>

</div>
</Card>



<Card hover={false}>
<div className="flex items-center justify-between">

<div>
<p className="text-sm text-ink-soft">
Brouillons
</p>

<h2 className="mt-2 text-3xl font-bold">
{drafts}
</h2>
</div>


<div className="rounded-2xl bg-amber-100 p-4 text-amber-600">
<Pencil size={24}/>
</div>

</div>
</Card>




<Card hover={false}>
<div className="flex items-center justify-between">

<div>
<p className="text-sm text-ink-soft">
Candidatures
</p>

<h2 className="mt-2 text-3xl font-bold">
{totalApplications}
</h2>
</div>


<div className="rounded-2xl bg-blue-100 p-4 text-blue-600">
<Users size={24}/>
</div>

</div>
</Card>


</div>





{/* SEARCH */}

<Card hover={false}>

<div className="flex flex-col gap-4 lg:flex-row">


<div className="relative flex-1">

<Search
size={18}
className="
absolute left-4 top-1/2 
-translate-y-1/2 
text-ink-soft
"
/>


<Input

placeholder="Rechercher un programme..."

className="pl-11"

value={search}

onChange={
e=>setSearch(e.target.value)
}

/>


</div>




<div className="flex items-center gap-3">

<Filter size={18}/>


<select

className="
rounded-xl border border-sand-200 
bg-white px-4 py-3
"

value={filter}

onChange={
e=>setFilter(e.target.value)
}

>


<option value="all">
Tous
</option>


<option value="published">
Publiés
</option>


<option value="draft">
Brouillons
</option>


<option value="closed">
Clôturés
</option>


</select>


</div>


</div>

</Card>





{/* PROGRAM LIST */}

<div className="space-y-5">


{
filteredPrograms.map(program=>(


<Card

key={program.id}

hover={false}

className="
transition hover:shadow-lg
"

>


<div className="
flex flex-col gap-6 
lg:flex-row lg:items-center 
lg:justify-between
">



<div className="space-y-4 flex-1">


<div className="flex items-center gap-3">


<h2 className="
text-2xl font-display
">

{program.title}

</h2>



<Badge

tone={
program.status==="published"
? "rose"
: program.status==="draft"
? "gold"
: "neutral"
}

>


{
program.status==="published"
? "Publié"
: program.status==="draft"
? "Brouillon"
: "Clôturé"
}


</Badge>


</div>





<div className="
flex flex-wrap gap-6 
text-sm text-ink-soft
">



<div className="flex items-center gap-2">

<Wallet size={16}/>

{program.amount}

</div>




<div className="flex items-center gap-2">

<Landmark size={16}/>

{program.category}

</div>





<div className="flex items-center gap-2">

<Users size={16}/>

{program.applications}
candidatures

</div>




<div className="flex items-center gap-2">

<Calendar size={16}/>

{program.openingDate}

→

{program.closingDate}

</div>



</div>



</div>






<div className="flex gap-3">


<Link href={`/institution/programs/${program.id}`}>

<Button variant="outline">

<Eye size={17}/>

Voir

</Button>


</Link>





<Button

variant="outline"

className="
text-red-600 
hover:text-red-700
"

onClick={()=>
deleteProgram(
program.id,
program.title
)
}

>


<Trash2 size={17}/>

Supprimer


</Button>





<Button

variant="ghost"

onClick={()=>
alert(
`Actions pour "${program.title}"`
)
}

>

<MoreHorizontal size={18}/>

</Button>



</div>



</div>


</Card>


))
}





{
filteredPrograms.length===0 && (

<Card hover={false}>

<div className="py-16 text-center">


<Landmark

size={48}

className="
mx-auto mb-5 text-sand-400
"

/>


<h3 className="text-xl font-semibold">

Aucun programme trouvé

</h3>



<p className="mt-2 text-ink-soft">

Essayez une autre recherche ou créez votre premier programme.

</p>




<Link href="/institution/programs/new">

<Button className="mt-6">

<Plus size={18}/>

Publier un programme


</Button>


</Link>



</div>


</Card>


)

}



</div>



</div>

</>

);

}