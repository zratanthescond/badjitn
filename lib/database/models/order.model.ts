import { Schema, model, models, Document } from "mongoose";

enum OrderType {
  PAID = "paid",
  HOSTED = "hosted",
  DOORPAY = "doorpay",
}

export type Detail = {
  name: string;
  price: string;
};

export type DiscountType = {
  label: string;
  field: string;
  type: string;
  value: string | number;
  fieldValue: string;
};

export type RequiredUserInfoType = {
  label: string;
  field: string;
  type: string;
  value: string;
};

export interface IOrder extends Document {
  createdAt: Date;
  stripeId: string;
  totalAmount: number;
  event: {
    _id: string;
    title: string;
  };
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  type: OrderType;
  details: Detail[];
  discountInfo?: DiscountType;
  requiredUserInfo: RequiredUserInfoType[];
}

// Subdocument schema for `Detail`
const DetailSchema = new Schema<Detail>({
  name: { type: String, required: true },
  price: { type: String, required: true },
});

// Subdocument schema for `DiscountInfo`
const DiscountSchema = new Schema<DiscountType>({
  label: { type: String, required: true },
  field: { type: String, required: true },
  type: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true }, // Can be string or number
  fieldValue: { type: String, required: true },
});

// Subdocument schema for `RequiredUserInfo`
const RequiredUserInfoSchema = new Schema<RequiredUserInfoType>({
  label: { type: String, required: true },
  field: { type: String, required: true },
  type: { type: String, required: true },
  value: { type: String, required: true },
});

// Main schema for `Order`
const OrderSchema = new Schema<IOrder>({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  stripeId: {
    type: String,
    required: true,
    unique: true,
  },
  totalAmount: {
    type: Number, // Changed to Number instead of String
    required: true,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(OrderType),
    default: OrderType.PAID,
    required: true,
  },
  details: {
    type: [DetailSchema],
    required: true,
    default: [],
  },
  discountInfo: {
    type: DiscountSchema,
    required: false, // Not all orders might have discounts
  },
  requiredUserInfo: {
    type: [RequiredUserInfoSchema],
    required: false,
    default: [],
  },
});

const Order = models.Order || model<IOrder>("Order", OrderSchema);

export default Order;
