export function Preview({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl card-surface p-10 shadow-card">
      <p className="font-script text-3xl text-rose-500">Ellevadz</p>
      <h1 className="mt-4 font-display text-3xl text-ink">{title}</h1>
      <p className="mt-1 text-sm text-ink-soft">Business Plan — généré le {new Date().toLocaleDateString("fr-FR")}</p>

      {[
        { title: "Résumé exécutif", text: "Ce projet vise à développer une activité artisanale durable, centrée sur la création de produits faits main et la valorisation du savoir-faire local." },
        { title: "Analyse de marché", text: "La clientèle cible est composée principalement de femmes urbaines âgées de 25 à 45 ans, sensibles aux produits artisanaux et durables." },
        { title: "Stratégie", text: "La distribution se fera via une boutique en ligne et des marchés locaux, soutenue par une stratégie de communication sur les réseaux sociaux." },
        { title: "Plan financier", text: "L'investissement initial est estimé à 350 000 DA, avec un chiffre d'affaires prévisionnel de 1 200 000 DA pour la première année." },
      ].map((section) => (
        <div key={section.title} className="mt-8 border-t border-sand-100 pt-6">
          <h2 className="mb-2 font-display text-lg text-ink">{section.title}</h2>
          <p className="text-sm leading-relaxed text-ink-soft">{section.text}</p>
        </div>
      ))}
    </div>
  );
}
