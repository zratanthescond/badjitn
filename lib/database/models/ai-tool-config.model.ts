import { Schema, model, models, Document } from "mongoose";

export interface IToolAccessDetail {
  toolId: string;
  activationDate: Date;
  expirationDate: Date;
}

export interface IUserToolAccess {
  email: string;
  tools: IToolAccessDetail[];
}

export interface IAIToolConfig extends Document {
  isRouteEnabled: boolean;
  userAccess: IUserToolAccess[];
}

const ToolAccessDetailSchema = new Schema({
  toolId: { type: String, required: true },
  activationDate: { type: Date, required: true },
  expirationDate: { type: Date, required: true },
}, { _id: false });

const UserToolAccessSchema = new Schema({
  email: { type: String, required: true },
  tools: { 
    type: [ToolAccessDetailSchema], 
    default: [] 
  },
}, { _id: false });

const AIToolConfigSchema = new Schema({
  isRouteEnabled: { type: Boolean, default: true },
  userAccess: { type: [UserToolAccessSchema], default: [] },
});

const AIToolConfig = models.AIToolConfig || model("AIToolConfig", AIToolConfigSchema);

export default AIToolConfig;
