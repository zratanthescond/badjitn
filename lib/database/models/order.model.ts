import { Schema, model, models, Document } from "mongoose";

enum OrderType {
  PAID = "paid",
  HOSTED = "hosted",
}

export type Detail = {
  name: string;
  price: string;
};

export interface IOrder extends Document {
  createdAt: Date;
  stripeId: string;
  totalAmount: string;
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
}

export type IOrderItem = {
  _id: string;
  totalAmount: string;
  createdAt: Date;
  eventTitle: string;
  eventId: string;
  buyer: string;
  type: OrderType;
  details: Detail[];
};

// Subdocument schema for `Detail`
const DetailSchema = new Schema<Detail>({
  name: { type: String, required: true },
  price: { type: String, required: true },
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
    type: String,
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
});

const Order = models.Order || model<IOrder>("Order", OrderSchema);

export default Order;
