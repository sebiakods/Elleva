"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import authService from "@/services/auth";


const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api")
    .replace(/\/$/, "");



interface User {

  id:string;
  name:string;
  email:string;
  role:string;
  isActive:boolean;
  isVerified:boolean;
  createdAt:string;

}



export default function UserProfilePage(){


  const params = useParams();

  const router = useRouter();


  const id =
    params.id as string;



  const [user,setUser] =
    useState<User|null>(null);


  const [loading,setLoading] =
    useState(true);





  useEffect(()=>{


    async function loadUser(){


      try{


        const token =
          authService.getToken();



        const res =
          await fetch(
            `${API_URL}/api/users/${id}`,
            {

              headers:{
                Authorization:`Bearer ${token}`,
              },

            }
          );



        const data =
          await res.json();



        console.log(
  "USER PROFILE:",
  JSON.stringify(data, null, 2)
);


const profile =
  data?.data?.user ??
  data?.data ??
  data;


console.log(
  "PROFILE USED:",
  profile
);


setUser(profile);


      }
      catch(error){

        console.error(
          error
        );

      }
      finally{

        setLoading(false);

      }


    }



    if(id)
      loadUser();



  },[id]);







  if(loading){

    return (
      <div className="p-8">
        Chargement...
      </div>
    );

  }






  if(!user){

    return (

      <div className="p-8">

        Utilisateur introuvable

      </div>

    );

  }







return (

<div className="p-8">


<button

onClick={()=>router.back()}

className="
mb-5
rounded-lg
border
px-4
py-2
"

>

← Retour

</button>





<div
className="
rounded-xl
bg-white
p-6
shadow
space-y-4
"
>


<h1 className="text-2xl font-bold">

Profil utilisateur

</h1>




<div>

<strong>Nom :</strong>

{" "}

{user.name}

</div>





<div>

<strong>Email :</strong>

{" "}

{user.email}

</div>





<div>

<strong>Rôle :</strong>

{" "}

{user.role}

</div>





<div>

<strong>Statut :</strong>

{" "}

{
user.isActive
?
"Actif"
:
"Suspendu"
}

</div>





<div>

<strong>Inscrit le :</strong>

{" "}

{
new Date(
user.createdAt
)
.toLocaleDateString(
"fr-FR"
)
}

</div>




</div>


</div>

);


}