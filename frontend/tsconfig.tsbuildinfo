
"use client";

import { ChangeEvent, ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Check,
  FileText,
  Film,
  FolderOpen,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type ContentType = "article" | "video" | "resource";

type CourseContent = {
  id: string;
  type: ContentType;

  title: string;
  description: string;

  /* Article */
  content?: string;
  articleFile?: File | null;

  /* Video */
  videoUrl?: string;
  videoFile?: File | null;

  /* Resource */
  resourceUrl?: string;
  resourceFile?: File | null;
};

const CATEGORIES = [
  "Financement",
  "Business Plan",
  "Marketing",
  "Juridique",
  "Comptabilité",
  "Tech & Digital",
  "Ressources humaines",
];

const LEVELS = [
  "Débutant",
  "Intermédiaire",
  "Avancé",
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB


export default function CreateCoursePage() {
  const router = useRouter();

  /* ---------------------------------------------------------------------- */
  /* COURSE                                                                  */
  /* ---------------------------------------------------------------------- */

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");

  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] =
    useState<string | null>(null);


  /* ---------------------------------------------------------------------- */
  /* CONTENT                                                                 */
  /* ---------------------------------------------------------------------- */

  const [contents, setContents] =
    useState<CourseContent[]>([]);

  const [activeType, setActiveType] =
    useState<ContentType | null>(null);


  /* ---------------------------------------------------------------------- */
  /* ARTICLE FORM                                                            */
  /* ---------------------------------------------------------------------- */

  const [articleTitle, setArticleTitle] = useState("");
  const [articleDescription, setArticleDescription] =
    useState("");
  const [articleContent, setArticleContent] =
    useState("");

  const [articleFile, setArticleFile] =
    useState<File | null>(null);


  /* ---------------------------------------------------------------------- */
  /* VIDEO FORM                                                              */
  /* ---------------------------------------------------------------------- */

  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] =
    useState("");

  const [videoUrl, setVideoUrl] = useState("");

  const [videoFile, setVideoFile] =
    useState<File | null>(null);


  /* ---------------------------------------------------------------------- */
  /* RESOURCE FORM                                                           */
  /* ---------------------------------------------------------------------- */

  const [resourceTitle, setResourceTitle] =
    useState("");

  const [resourceDescription, setResourceDescription] =
    useState("");

  const [resourceUrl, setResourceUrl] =
    useState("");

  const [resourceFile, setResourceFile] =
    useState<File | null>(null);


  /* ---------------------------------------------------------------------- */
  /* SAVE                                                                    */
  /* ---------------------------------------------------------------------- */

  const [saving, setSaving] = useState(false);


  /* ====================================================================== */
  /* FILE HELPERS                                                            */
  /* ====================================================================== */

  const validateFile = (
    file: File,
    allowedTypes: string[],
  ) => {
    if (file.size > MAX_FILE_SIZE) {
      alert(
        `Le fichier "${file.name}" dépasse la taille maximale de 100 MB.`,
      );

      return false;
    }

    if (
      allowedTypes.length > 0 &&
      !allowedTypes.includes(file.type)
    ) {
      alert(
        `Le type de fichier "${file.type || "inconnu"}" n'est pas autorisé.`,
      );

      return false;
    }

    return true;
  };


  /* ====================================================================== */
  /* COVER                                                                   */
  /* ====================================================================== */

  const handleCoverChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setCover(null);
      setCoverPreview(null);
      return;
    }

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!validateFile(file, allowed)) {
      event.target.value = "";
      return;
    }

    setCover(file);

    const preview =
      URL.createObjectURL(file);

    setCoverPreview(preview);
  };


  /* ====================================================================== */
  /* ARTICLE FILE                                                            */
  /* ====================================================================== */

  const handleArticleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setArticleFile(null);
      return;
    }

    const allowed = [
      "application/pdf",
    ];

    if (!validateFile(file, allowed)) {
      event.target.value = "";
      return;
    }

    setArticleFile(file);
  };


  /* ====================================================================== */
  /* VIDEO FILE                                                              */
  /* ====================================================================== */

  const handleVideoFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setVideoFile(null);
      return;
    }

    const allowed = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ];

    if (!validateFile(file, allowed)) {
      event.target.value = "";
      return;
    }

    setVideoFile(file);
  };


  /* ====================================================================== */
  /* RESOURCE FILE                                                           */
  /* ====================================================================== */

  const handleResourceFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setResourceFile(null);
      return;
    }

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/zip",
      "application/x-zip-compressed",
      "text/plain",
    ];

    if (!validateFile(file, allowed)) {
      event.target.value = "";
      return;
    }

    setResourceFile(file);
  };


  /* ====================================================================== */
  /* RESET CONTENT FORMS                                                     */
  /* ====================================================================== */

  const resetContentForm = () => {
    setArticleTitle("");
    setArticleDescription("");
    setArticleContent("");
    setArticleFile(null);

    setVideoTitle("");
    setVideoDescription("");
    setVideoUrl("");
    setVideoFile(null);

    setResourceTitle("");
    setResourceDescription("");
    setResourceUrl("");
    setResourceFile(null);
  };


  /* ====================================================================== */
  /* ADD ARTICLE                                                             */
  /* ====================================================================== */

  const addArticle = () => {
    if (!articleTitle.trim()) {
      alert("Veuillez renseigner le titre de l'article.");
      return;
    }

    if (!articleContent.trim() && !articleFile) {
      alert(
        "Ajoutez le contenu de l'article ou un fichier PDF.",
      );
      return;
    }

    const newContent: CourseContent = {
      id: crypto.randomUUID(),
      type: "article",

      title: articleTitle.trim(),

      description:
        articleDescription.trim(),

      content:
        articleContent.trim(),

      articleFile,
    };

    setContents((current) => [
      ...current,
      newContent,
    ]);

    resetContentForm();
    setActiveType(null);
  };


  /* ====================================================================== */
  /* ADD VIDEO                                                               */
  /* ====================================================================== */

  const addVideo = () => {
    if (!videoTitle.trim()) {
      alert("Veuillez renseigner le titre de la vidéo.");
      return;
    }

    if (!videoUrl.trim() && !videoFile) {
      alert(
        "Ajoutez une URL vidéo ou sélectionnez une vidéo.",
      );
      return;
    }

    const newContent: CourseContent = {
      id: crypto.randomUUID(),
      type: "video",

      title: videoTitle.trim(),

      description:
        videoDescription.trim(),

      videoUrl:
        videoUrl.trim() || undefined,

      videoFile,
    };

    setContents((current) => [
      ...current,
      newContent,
    ]);

    resetContentForm();
    setActiveType(null);
  };


  /* ====================================================================== */
  /* ADD RESOURCE                                                            */
  /* ====================================================================== */

  const addResource = () => {
    if (!resourceTitle.trim()) {
      alert(
        "Veuillez renseigner le nom de la ressource.",
      );
      return;
    }

    if (!resourceUrl.trim() && !resourceFile) {
      alert(
        "Ajoutez un lien ou sélectionnez un fichier.",
      );
      return;
    }

    const newContent: CourseContent = {
      id: crypto.randomUUID(),
      type: "resource",

      title:
        resourceTitle.trim(),

      description:
        resourceDescription.trim(),

      resourceUrl:
        resourceUrl.trim() || undefined,

      resourceFile,
    };

    setContents((current) => [
      ...current,
      newContent,
    ]);

    resetContentForm();
    setActiveType(null);
  };


  /* ====================================================================== */
  /* DELETE CONTENT                                                         */
  /* ====================================================================== */

  const removeContent = (id: string) => {
    setContents((current) =>
      current.filter(
        (item) => item.id !== id,
      ),
    );
  };


  /* ====================================================================== */
  /* SAVE COURSE                                                             */
  /* ====================================================================== */

  const handleSave = async (
    publish: boolean,
  ) => {
    if (!title.trim()) {
      alert(
        "Veuillez renseigner le titre du cours.",
      );
      return;
    }

    if (!description.trim()) {
      alert(
        "Veuillez renseigner la description du cours.",
      );
      return;
    }

    if (!category) {
      alert(
        "Veuillez sélectionner une catégorie.",
      );
      return;
    }

    if (!level) {
      alert(
        "Veuillez sélectionner un niveau.",
      );
      return;
    }

    const token =
      localStorage.getItem("accessToken");

    if (!token) {
      alert(
        "Votre session a expiré. Veuillez vous reconnecter.",
      );

      router.push("/login");
      return;
    }

    try {
      setSaving(true);

      /*
       * IMPORTANT:
       *
       * We use FormData because files cannot be
       * sent using JSON.
       */

      const formData = new FormData();

      /* Course fields */

      formData.append(
        "title",
        title.trim(),
      );

      formData.append(
        "description",
        description.trim(),
      );

      formData.append(
        "category",
        category,
      );

      formData.append(
        "level",
        level,
      );

      formData.append(
        "durationMinutes",
        duration
          ? String(Number(duration))
          : "0",
      );

      formData.append(
        "isPublished",
        String(publish),
      );


      /* Course cover */

      if (cover) {
        formData.append(
          "cover",
          cover,
        );
      }


      /*
       * Contents metadata.
       *
       * Files themselves are appended separately.
       */

      const contentMetadata =
        contents.map(
          (content, index) => ({
            index,

            clientId:
              content.id,

            type:
              content.type,

            title:
              content.title,

            description:
              content.description,

            content:
              content.content ?? null,

            videoUrl:
              content.videoUrl ?? null,

            resourceUrl:
              content.resourceUrl ?? null,

            hasArticleFile:
              Boolean(content.articleFile),

            hasVideoFile:
              Boolean(content.videoFile),

            hasResourceFile:
              Boolean(content.resourceFile),
          }),
        );


      formData.append(
        "contents",
        JSON.stringify(
          contentMetadata,
        ),
      );


      /*
       * Append article PDFs.
       *
       * The field name contains the content index.
       *
       * articleFile_0
       * articleFile_1
       * articleFile_2
       */

      contents.forEach(
        (content, index) => {
          if (
            content.type === "article" &&
            content.articleFile
          ) {
        formData.append(
          "articleFiles",
          content.articleFile,
        );
          }
        },
      );


      /*
       * Append video files.
       */

      contents.forEach(
        (content, index) => {
          if (
            content.type === "video" &&
            content.videoFile
          ) {
            formData.append(
              "videoFiles",
              content.videoFile,
            );
          }
        },
      );


      /*
       * Append resource files.
       */

      contents.forEach(
        (content, index) => {
          if (
            content.type === "resource" &&
            content.resourceFile
          ) {
            formData.append(
              "resourceFiles",
              content.resourceFile,
            );
          }
        },
      );


      /* ------------------------------------------------------------------ */
      /* SEND TO BACKEND                                                    */
      /* ------------------------------------------------------------------ */

      const response = await fetch(
        `${API_URL}/courses`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          /*
           * DO NOT set Content-Type here.
           *
           * Browser automatically generates:
           *
           * multipart/form-data;
           * boundary=....
           */

          body: formData,
        },
      );


      const json =
        await response.json()
          .catch(() => null);


      if (!response.ok) {
        throw new Error(
          json?.message ||
          "Impossible de créer le cours.",
        );
      }


      alert(
        publish
          ? "Le cours a été publié avec succès."
          : "Le brouillon a été enregistré avec succès.",
      );


      router.push(
        "/expert/courses",
      );

    } catch (error) {
      console.error(
        "CREATE COURSE ERROR:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue.",
      );

    } finally {
      setSaving(false);
    }
  };


  /* ====================================================================== */
  /* UI                                                                      */
  /* ====================================================================== */

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Breadcrumb */}

        <div className="mb-6 flex items-center gap-2 text-sm text-ink-soft">
          <Link
            href="/expert/courses"
            className="hover:text-wine-700"
          >
            Cours
          </Link>

          <span>/</span>

          <span className="font-medium text-wine-900">
            Créer un cours
          </span>
        </div>


        {/* Header */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

          <div>

            <Link
              href="/expert/courses"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-wine-700"
            >
              <ArrowLeft size={17} />

              Retour aux cours
            </Link>

            <h1 className="font-display text-3xl font-semibold text-wine-900">
              Créer un cours
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              Créez un parcours complet pour vos
              apprenantes avec des articles,
              des vidéos et des ressources.
            </p>

          </div>


          <div className="flex gap-3">

            <button
              type="button"
              onClick={() =>
                handleSave(false)
              }
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm font-semibold text-ink-soft transition hover:bg-sand-50 disabled:opacity-60"
            >

              {saving ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Save size={17} />
              )}

              Enregistrer brouillon

            </button>


            <button
              type="button"
              onClick={() =>
                handleSave(true)
              }
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rise-gradient px-5 py-3 text-sm font-semibold text-white shadow-bloom transition hover:opacity-90 disabled:opacity-60"
            >

              {saving ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Check size={17} />
              )}

              Publier le cours

            </button>

          </div>

        </div>


        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

          {/* ================================================================= */}
          {/* LEFT                                                               */}
          {/* ================================================================= */}

          <div className="space-y-8">

            {/* GENERAL INFORMATION */}

            <section className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine-50 text-wine-700">
                  <BookOpen size={20} />
                </div>

                <div>

                  <h2 className="font-display text-xl font-semibold text-wine-900">
                    Informations générales
                  </h2>

                  <p className="text-sm text-ink-soft">
                    Présentez votre cours aux futures apprenantes.
                  </p>

                </div>

              </div>


              <div className="space-y-5">

                <Field
                  label="Titre du cours"
                  required
                >
                  <input
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="Ex. Maîtriser son business plan"
                    className="input"
                  />
                </Field>


                <Field
                  label="Description"
                  required
                >
                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    placeholder="Décrivez ce que les apprenantes vont apprendre..."
                    rows={5}
                    className="input resize-none"
                  />
                </Field>


                <div className="grid gap-5 md:grid-cols-2">

                  <Field
                    label="Catégorie"
                    required
                  >
                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value)
                      }
                      className="input"
                    >

                      <option value="">
                        Sélectionner
                      </option>

                      {CATEGORIES.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        ),
                      )}

                    </select>
                  </Field>


                  <Field
                    label="Niveau"
                    required
                  >
                    <select
                      value={level}
                      onChange={(e) =>
                        setLevel(e.target.value)
                      }
                      className="input"
                    >

                      <option value="">
                        Sélectionner
                      </option>

                      {LEVELS.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        ),
                      )}

                    </select>
                  </Field>

                </div>


                <Field label="Durée estimée">

                  <div className="relative">

                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) =>
                        setDuration(e.target.value)
                      }
                      placeholder="Ex. 180"
                      className="input pr-20"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-soft">
                      minutes
                    </span>

                  </div>

                </Field>

              </div>

            </section>


            {/* COURSE CONTENT */}

            <section className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm">

              <div className="mb-6">

                <h2 className="font-display text-xl font-semibold text-wine-900">
                  Contenu du cours
                </h2>

                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  Ajoutez des articles, vidéos et ressources.
                </p>

              </div>


              {/* CONTENT TYPE BUTTONS */}

              <div className="grid gap-4 md:grid-cols-3">

                <ContentTypeButton
                  icon={
                    <FileText size={22} />
                  }
                  title="Article"
                  description="Texte + PDF"
                  active={
                    activeType === "article"
                  }
                  onClick={() =>
                    setActiveType(
                      activeType ===
                        "article"
                        ? null
                        : "article",
                    )
                  }
                />


                <ContentTypeButton
                  icon={
                    <Video size={22} />
                  }
                  title="Vidéo"
                  description="URL ou fichier vidéo"
                  active={
                    activeType === "video"
                  }
                  onClick={() =>
                    setActiveType(
                      activeType ===
                        "video"
                        ? null
                        : "video",
                    )
                  }
                />


                <ContentTypeButton
                  icon={
                    <FolderOpen
                      size={22}
                    />
                  }
                  title="Ressource"
                  description="PDF ou autre fichier"
                  active={
                    activeType ===
                    "resource"
                  }
                  onClick={() =>
                    setActiveType(
                      activeType ===
                        "resource"
                        ? null
                        : "resource",
                    )
                  }
                />

              </div>


              {/* ============================================================= */}
              {/* ARTICLE FORM                                                    */}
              {/* ============================================================= */}

              {activeType ===
                "article" && (
                <div className="mt-6 rounded-2xl border border-wine-100 bg-wine-50/40 p-5">

                  <div className="mb-5 flex items-center gap-3">

                    <FileText
                      size={20}
                      className="text-wine-700"
                    />

                    <div>

                      <h3 className="font-semibold text-wine-900">
                        Ajouter un article
                      </h3>

                      <p className="text-xs text-ink-soft">
                        Texte et/ou PDF.
                      </p>

                    </div>

                  </div>


                  <div className="space-y-4">

                    <Field
                      label="Titre de l'article"
                      required
                    >
                      <input
                        value={articleTitle}
                        onChange={(e) =>
                          setArticleTitle(
                            e.target.value,
                          )
                        }
                        placeholder="Ex. Comprendre son marché cible"
                        className="input"
                      />
                    </Field>


                    <Field label="Résumé">

                      <input
                        value={
                          articleDescription
                        }
                        onChange={(e) =>
                          setArticleDescription(
                            e.target.value,
                          )
                        }
                        placeholder="Courte description"
                        className="input"
                      />

                    </Field>


                    <Field label="Contenu de l'article">

                      <textarea
                        value={
                          articleContent
                        }
                        onChange={(e) =>
                          setArticleContent(
                            e.target.value,
                          )
                        }
                        placeholder="Rédigez votre article..."
                        rows={8}
                        className="input resize-y"
                      />

                    </Field>


                    {/* ARTICLE PDF */}

                    <Field label="PDF de l'article">

                      <FilePicker
                        file={articleFile}
                        accept=".pdf,application/pdf"
                        description="PDF uniquement — 100 MB maximum"
                        onChange={
                          handleArticleFileChange
                        }
                        onRemove={() =>
                          setArticleFile(
                            null,
                          )
                        }
                      />

                    </Field>


                    <div className="flex justify-end">

                      <button
                        type="button"
                        onClick={
                          addArticle
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-wine-800"
                      >

                        <Plus size={17} />

                        Ajouter l'article

                      </button>

                    </div>

                  </div>

                </div>
              )}


              {/* ============================================================= */}
              {/* VIDEO FORM                                                      */}
              {/* ============================================================= */}

              {activeType ===
                "video" && (
                <div className="mt-6 rounded-2xl border border-wine-100 bg-wine-50/40 p-5">

                  <div className="mb-5 flex items-center gap-3">

                    <Film
                      size={20}
                      className="text-wine-700"
                    />

                    <div>

                      <h3 className="font-semibold text-wine-900">
                        Ajouter une vidéo
                      </h3>

                      <p className="text-xs text-ink-soft">
                        URL externe ou fichier vidéo.
                      </p>

                    </div>

                  </div>


                  <div className="space-y-4">

                    <Field
                      label="Titre de la vidéo"
                      required
                    >
                      <input
                        value={videoTitle}
                        onChange={(e) =>
                          setVideoTitle(
                            e.target.value,
                          )
                        }
                        placeholder="Ex. Les 5 erreurs d'un business plan"
                        className="input"
                      />
                    </Field>


                    <Field label="Description">

                      <input
                        value={
                          videoDescription
                        }
                        onChange={(e) =>
                          setVideoDescription(
                            e.target.value,
                          )
                        }
                        placeholder="Décrivez cette vidéo"
                        className="input"
                      />

                    </Field>


                    <Field label="URL de la vidéo">

                      <div className="relative">

                        <LinkIcon
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/60"
                        />

                        <input
                          type="url"
                          value={videoUrl}
                          onChange={(e) =>
                            setVideoUrl(
                              e.target.value,
                            )
                          }
                          placeholder="https://youtube.com/..."
                          className="input pl-11"
                        />

                      </div>

                    </Field>


                    <div className="text-center text-xs font-medium text-ink-soft">
                      OU
                    </div>


                    {/* VIDEO FILE */}

                    <Field label="Fichier vidéo">

                      <FilePicker
                        file={videoFile}
                        accept=".mp4,.webm,.mov,.avi,video/mp4,video/webm,video/quicktime,video/x-msvideo"
                        description="MP4, WebM, MOV ou AVI — 100 MB maximum"
                        onChange={
                          handleVideoFileChange
                        }
                        onRemove={() =>
                          setVideoFile(
                            null,
                          )
                        }
                      />

                    </Field>


                    <div className="flex justify-end">

                      <button
                        type="button"
                        onClick={
                          addVideo
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-wine-800"
                      >

                        <Plus size={17} />

                        Ajouter la vidéo

                      </button>

                    </div>

                  </div>

                </div>
              )}


              {/* ============================================================= */}
              {/* RESOURCE FORM                                                   */}
              {/* ============================================================= */}

              {activeType ===
                "resource" && (
                <div className="mt-6 rounded-2xl border border-wine-100 bg-wine-50/40 p-5">

                  <div className="mb-5 flex items-center gap-3">

                    <FolderOpen
                      size={20}
                      className="text-wine-700"
                    />

                    <div>

                      <h3 className="font-semibold text-wine-900">
                        Ajouter une ressource
                      </h3>

                      <p className="text-xs text-ink-soft">
                        PDF, document, modèle ou lien.
                      </p>

                    </div>

                  </div>


                  <div className="space-y-4">

                    <Field
                      label="Nom de la ressource"
                      required
                    >

                      <input
                        value={
                          resourceTitle
                        }
                        onChange={(e) =>
                          setResourceTitle(
                            e.target.value,
                          )
                        }
                        placeholder="Ex. Modèle de business plan"
                        className="input"
                      />

                    </Field>


                    <Field label="Description">

                      <input
                        value={
                          resourceDescription
                        }
                        onChange={(e) =>
                          setResourceDescription(
                            e.target.value,
                          )
                        }
                        placeholder="À quoi sert cette ressource ?"
                        className="input"
                      />

                    </Field>


                    <Field label="Lien externe">

                      <div className="relative">

                        <LinkIcon
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/60"
                        />

                        <input
                          type="url"
                          value={
                            resourceUrl
                          }
                          onChange={(e) =>
                            setResourceUrl(
                              e.target.value,
                            )
                          }
                          placeholder="https://..."
                          className="input pl-11"
                        />

                      </div>

                    </Field>


                    <div className="text-center text-xs font-medium text-ink-soft">
                      OU
                    </div>


                    {/* RESOURCE FILE */}

                    <Field label="Fichier">

                      <FilePicker
                        file={
                          resourceFile
                        }
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
                        description="PDF, DOCX, XLSX, PPTX, ZIP ou TXT — 100 MB maximum"
                        onChange={
                          handleResourceFileChange
                        }
                        onRemove={() =>
                          setResourceFile(
                            null,
                          )
                        }
                      />

                    </Field>


                    <div className="flex justify-end">

                      <button
                        type="button"
                        onClick={
                          addResource
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-wine-800"
                      >

                        <Plus size={17} />

                        Ajouter la ressource

                      </button>

                    </div>

                  </div>

                </div>
              )}

            </section>


            {/* ============================================================= */}
            {/* ADDED CONTENT                                                   */}
            {/* ============================================================= */}

            <section className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <h2 className="font-display text-xl font-semibold text-wine-900">
                    Contenu ajouté
                  </h2>

                  <p className="mt-1 text-sm text-ink-soft">
                    Les éléments qui composeront votre cours.
                  </p>

                </div>


                <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-ink-soft">

                  {contents.length} élément
                  {contents.length !== 1
                    ? "s"
                    : ""}

                </span>

              </div>


              {contents.length === 0 ? (

                <div className="rounded-2xl border border-dashed border-sand-300 bg-sand-50 px-6 py-12 text-center">

                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-ink-soft shadow-sm">
                    <FolderOpen
                      size={25}
                    />
                  </div>

                  <h3 className="font-semibold text-wine-900">
                    Aucun contenu ajouté
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">
                    Ajoutez des articles,
                    vidéos ou ressources.
                  </p>

                </div>

              ) : (

                <div className="space-y-3">

                  {contents.map(
                    (content, index) => (
                      <ContentRow
                        key={
                          content.id
                        }
                        content={
                          content
                        }
                        index={
                          index
                        }
                        onDelete={
                          removeContent
                        }
                      />
                    ),
                  )}

                </div>

              )}

            </section>

          </div>


          {/* ================================================================= */}
          {/* RIGHT                                                              */}
          {/* ================================================================= */}

          <aside className="space-y-6">

            {/* COVER */}

            <section className="rounded-3xl border border-sand-200 bg-white p-5 shadow-sm">

              <h2 className="font-semibold text-wine-900">
                Image de couverture
              </h2>

              <p className="mt-1 text-xs leading-5 text-ink-soft">
                JPG, PNG ou WEBP.
              </p>


              <label className="mt-5 block cursor-pointer">

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={
                    handleCoverChange
                  }
                />


                {coverPreview ? (

                  <div className="overflow-hidden rounded-2xl border border-sand-200">

                    <img
                      src={
                        coverPreview
                      }
                      alt="Couverture"
                      className="h-48 w-full object-cover"
                    />

                    <div className="p-3 text-center text-xs font-medium text-wine-700">
                      Changer l'image
                    </div>

                  </div>

                ) : (

                  <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-sand-300 bg-sand-50 text-center">

                    <ImageIcon
                      size={28}
                      className="mb-3 text-ink-soft/50"
                    />

                    <p className="text-sm font-semibold text-wine-900">
                      Ajouter une couverture
                    </p>

                    <p className="mt-1 text-xs text-ink-soft">
                      JPG, PNG ou WEBP
                    </p>

                  </div>

                )}

              </label>

            </section>


            {/* SUMMARY */}

            <section className="rounded-3xl border border-sand-200 bg-white p-5 shadow-sm">

              <h2 className="font-semibold text-wine-900">
                Résumé du cours
              </h2>

              <div className="mt-5 space-y-4">

                <SummaryRow
                  label="Titre"
                  value={
                    title ||
                    "Non renseigné"
                  }
                />

                <SummaryRow
                  label="Catégorie"
                  value={
                    category ||
                    "Non renseignée"
                  }
                />

                <SummaryRow
                  label="Niveau"
                  value={
                    level ||
                    "Non renseigné"
                  }
                />

                <SummaryRow
                  label="Durée"
                  value={
                    duration
                      ? `${duration} minutes`
                      : "Non renseignée"
                  }
                />

                <SummaryRow
                  label="Contenu"
                  value={`${contents.length} élément${
                    contents.length !== 1
                      ? "s"
                      : ""
                  }`}
                />

              </div>

            </section>


            {/* STRUCTURE */}

            <section className="rounded-3xl border border-sand-200 bg-white p-5 shadow-sm">

              <h2 className="font-semibold text-wine-900">
                Structure
              </h2>


              <div className="mt-4 space-y-3">

                <StructureRow
                  icon={
                    <FileText
                      size={17}
                    />
                  }
                  label="Articles"
                  value={
                    contents.filter(
                      (item) =>
                        item.type ===
                        "article",
                    ).length
                  }
                />

                <StructureRow
                  icon={
                    <Video
                      size={17}
                    />
                  }
                  label="Vidéos"
                  value={
                    contents.filter(
                      (item) =>
                        item.type ===
                        "video",
                    ).length
                  }
                />

                <StructureRow
                  icon={
                    <FolderOpen
                      size={17}
                    />
                  }
                  label="Ressources"
                  value={
                    contents.filter(
                      (item) =>
                        item.type ===
                        "resource",
                    ).length
                  }
                />

              </div>

            </section>


            {/* PUBLISH */}

            <section className="rounded-3xl bg-wine-900 p-5 text-white shadow-bloom">

              <h2 className="font-display text-lg font-semibold">
                Prêt à publier ?
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Votre cours et ses fichiers
                seront envoyés au serveur.
              </p>


              <button
                type="button"
                onClick={() =>
                  handleSave(true)
                }
                disabled={saving}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-wine-900 transition hover:bg-white/90 disabled:opacity-60"
              >

                {saving ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Check size={17} />
                )}

                Publier le cours

              </button>

            </section>

          </aside>

        </div>

      </div>
    </main>
  );
}


/* ========================================================================== */
/* FIELD                                                                       */
/* ========================================================================== */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">

      <label className="block text-sm font-medium text-wine-900">

        {label}

        {required && (
          <span className="ml-1 text-rose-600">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}


/* ========================================================================== */
/* FILE PICKER                                                                 */
/* ========================================================================== */

function FilePicker({
  file,
  accept,
  description,
  onChange,
  onRemove,
}: {
  file: File | null;
  accept: string;
  description: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  onRemove: () => void;
}) {
  return (
    <div>

      <label
        className={`block cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
          file
            ? "border-wine-400 bg-wine-50"
            : "border-sand-300 bg-white hover:border-wine-300 hover:bg-wine-50/30"
        }`}
      >

        <input
          type="file"
          accept={accept}
          className="sr-only"
          onChange={onChange}
        />


        {file ? (

          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-wine-900 text-white">
              <FileText
                size={24}
              />
            </div>


            <p className="break-all text-sm font-semibold text-wine-900">
              {file.name}
            </p>


            <p className="mt-1 text-xs text-ink-soft">
              {(
                file.size /
                1024 /
                1024
              ).toFixed(2)}{" "}
              MB
            </p>


            <p className="mt-3 text-xs font-medium text-wine-700">
              Cliquer pour changer
            </p>

          </>

        ) : (

          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-wine-50 text-wine-700">
              <Upload
                size={24}
              />
            </div>


            <p className="text-sm font-semibold text-wine-900">
              Importer un fichier
            </p>


            <p className="mt-1 text-xs text-ink-soft">
              Cliquez pour sélectionner
            </p>


            <p className="mt-3 text-xs text-ink-soft">
              {description}
            </p>

          </>

        )}

      </label>


      {file && (

        <button
          type="button"
          onClick={onRemove}
          className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-red-600 hover:text-red-700"
        >
          <X size={14} />
          Retirer le fichier
        </button>

      )}

    </div>
  );
}


/* ========================================================================== */
/* CONTENT TYPE BUTTON                                                        */
/* ========================================================================== */

function ContentTypeButton({
  icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${
        active
          ? "border-wine-400 bg-wine-50 shadow-sm"
          : "border-sand-200 bg-white hover:border-wine-200 hover:bg-sand-50"
      }`}
    >

      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
          active
            ? "bg-wine-900 text-white"
            : "bg-sand-100 text-wine-700"
        }`}
      >
        {icon}
      </div>


      <p className="font-semibold text-wine-900">
        {title}
      </p>


      <p className="mt-1 text-xs leading-5 text-ink-soft">
        {description}
      </p>

    </button>
  );
}


/* ========================================================================== */
/* CONTENT ROW                                                                */
/* ========================================================================== */

function ContentRow({
  content,
  index,
  onDelete,
}: {
  content: CourseContent;
  index: number;
  onDelete: (id: string) => void;
}) {
  const config = {
    article: {
      label: "Article",
      icon: <FileText size={20} />,
    },

    video: {
      label: "Vidéo",
      icon: <Video size={20} />,
    },

    resource: {
      label: "Ressource",
      icon: <FolderOpen size={20} />,
    },
  }[content.type];


  return (
    <div className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-4">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-wine-50 text-wine-700">
        {config.icon}
      </div>


      <div className="min-w-0 flex-1">

        <div className="flex flex-wrap items-center gap-2">

          <span className="text-xs font-medium text-ink-soft">
            {index + 1}
          </span>

          <span className="rounded-md bg-wine-50 px-2 py-1 text-[11px] font-semibold text-wine-700">
            {config.label}
          </span>


          {content.articleFile && (
            <span className="rounded-md bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600">
              PDF
            </span>
          )}


          {content.videoFile && (
            <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-600">
              Fichier vidéo
            </span>
          )}


          {content.resourceFile && (
            <span className="rounded-md bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-600">
              Fichier
            </span>
          )}

        </div>


        <h3 className="mt-1 truncate text-sm font-semibold text-wine-900">
          {content.title}
        </h3>


        {content.description && (
          <p className="mt-1 truncate text-xs text-ink-soft">
            {content.description}
          </p>
        )}


        {content.articleFile && (
          <p className="mt-1 truncate text-xs text-ink-soft">
            📎 {content.articleFile.name}
          </p>
        )}


        {content.videoFile && (
          <p className="mt-1 truncate text-xs text-ink-soft">
            🎥 {content.videoFile.name}
          </p>
        )}


        {content.resourceFile && (
          <p className="mt-1 truncate text-xs text-ink-soft">
            📎 {content.resourceFile.name}
          </p>
        )}

      </div>


      <button
        type="button"
        onClick={() =>
          onDelete(content.id)
        }
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink-soft transition hover:bg-red-50 hover:text-red-600"
        title="Supprimer"
      >
        <Trash2 size={17} />
      </button>

    </div>
  );
}


/* ========================================================================== */
/* SUMMARY ROW                                                                */
/* ========================================================================== */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <span className="text-sm text-ink-soft">
        {label}
      </span>

      <span className="max-w-[180px] truncate text-right text-xs font-semibold text-wine-900">
        {value}
      </span>

    </div>
  );
}


/* ========================================================================== */
/* STRUCTURE ROW                                                              */
/* ========================================================================== */

function StructureRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className="text-wine-700">
          {icon}
        </div>

        <span className="text-sm font-medium text-ink-soft">
          {label}
        </span>

      </div>


      <span className="font-semibold text-wine-900">
        {value}
      </span>

    </div>
  );
}

