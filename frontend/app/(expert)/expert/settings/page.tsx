"use client";

import { useState } from "react";
import {
  Bell,
  Lock,
  Globe,
  CalendarClock,
  CreditCard,
  User,
  Save,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";


export default function ExpertSettingsPage() {

  const [notifications, setNotifications] = useState(true);


  return (
    <>

      <Header title="Paramètres" />


      <div className="space-y-6">


        {/* PROFILE */}

        <div className="card-surface p-6 shadow-card">

          <div className="flex items-center gap-3 mb-5">

            <div className="rounded-xl bg-rose-50 p-3 text-rose-500">
              <User size={22}/>
            </div>

            <div>
              <h2 className="font-semibold text-ink">
                Profil expert
              </h2>

              <p className="text-sm text-ink-soft">
                Gérez vos informations professionnelles.
              </p>
            </div>

          </div>


          <div className="grid gap-4 md:grid-cols-2">


            <input
              defaultValue="Amel Expert"
              className="
              rounded-xl
              border
              border-sand-200
              bg-white
              p-3
              text-sm
              "
              placeholder="Nom"
            />


            <input
              defaultValue="expert@email.com"
              className="
              rounded-xl
              border
              border-sand-200
              bg-white
              p-3
              text-sm
              "
              placeholder="Email"
            />


          </div>


        </div>





        {/* LANGUAGE */}

        <div className="card-surface p-6 shadow-card">


          <div className="flex items-center gap-3 mb-5">

            <div className="rounded-xl bg-rose-50 p-3 text-rose-500">
              <Globe size={22}/>
            </div>

            <div>
              <h2 className="font-semibold text-ink">
                Langue
              </h2>

              <p className="text-sm text-ink-soft">
                Choisissez la langue de l'espace experte.
              </p>
            </div>

          </div>


          <select
            className="
            rounded-xl
            border
            border-sand-200
            p-3
            "
          >

            <option>Français</option>
            <option>العربية</option>
            <option>English</option>

          </select>


        </div>







        {/* NOTIFICATIONS */}

        <div className="card-surface p-6 shadow-card">


          <div className="flex items-center justify-between">


            <div className="flex items-center gap-3">


              <div className="rounded-xl bg-rose-50 p-3 text-rose-500">
                <Bell size={22}/>
              </div>


              <div>

                <h2 className="font-semibold text-ink">
                  Notifications
                </h2>

                <p className="text-sm text-ink-soft">
                  Recevoir les rappels de sessions et messages.
                </p>

              </div>


            </div>




            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="h-5 w-5"
            />


          </div>


        </div>







        {/* AVAILABILITY */}

        <div className="card-surface p-6 shadow-card">


          <div className="flex items-center gap-3 mb-5">

            <div className="rounded-xl bg-rose-50 p-3 text-rose-500">
              <CalendarClock size={22}/>
            </div>


            <div>

              <h2 className="font-semibold text-ink">
                Disponibilités
              </h2>

              <p className="text-sm text-ink-soft">
                Définissez vos horaires pour les rendez-vous.
              </p>

            </div>


          </div>


          <div className="grid gap-4 md:grid-cols-2">


            <input
              type="time"
              className="rounded-xl border border-sand-200 p-3"
            />


            <input
              type="time"
              className="rounded-xl border border-sand-200 p-3"
            />


          </div>


        </div>







        {/* SESSION PRICE */}

        <div className="card-surface p-6 shadow-card">


          <div className="flex items-center gap-3 mb-5">

            <div className="rounded-xl bg-rose-50 p-3 text-rose-500">
              <CreditCard size={22}/>
            </div>


            <div>

              <h2 className="font-semibold text-ink">
                Tarif des sessions
              </h2>

              <p className="text-sm text-ink-soft">
                Définissez le prix d'une consultation.
              </p>

            </div>


          </div>



          <input
            type="number"
            placeholder="Prix en DA"
            className="
            rounded-xl
            border
            border-sand-200
            p-3
            "
          />


        </div>







        {/* PASSWORD */}

        <div className="card-surface p-6 shadow-card">


          <div className="flex items-center gap-3 mb-5">

            <div className="rounded-xl bg-rose-50 p-3 text-rose-500">
              <Lock size={22}/>
            </div>


            <div>

              <h2 className="font-semibold text-ink">
                Mot de passe
              </h2>

              <p className="text-sm text-ink-soft">
                Modifier votre mot de passe.
              </p>

            </div>

          </div>


          <Button>
            Modifier le mot de passe
          </Button>


        </div>






        <Button>
          <Save size={16}/>
          Enregistrer les modifications
        </Button>



      </div>

    </>
  );
}