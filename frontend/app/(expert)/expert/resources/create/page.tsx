"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  FileText,
  FolderOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

export default function CreateResourcePage() {

  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");

  const handleSubmit = () => {

    console.log({
      title,
      description,
      type,
      category,
      file,
    });

    alert("Ressource enregistrée !");
  };


  return (
    <>
      <Header title="Ajouter une ressource" />


      <div className="mb-6 flex items-center justify-between">

        <Button
          variant="secondary"
          onClick={() => router.push("/expert/resources")}
        >
          <ArrowLeft size={16}/>
          Retour
        </Button>


        <div className="flex gap-3">

          <Button variant="secondary">
            <Save size={16}/>
            Brouillon
          </Button>


          <Button onClick={handleSubmit}>
            <Send size={16}/>
            Publier
          </Button>

        </div>

      </div>



      <div className="space-y-6">


        {/* Informations */}

        <div className="card-surface p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Informations générales
          </h2>


          <div className="space-y-5">


            <div>

              <label className="mb-2 block text-sm font-medium">
                Nom de la ressource
              </label>


              <input
                className="w-full rounded-xl border p-3"
                placeholder="Ex : Template Business Plan complet"
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
              />

            </div>



            <div>

              <label className="mb-2 block text-sm font-medium">
                Description
              </label>


              <textarea
                rows={5}
                className="w-full rounded-xl border p-3"
                placeholder="Décrivez cette ressource..."
                value={description}
                onChange={(e)=>setDescription(e.target.value)}
              />

            </div>



            <div>

              <label className="mb-2 block text-sm font-medium">
                Catégorie
              </label>


              <select
                className="w-full rounded-xl border p-3"
                value={category}
                onChange={(e)=>setCategory(e.target.value)}
              >

                <option value="">
                  Sélectionner
                </option>

                <option>
                  Finance
                </option>

                <option>
                  Business Plan
                </option>

                <option>
                  Entrepreneuriat
                </option>

                <option>
                  Marketing
                </option>

              </select>

            </div>


          </div>

        </div>




        {/* Type */}

        <div className="card-surface p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Type de ressource
          </h2>


          <select
            className="w-full rounded-xl border p-3"
            value={type}
            onChange={(e)=>setType(e.target.value)}
          >

            <option value="pdf">
              PDF
            </option>

            <option value="template">
              Template
            </option>

            <option value="spreadsheet">
              Spreadsheet Excel
            </option>

            <option value="presentation">
              Présentation PowerPoint
            </option>

            <option value="other">
              Autre fichier
            </option>


          </select>


        </div>





        {/* Upload */}

        <div className="card-surface p-6">


          <h2 className="mb-5 text-lg font-semibold">
            Fichier
          </h2>



          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 hover:bg-slate-50">


            <Upload
              size={45}
              className="mb-3 text-rose-500"
            />


            <p className="font-medium">
              Importer une ressource
            </p>


            <p className="mt-2 text-sm text-gray-500">
              PDF • DOCX • XLSX • PPTX • ZIP
            </p>



            <input
              type="file"
              hidden
              accept="
                .pdf,
                .doc,
                .docx,
                .xls,
                .xlsx,
                .ppt,
                .pptx,
                .zip
              "
              onChange={(e)=>{

                if(e.target.files?.length){
                  setFile(e.target.files[0]);
                }

              }}
            />


          </label>



          {file && (

            <div className="mt-4 flex items-center gap-3 rounded-xl border bg-slate-50 p-4">


              <FileText size={25}/>


              <div>

                <p className="font-medium">
                  {file.name}
                </p>


                <p className="text-sm text-gray-500">

                  {(file.size / 1024 / 1024).toFixed(2)}
                  {" "}Mo

                </p>


              </div>


            </div>

          )}


        </div>






        {/* Preview */}

        <div className="card-surface p-6">


          <h2 className="mb-5 text-lg font-semibold">
            Aperçu
          </h2>


          <div className="space-y-3 text-sm">


            <div className="flex justify-between">
              <span className="text-gray-500">
                Nom
              </span>

              <span>
                {title || "-"}
              </span>

            </div>



            <div className="flex justify-between">

              <span className="text-gray-500">
                Type
              </span>

              <span>
                {type}
              </span>

            </div>



            <div className="flex justify-between">

              <span className="text-gray-500">
                Catégorie
              </span>

              <span>
                {category || "-"}
              </span>

            </div>



            <div className="flex justify-between">

              <span className="text-gray-500">
                Fichier
              </span>


              <span>
                {file ? file.name : "Aucun"}
              </span>

            </div>


          </div>


        </div>






        <div className="flex justify-end gap-4 pb-10">


          <Button
            variant="secondary"
            onClick={()=>router.push("/expert/resources")}
          >
            Annuler
          </Button>


          <Button variant="secondary">

            <Save size={16}/>
            Enregistrer

          </Button>



          <Button onClick={handleSubmit}>

            <Send size={16}/>
            Publier la ressource

          </Button>


        </div>


      </div>

    </>
  );
}