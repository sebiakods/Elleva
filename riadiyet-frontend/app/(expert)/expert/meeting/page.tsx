"use client";

import { useState } from "react";
import {
  Calendar,
  Video,
  Users,
  Link2,
  Plus,
  Bell,
  X,
  Search,
} from "lucide-react";


const users = [
  {
    id: "1",
    name: "Amina Kaddour",
    role: "Entrepreneure",
  },
  {
    id: "2",
    name: "Yasmine Bensaid",
    role: "Entrepreneure",
  },
  {
    id: "3",
    name: "Lina Tabet",
    role: "Entrepreneure",
  },
  {
    id: "4",
    name: "Sara Benali",
    role: "Entrepreneure",
  },
];


const meetings = [
  {
    id: "1",
    title: "Révision plan financier",
    member: "Amina Kaddour",
    date: "Aujourd'hui - 15:00",
    platform: "Google Meet",
  },
  {
    id: "2",
    title: "Stratégie marketing",
    member: "Yasmine Bensaid",
    date: "Demain - 10:30",
    platform: "Zoom",
  },
];


export default function MeetingPage() {


  const [openMembers, setOpenMembers] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  const [search, setSearch] = useState("");



  const filteredUsers = users.filter((user)=>
    user.name
    .toLowerCase()
    .includes(search.toLowerCase())
  );



  function toggleUser(user:any){

    const exists = selectedUsers.some(
      (u)=>u.id===user.id
    );


    if(exists){

      setSelectedUsers(
        selectedUsers.filter(
          (u)=>u.id!==user.id
        )
      );

    }else{

      setSelectedUsers([
        ...selectedUsers,
        user
      ]);

    }

  }



  return (

<div className="p-6 lg:p-10">


{/* HEADER */}

<div className="
flex
flex-col
gap-5
md:flex-row
md:items-center
md:justify-between
">


<div>

<h1 className="text-3xl font-bold text-ink">
Réunions
</h1>


<p className="mt-2 text-gray-600">
Organisez vos rendez-vous avec les entrepreneures.
</p>


</div>



<button
className="
flex
items-center
gap-2
rounded-full
bg-rise-gradient
px-6
py-3
font-semibold
text-white
shadow-bloom
hover:-translate-y-1
transition
"
>

<Plus size={18}/>

Nouvelle réunion

</button>


</div>





{/* CREATE MEETING */}


<div
className="
mt-8
rounded-3xl
border
border-rose-100
bg-white
p-6
shadow-sm
"
>


<div className="flex items-center gap-3">


<div
className="
rounded-2xl
bg-wine-50
p-3
text-wine-600
"
>

<Video size={22}/>

</div>



<div>

<h2 className="text-xl font-semibold">
Créer une réunion
</h2>


<p className="text-sm text-gray-500">
Ajoutez un lien et invitez les membres.
</p>


</div>


</div>





<div className="
mt-6
grid
gap-4
md:grid-cols-2
">


<input
placeholder="Titre de la réunion"
className="
rounded-2xl
border
border-sand-200
bg-sand-50
p-3
"
/>



<select
className="
rounded-2xl
border
border-sand-200
bg-sand-50
p-3
"
>

<option>
Plateforme
</option>

<option>
Google Meet
</option>

<option>
Zoom
</option>

<option>
Microsoft Teams
</option>

</select>




<input
placeholder="Lien de réunion"
className="
rounded-2xl
border
border-sand-200
bg-sand-50
p-3
"
/>



<input
type="datetime-local"
className="
rounded-2xl
border
border-sand-200
bg-sand-50
p-3
"
/>



</div>





{/* MEMBERS */}


<div className="mt-6">


<label className="
mb-3
flex
items-center
gap-2
font-semibold
">

<Users size={18}/>

Membres invités

</label>



<button
onClick={()=>setOpenMembers(true)}
className="
w-full
rounded-2xl
border
border-sand-200
bg-sand-50
p-4
text-left
hover:border-rose-300
transition
"
>

+ Sélectionner les membres

</button>





<div className="
mt-3
flex
flex-wrap
gap-2
">


{
selectedUsers.map(user=>(

<span
key={user.id}
className="
flex
items-center
gap-2
rounded-full
bg-rose-50
px-4
py-2
text-sm
text-wine-700
"
>

{user.name}


<X
size={14}
className="cursor-pointer"
onClick={()=>
toggleUser(user)
}
/>


</span>

))
}


</div>


</div>





<button
className="
mt-6
flex
items-center
gap-2
rounded-full
bg-wine-600
px-6
py-3
font-semibold
text-white
hover:bg-wine-700
transition
"
>

<Bell size={18}/>

Créer et envoyer les notifications

</button>



</div>








{/* UPCOMING */}


<div className="mt-10">


<h2 className="text-xl font-bold">
Réunions à venir
</h2>



<div className="
mt-5
grid
gap-5
lg:grid-cols-2
">


{
meetings.map(meeting=>(


<div
key={meeting.id}
className="
rounded-3xl
border
border-sand-200
bg-white
p-6
shadow-sm
hover:shadow-md
transition
"
>


<h3 className="text-lg font-semibold">
{meeting.title}
</h3>



<p className="mt-1 text-gray-600">
{meeting.member}
</p>




<div className="
mt-4
flex
items-center
gap-2
text-sm
text-gray-500
">

<Calendar size={16}/>

{meeting.date}

</div>




<div className="
mt-2
flex
items-center
gap-2
text-sm
text-gray-500
">

<Link2 size={16}/>

{meeting.platform}

</div>



<button
className="
mt-5
w-full
rounded-full
border
border-rose-300
py-3
font-semibold
text-wine-600
hover:bg-rose-50
"
>

Rejoindre

</button>



</div>


))
}


</div>


</div>








{/* MEMBER MODAL */}



{
openMembers && (


<div
className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-black/30
p-5
"
>


<div
className="
w-full
max-w-lg
rounded-3xl
bg-white
p-6
shadow-xl
"
>


<h2 className="text-xl font-bold">
Inviter des membres
</h2>


<p className="mt-1 text-sm text-gray-500">
Sélectionnez les entrepreneures.
</p>




<div
className="
mt-5
flex
items-center
gap-2
rounded-2xl
border
p-3
"
>

<Search size={18}/>


<input
placeholder="Rechercher..."
className="outline-none flex-1"
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>


</div>





<div className="mt-4 space-y-3">


{
filteredUsers.map(user=>{


const checked =
selectedUsers.some(
(u)=>u.id===user.id
);



return (

<label
key={user.id}
className="
flex
items-center
justify-between
rounded-2xl
border
p-4
cursor-pointer
hover:bg-sand-50
"
>


<div>

<p className="font-semibold">
{user.name}
</p>


<p className="text-sm text-gray-500">
{user.role}
</p>


</div>


<input
type="checkbox"
checked={checked}
onChange={()=>toggleUser(user)}
/>


</label>


)

})
}



</div>




<div
className="
mt-6
flex
justify-end
gap-3
"
>


<button
onClick={()=>setOpenMembers(false)}
className="
rounded-full
px-5
py-2
text-gray-600
"
>
Annuler
</button>



<button
onClick={()=>setOpenMembers(false)}
className="
rounded-full
bg-wine-600
px-6
py-2
text-white
"
>

Ajouter

</button>


</div>



</div>


</div>


)

}



</div>

  );
}