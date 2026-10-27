import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";

import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";
import Organisation from "@/lib/database/models/organisation.model";
import Event from "@/lib/database/models/event.model";

const LOCALE_NAMES: Record<string, string> = {
  fr: "français",
  en: "English",
  ar: "العربية",
  es: "español",
};

export interface ChatUserContext {
  /** Human readable block appended to the system prompt. */
  prompt: string;
  /** Interface locale (fr | en | ar | es). */
  locale: string;
}

/**
 * Builds a short description of the person talking to the assistant so the
 * answers can be tailored to their role and situation. Never throws: on any
 * failure it falls back to an anonymous visitor context.
 */
export async function buildChatUserContext(): Promise<ChatUserContext> {
  let locale = "fr";
  try {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
    if (cookieLocale && LOCALE_NAMES[cookieLocale]) locale = cookieLocale;
  } catch {
    // cookies() unavailable: keep default locale
  }

  const localeLine = `Langue de l'interface de l'utilisateur : ${LOCALE_NAMES[locale]} (${locale}). Réponds dans cette langue sauf si l'utilisateur écrit clairement dans une autre langue.`;

  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return {
        locale,
        prompt: `${localeLine}\nUtilisateur : visiteur non connecté. Il peut consulter les événements et s'inscrire en tant qu'invité ; pour créer un événement ou accéder à son profil, il doit se connecter (/sign-in) ou créer un compte (/sign-up).`,
      };
    }

    await connectToDatabase();
    const dbUser = await User.findOne({ clerkId: clerkUser.id })
      .select("_id firstName lastName role isBanned jobTitle republic")
      .lean<{
        _id: unknown;
        firstName?: string;
        lastName?: string;
        role?: string;
        isBanned?: boolean;
        jobTitle?: string;
        republic?: string;
      }>();

    if (!dbUser) {
      return {
        locale,
        prompt: `${localeLine}\nUtilisateur : connecté (${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}).`.trim(),
      };
    }

    const userId = String(dbUser._id);

    const [organisations, organizedCount, registrationsCount] = await Promise.all([
      Organisation.find({ $or: [{ creator: userId }, { admins: userId }] })
        .select("name slug isVerified creator")
        .lean<{ name: string; slug: string; isVerified?: boolean; creator?: unknown }[]>(),
      Event.countDocuments({ organizer: userId }),
      // Orders are keyed by buyer; count via the Order model lazily to avoid a
      // hard dependency if the schema changes.
      (async () => {
        try {
          const { default: Order } = await import("@/lib/database/models/order.model");
          return await Order.countDocuments({ buyer: userId });
        } catch {
          return null;
        }
      })(),
    ]);

    const name = [dbUser.firstName, dbUser.lastName].filter(Boolean).join(" ") || clerkUser.firstName || "utilisateur";
    const isAdmin = dbUser.role === "admin";
    const isOrganizer = organisations.length > 0 || organizedCount > 0;

    const lines: string[] = [localeLine, `Utilisateur connecté : ${name}.`];
    if (dbUser.jobTitle) lines.push(`Fonction : ${dbUser.jobTitle}.`);
    if (dbUser.republic) lines.push(`Pays : ${dbUser.republic}.`);

    if (isAdmin) {
      lines.push(
        "Rôle : ADMINISTRATEUR de la plateforme badgi. Il a accès au cockpit (/cockpit) : utilisateurs, vérification des organisations, signalements, catégories, outils IA, invitations."
      );
    } else if (isOrganizer) {
      lines.push("Rôle : ORGANISATEUR (membre d'au moins une organisation).");
    } else {
      lines.push(
        "Rôle : PARTICIPANT. Il n'a pas encore d'organisation ; pour créer un événement, il doit d'abord créer une organisation (/organisations/create) et attendre sa vérification."
      );
    }

    if (organisations.length > 0) {
      const orgLines = organisations.map((o) => {
        const owner = String(o.creator) === userId ? "créateur" : "admin";
        const verified = o.isVerified ? "vérifiée" : "NON vérifiée (ne peut pas encore créer d'événements)";
        return `  - ${o.name} (/organisations/${o.slug}) — ${owner}, ${verified}`;
      });
      lines.push(`Ses organisations :\n${orgLines.join("\n")}`);
    }

    if (organizedCount > 0) lines.push(`Événements qu'il organise : ${organizedCount}.`);
    if (registrationsCount !== null && registrationsCount > 0) {
      lines.push(`Inscriptions à des événements : ${registrationsCount} (visibles dans /profile → Mes inscriptions).`);
    }
    if (dbUser.isBanned) lines.push("Attention : ce compte est suspendu. Orienter vers support@badgi.net.");

    return { locale, prompt: lines.join("\n") };
  } catch (error) {
    console.error("buildChatUserContext failed:", error);
    return { locale, prompt: `${localeLine}\nUtilisateur : contexte indisponible.` };
  }
}
