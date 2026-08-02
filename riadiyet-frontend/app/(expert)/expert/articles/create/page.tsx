"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Save,
  Send,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

export default function CreateArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [cover, setCover] = useState<File | null>(null);

  const handleSubmit = () => {
    console.log({
      title,
      summary,
      category,
      content,
      tags,
      cover,
    });

    alert("Article enregistré !");
  };

  return (
    <>
      <Header title="Rédiger un article" />

      <div className="mb-6 flex items-center justify-between">

        <Button
          variant="secondary"
          onClick={() => router.push("/expert/articles")}
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
                placeholder="Titre de l'article..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Résumé
              </label>

              <textarea
                rows={3}
                className="w-full rounded-xl border p-3"
                placeholder="Petit résumé..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
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
                <option>Business Plan</option>
                <option>Finance</option>
                <option>Marketing</option>
                <option>Leadership</option>
                <option>Digital</option>
              </select>

            </div>

          </div>

        </div>

        <div className="card-surface p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Image de couverture
          </h2>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center hover:bg-slate-50">

            <ImageIcon size={42} className="mb-3 text-rose-500"/>

            <p className="font-medium">
              Choisir une image
            </p>

            <p className="text-sm text-gray-500">
              PNG • JPG • WEBP
            </p>

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e)=>{
                if(e.target.files?.length){
                  setCover(e.target.files[0]);
                }
              }}
            />

          </label>

          {cover && (
            <p className="mt-3 text-sm text-green-600">
              ✓ {cover.name}
            </p>
          )}

        </div>

        <div className="card-surface p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Contenu de l'article
          </h2>

          <textarea
            rows={18}
            className="w-full rounded-xl border p-4"
            placeholder="Commencez à écrire votre article..."
            value={content}
            onChange={(e)=>setContent(e.target.value)}
          />

        </div>

        <div className="card-surface p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Tags
          </h2>

          <input
            className="w-full rounded-xl border p-3"
            placeholder="startup, financement, entrepreneuriat..."
            value={tags}
            onChange={(e)=>setTags(e.target.value)}
          />

        </div>

        <div className="card-surface p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Aperçu
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-gray-500">Titre</span>
              <span className="font-medium">{title || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Catégorie</span>
              <span className="font-medium">{category || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Image</span>
              <span className="font-medium">
                {cover ? cover.name : "Aucune"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Longueur</span>
              <span className="font-medium">
                {content.length} caractères
              </span>
            </div>

          </div>

        </div>

        <div className="flex justify-end gap-4 pb-10">

          <Button
            variant="secondary"
            onClick={() => router.push("/expert/articles")}
          >
            Annuler
          </Button>

          <Button variant="secondary">
            <Save size={16}/>
            Enregistrer
          </Button>

          <Button onClick={handleSubmit}>
            <Send size={16}/>
            Publier l'article
          </Button>

        </div>

      </div>
    </>
  );
}