import { PrismaClient, Role, Language, ProgramCategory, InstitutionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hash = (password: string) => bcrypt.hashSync(password, 12);

async function main() {
  console.log("🌱 Seeding database…");

  // ── Clean existing data (safe for dev) ─────────────────────────────────────
await prisma.$transaction([
  prisma.message.deleteMany(),
  prisma.conversation.deleteMany(), // <-- Add this
  prisma.notification.deleteMany(),
  prisma.favoriteProgram.deleteMany(),
  prisma.application.deleteMany(),
  prisma.session.deleteMany(),
  prisma.expertReview.deleteMany(),
  prisma.qAQuestion.deleteMany(),
  prisma.course.deleteMany(),
  prisma.article.deleteMany(),
  prisma.video.deleteMany(),
  prisma.resource.deleteMany(),
  prisma.institutionDocument.deleteMany(),
  prisma.institutionEvent.deleteMany(),
  prisma.financingProgram.deleteMany(),
  prisma.businessPlan.deleteMany(),
  prisma.refreshToken.deleteMany(),
  prisma.expertProfile.deleteMany(),
  prisma.institutionProfile.deleteMany(),
  prisma.user.deleteMany(),
]);

  // ── 1. Admin ────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: "admin@ellevadz.dz",
      passwordHash: hash("Admin@1234"),
      name: "Administrateur Ellevadz",
      role: Role.ADMIN,
      language: Language.FR,
      isVerified: true,
      isActive: true,
    },
  });
  console.log(`✅  Admin:       ${admin.email}  / Admin@1234`);

  // ── 2. Entrepreneur ─────────────────────────────────────────────────────────
  const entrepreneur = await prisma.user.create({
    data: {
      email: "amina@ellevadz.dz",
      passwordHash: hash("Amina@1234"),
      name: "Amina Kaddour",
      role: Role.ENTREPRENEUR,
      language: Language.FR,
      bio: "Fondatrice de l'Atelier Lumière, spécialisée dans les bougies artisanales.",
      isVerified: true,
      isActive: true,
    },
  });
  console.log(`✅  Entrepreneur: ${entrepreneur.email} / Amina@1234`);

  // ── 3. Expert ───────────────────────────────────────────────────────────────
  const expertUser = await prisma.user.create({
    data: {
      email: "leila@ellevadz.dz",
      passwordHash: hash("Expert@1234"),
      name: "Dr. Leila Hamdi",
      role: Role.EXPERT,
      language: Language.FR,
      bio: "15 ans d'expérience en conseil aux PME algériennes. Ancienne directrice régionale BNA.",
      isVerified: true,
      isActive: true,
      expertProfile: {
        create: {
          title: "Consultante en financement d'entreprise",
          specialties: ["financement", "business-plan", "comptabilite"],
          sessionRateDA: 1900,
          availableForBooking: true,
          rating: 4.9,
          reviewCount: 87,
          sessionCount: 214,
          isApprovedByAdmin: true,
        },
      },
    },
    include: { expertProfile: true },
  });
  console.log(`✅  Expert:      ${expertUser.email}   / Expert@1234`);

  // ── 4. Institution ──────────────────────────────────────────────────────────
  const institutionUser = await prisma.user.create({
    data: {
      email: "bna@ellevadz.dz",
      passwordHash: hash("Institution@1234"),
      name: "Banque Nationale d'Algérie",
      role: Role.INSTITUTION,
      language: Language.FR,
      isVerified: true,
      isActive: true,
      institutionProfile: {
        create: {
          institutionName: "Banque Nationale d'Algérie",
          type: InstitutionType.BANK,
          city: "Alger",
          websiteUrl: "https://www.bna.dz",
          contactEmail: "entreprises@bna.dz",
          contactPhone: "+213 21 00 00 00",
          isVerified: true,
        },
      },
    },
    include: { institutionProfile: true },
  });
  console.log(`✅  Institution: ${institutionUser.email}     / Institution@1234`);

  // ── Extra entrepreneur for variety ──────────────────────────────────────────
  const entrepreneur2 = await prisma.user.create({
    data: {
      email: "yasmine@ellevadz.dz",
      passwordHash: hash("Yasmine@1234"),
      name: "Yasmine Bensaid",
      role: Role.ENTREPRENEUR,
      language: Language.FR,
      bio: "Fondatrice de Souk Bio, épicerie bio en ligne.",
      isVerified: true,
      isActive: true,
    },
  });

  // ── Financing Programs ───────────────────────────────────────────────────────
  const institutionProfileId = institutionUser.institutionProfile!.id;

  const program1 = await prisma.financingProgram.create({
    data: {
      slug: "credit-pme-femmes",
      title: "Crédit PME spécial entrepreneures",
      description: "Un crédit dédié aux femmes porteuses de projets dans le commerce, l'artisanat et les services.",
      category: ProgramCategory.BANK_LOAN,
      amountMin: BigInt(500_000),
      amountMax: BigInt(5_000_000),
      
      eligibility: [
        "Projet enregistré au registre de commerce",
        "Apport personnel de 10%",
        "Plan d'affaires validé",
      ],
      requiredDocuments: [
        "Registre de commerce",
        "Business plan",
        "Pièce d'identité",
        "Justificatif de domicile",
      ],
      isPublished: true,
      institutionProfileId,
    },
  });

  const program2 = await prisma.financingProgram.create({
    data: {
      slug: "mourabaha-artisanat",
      title: "Mourabaha Artisanat & Métiers",
      description: "Financement participatif conforme aux principes de la finance islamique.",
      category: ProgramCategory.ISLAMIC_FINANCE,
      amountMin: BigInt(200_000),
      amountMax: BigInt(2_000_000),
      eligibility: ["Activité artisanale déclarée", "Garantie matérielle ou caution"],
      requiredDocuments: ["Carte d'artisan", "Devis fournisseur", "Pièce d'identité"],
      isPublished: true,
      institutionProfileId,
    },
  });

  console.log("✅  2 financing programs created");

  // ── Business Plans ───────────────────────────────────────────────────────────
  await prisma.businessPlan.createMany({
    data: [
      {
        title: "Atelier Lumière — Bougies artisanales",
        status: "SUBMITTED",
        progress: 85,
        ownerId: entrepreneur.id,
        executiveSummary: { vision: "Créer une marque algérienne de bougies artisanales premium." },
        marketAnalysis: { target: "Femmes urbaines 25-45 ans" },
      },
      {
        title: "Souk Bio — Épicerie en ligne",
        status: "DRAFT",
        progress: 40,
        ownerId: entrepreneur2.id,
        executiveSummary: { vision: "Livraison de produits biologiques à domicile." },
      },
    ],
  });
  console.log("✅  2 business plans created");

  // ── Sessions ─────────────────────────────────────────────────────────────────
  await prisma.session.create({
    data: {
      entrepreneurId: entrepreneur.id,
      expertId: expertUser.id,
      topic: "Révision du plan financier",
      durationMinutes: 60,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      status: "UPCOMING",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      rateDA: 3500,
    },
  });
  console.log("✅  1 session created");

  // ── Application ──────────────────────────────────────────────────────────────
  await prisma.application.create({
    data: {
      programId: program1.id,
      applicantId: entrepreneur.id,
      status: "SUBMITTED",
      amountRequested: BigInt(2_500_000),
      coverLetter: "Je souhaite financer le développement de mon atelier artisanal.",
    },
  });
  console.log("✅  1 application created");

  // ── Favorite Program ─────────────────────────────────────────────────────────
  await prisma.favoriteProgram.create({
    data: { userId: entrepreneur.id, programId: program2.id },
  });

  // ── Notifications ────────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: entrepreneur.id,
        type: "SESSION_BOOKED",
        title: "Session confirmée",
        body: "Votre session avec Dr. Leila Hamdi est confirmée pour dans 2 jours.",
        link: "/dashboard/business-plans",
      },
      {
        userId: expertUser.id,
        type: "BUSINESS_PLAN_SUBMITTED",
        title: "Nouveau business plan soumis",
        body: "Amina Kaddour a soumis son plan « Atelier Lumière » pour révision.",
        link: "/expert/business-plans",
      },
    ],
  });
  console.log("✅  2 notifications created");

// ── Conversation ───────────────────────────────────────────────

const conversation = await prisma.conversation.create({
  data: {
    participants: {
      connect: [
        { id: entrepreneur.id },
        { id: expertUser.id },
      ],
    },
  },
});

// ── Messages ───────────────────────────────────────────────────

await prisma.message.create({
  data: {
    conversationId: conversation.id,
    senderId: entrepreneur.id,
    receiverId: expertUser.id,
    content:
      "Bonjour Dr. Leila, j'ai une question sur mon plan financier.",
  },
});

await prisma.message.create({
  data: {
    conversationId: conversation.id,
    senderId: expertUser.id,
    receiverId: entrepreneur.id,
    content:
      "Bonjour Amina ! Je vous lis. Dites-moi tout.",
  },
});

console.log("✅  2 messages created");

  // ── Expert Content ────────────────────────────────────────────────────────────
  const expertProfileId = expertUser.expertProfile!.id;

  await prisma.article.create({
    data: {
      slug: "choisir-financement-anade-ansej",
      title: "Comment choisir entre ANADE et ANSEJ ?",
      excerpt: "Un guide pratique pour sélectionner le dispositif le plus adapté à votre profil.",
      content: "Contenu complet de l'article ici…",
      category: "Financement",
      readTimeMinutes: 6,
      views: 840,
      isPublished: true,
      publishedAt: new Date(),
      expertProfileId,
    },
  });

  await prisma.course.create({
    data: {
      slug: "comprendre-dispositifs-anade",
      title: "Comprendre les dispositifs ANADE & ANSEJ",
      description: "Un cours complet pour naviguer les aides gouvernementales.",
      category: "Financement",
      level: "débutant",
      durationMinutes: 180,
      lessonCount: 6,
      enrolledCount: 142,
      rating: 4.8,
      isPublished: true,
      expertProfileId,
    },
  });
  console.log("✅  1 article + 1 course created");

  // ── Q&A ───────────────────────────────────────────────────────────────────────
  await prisma.qAQuestion.create({
    data: {
      askerId: entrepreneur.id,
      question: "Quelle est la différence entre ANADE et ANSEJ pour une jeune de 28 ans ?",
      category: "Financement",
      votes: 12,
    },
  });
  console.log("✅  1 Q&A question created");

  console.log("\n🎉 Seed complete!\n");
  console.log("┌─────────────────────────────────────────────────────────────┐");
  console.log("│  Test credentials                                           │");
  console.log("├───────────────────────────┬─────────────────────────────────┤");
  console.log("│  admin@ellevadz.dz        │  Admin@1234          (admin)    │");
  console.log("│  amina@ellevadz.dz        │  Amina@1234          (user)     │");
  console.log("│  yasmine@ellevadz.dz      │  Yasmine@1234        (user)     │");
  console.log("│  leila@ellevadz.dz        │  Expert@1234         (expert)   │");
  console.log("│  bna@ellevadz.dz          │  Institution@1234    (inst.)    │");
  console.log("└───────────────────────────┴─────────────────────────────────┘");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());