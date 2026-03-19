"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import AIToolConfig from "@/lib/database/models/ai-tool-config.model";
import { handleError } from "@/lib/utils";

export async function getAIToolConfig() {
  try {
    await connectToDatabase();
    
    let config = await AIToolConfig.findOne();
    
    if (!config) {
      config = await AIToolConfig.create({
        isRouteEnabled: true,
        userAccess: []
      });
    }
    
    // Migrate legacy data: if old allowedEmails exist
    const raw = config.toObject ? config.toObject() : config;
    let needsSave = false;
    
    if (raw.allowedEmails && raw.allowedEmails.length > 0 && (!raw.userAccess || raw.userAccess.length === 0)) {
      const defaultTools = raw.enabledTools || ["googleIA", "perplexity", "chatgpt", "xmind", "capcut", "deepl", "genspark"];
      
      const now = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(now.getFullYear() + 1);

      const migrated = raw.allowedEmails.map((email: string) => ({
        email: email.trim().toLowerCase(),
        tools: defaultTools.map((t: string) => ({
          toolId: t,
          activationDate: now,
          expirationDate: nextYear
        }))
      }));
      
      await AIToolConfig.findOneAndUpdate(
        {},
        { $set: { userAccess: migrated }, $unset: { allowedEmails: 1, enabledTools: 1 } }
      );
      
      needsSave = true;
    } else if (raw.userAccess && raw.userAccess.length > 0) {
      // Migrate from enabledTools (strings) to tools (objects) inside userAccess
      const now = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(now.getFullYear() + 1);
      
      let changed = false;
      const updatedUserAccess = raw.userAccess.map((user: any) => {
        if (user.enabledTools && user.enabledTools.length > 0 && (!user.tools || user.tools.length === 0)) {
          changed = true;
          return {
            email: user.email,
            tools: user.enabledTools.map((t: string) => ({
              toolId: t,
              activationDate: now,
              expirationDate: nextYear
            }))
          };
        }
        return user;
      });

      if (changed) {
        // Also unset enabledTools to clean up
        await AIToolConfig.findOneAndUpdate(
          {},
          { $set: { userAccess: updatedUserAccess } }
        );
        // We'll leave $unset logic simple or mongoose schema strict mode should drop it.
        needsSave = true;
      }
    }

    if (needsSave) {
      config = await AIToolConfig.findOne();
    }
    
    return JSON.parse(JSON.stringify(config));
  } catch (error) {
    handleError(error);
  }
}

export async function updateAIToolConfig(data: { 
  isRouteEnabled?: boolean; 
  userAccess?: { 
    email: string; 
    tools: { toolId: string; activationDate: Date; expirationDate: Date }[] 
  }[] 
}) {
  try {
    await connectToDatabase();
    
    const updatedConfig = await AIToolConfig.findOneAndUpdate(
      {},
      { $set: data },
      { new: true, upsert: true }
    );
    
    revalidatePath("/ai-tools");
    revalidatePath("/cockpit");
    revalidatePath("/");
    
    return JSON.parse(JSON.stringify(updatedConfig));
  } catch (error) {
    handleError(error);
  }
}
