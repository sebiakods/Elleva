"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

export default function CreateVideoPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const handleSubmit = () => {
    console.log({
      title,
      description,
      category,
      duration,
      video,
      thumbnail,
    });

    alert("Vidéo enregistrée !");
  };

  return (
    <>
      <Header title="Ajouter une vidéo" />

      <div className="mb-6 flex items-center justify-between">

        <Button
          variant="secondary"
          onClick={() => router.push("/expert/videos")}
        >
          <ArrowLeft size={16} />
          Retour
        </Button>

        <div className="flex gap-3">

          <Button variant="secondary">
            <Save size={16} />
            Brouillon
          </Button>

          <Button onClick={handleSubmit}>
            <Send size={16} />
            Publier
          </Button>

        </div>

      </div>

      <div className="space-y-6">

        <div className="card-surface p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Informations générales
          </h2>

          <div className="space-y-5">

            <div>

              <label className="mb-2 block text-sm font-medium">
                Titre
              </label>

              <input
                className="w-full rounded-xl border p-3"
                placeholder="Titre de la vidéo..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                rows={5}
                className="w-full rounded-xl border p-3"
                placeholder="Décrivez votre vidéo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Catégorie
              </label>

              <select
                className="w-full rounded-xl border p-3"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Sélectionner</option>
                <option>Financement</option>
                <option>Entrepreneuriat</option>
                <option>Finance</option>
                <option>Business Plan</option>
                <option>Marketing</option>
              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Durée estimée
              </label>

              <input
                className="w-full rounded-xl border p-3"
                placeholder="Ex : 18:24"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />

            </div>

          </div>

        </div>

        <div className="card-surface p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Miniature
          </h2>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 hover:bg-slate-50">

            <Upload size={40} className="mb-3 text-rose-500"/>

            <p>Choisir une image</p>

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e)=>{
                if(e.target.files?.length){
                  setThumbnail(e.target.files[0]);
                }
              }}
            />

          </label>

          {thumbnail && (
            <p className="mt-3 text-green-600 text-sm">
              ✓ {thumbnail.name}
            </p>
          )}

        </div>

        <div className="card-surface p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Vidéo
          </h2>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 hover:bg-slate-50">

            <Video size={44} className="mb-3 text-rose-500"/>

            <p className="font-medium">
              Importer une vidéo
            </p>

            <p className="text-sm text-gray-500 mt-2">
              MP4 • MOV • AVI • WEBM
            </p>

            <input
              type="file"
              accept="video/*"
              hidden
              onChange={(e)=>{
                if(e.target.files?.length){
                  setVideo(e.target.files[0]);
                }
              }}
            />

          </label>

          {video && (
            <div className="mt-4 rounded-xl border bg-slate-50 p-4">

              <p className="font-medium">
                {video.name}
              </p>

              <p className="text-sm text-gray-500">
                {(video.size / 1024 / 1024).toFixed(2)} MB
              </p>

            </div>
          )}

        </div>

        <div className="card-surface p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Aperçu
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-gray-500">Titre</span>
              <span>{title || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Catégorie</span>
              <span>{category || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Durée</span>
              <span>{duration || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Miniature</span>
              <span>{thumbnail ? thumbnail.name : "Aucune"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Vidéo</span>
              <span>{video ? video.name : "Aucune"}</span>
            </div>

          </div>

        </div>

        <div className="flex justify-end gap-4 pb-10">

          <Button
            variant="secondary"
            onClick={() => router.push("/expert/videos")}
          >
            Annuler
          </Button>

          <Button variant="secondary">
            <Save size={16}/>
            Enregistrer
          </Button>

          <Button onClick={handleSubmit}>
            <Send size={16}/>
            Publier la vidéo
          </Button>

        </div>

      </div>
    </>
  );
}