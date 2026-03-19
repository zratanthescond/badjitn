"use server";

import { revalidatePath } from "next/cache";
import AIToolConfig from "@/lib/database/models/ai-tool-config.model";
import { connectToDatabase } from "@/lib/database";
import { readAIToolConfig } from "@/lib/ai-tool-config";
import { handleError } from "@/lib/utils";

export async function getAIToolConfig() {
  try {
    return await readAIToolConfig();
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
