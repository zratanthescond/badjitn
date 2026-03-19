import { connectToDatabase } from "@/lib/database";
import AIToolConfig from "@/lib/database/models/ai-tool-config.model";

export async function readAIToolConfig() {
  await connectToDatabase();

  let config = await AIToolConfig.findOne();

  if (!config) {
    config = await AIToolConfig.create({
      isRouteEnabled: true,
      userAccess: [],
    });
  }

  const raw = config.toObject ? config.toObject() : config;
  let needsRefresh = false;

  if (
    raw.allowedEmails &&
    raw.allowedEmails.length > 0 &&
    (!raw.userAccess || raw.userAccess.length === 0)
  ) {
    const defaultTools = raw.enabledTools || [
      "googleIA",
      "perplexity",
      "chatgpt",
      "xmind",
      "capcut",
      "deepl",
      "genspark",
    ];

    const now = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(now.getFullYear() + 1);

    const migrated = raw.allowedEmails.map((email: string) => ({
      email: email.trim().toLowerCase(),
      tools: defaultTools.map((toolId: string) => ({
        toolId,
        activationDate: now,
        expirationDate: nextYear,
      })),
    }));

    await AIToolConfig.findOneAndUpdate(
      {},
      { $set: { userAccess: migrated }, $unset: { allowedEmails: 1, enabledTools: 1 } }
    );

    needsRefresh = true;
  } else if (raw.userAccess && raw.userAccess.length > 0) {
    const now = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(now.getFullYear() + 1);

    let changed = false;
    const updatedUserAccess = raw.userAccess.map((user: any) => {
      if (user.enabledTools && user.enabledTools.length > 0 && (!user.tools || user.tools.length === 0)) {
        changed = true;
        return {
          email: user.email,
          tools: user.enabledTools.map((toolId: string) => ({
            toolId,
            activationDate: now,
            expirationDate: nextYear,
          })),
        };
      }

      return user;
    });

    if (changed) {
      await AIToolConfig.findOneAndUpdate({}, { $set: { userAccess: updatedUserAccess } });
      needsRefresh = true;
    }
  }

  if (needsRefresh) {
    config = await AIToolConfig.findOne();
  }

  return JSON.parse(JSON.stringify(config));
}
