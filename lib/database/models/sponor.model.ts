import mongoose, { Schema, Document, model, models } from "mongoose";

// Define the interface for the Sponsor document
interface ISponsor extends Document {
  eventId: mongoose.Types.ObjectId; // Reference to the Event document

  fromDate: Date;
  toDate: Date;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Sponsor schema
const SponsorSchema: Schema = new Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event", // Reference to the Event model
      required: true,
    },

    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
      min: [0, "Total cost cannot be negative"],
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the Sponsor model
const Sponsor = models.Sponsor || model<ISponsor>("Sponsor", SponsorSchema);

export default Sponsor;
