import { Schema, model, models, Document } from "mongoose";

export interface IAttendance extends Document {
  order: Schema.Types.ObjectId;
  event: Schema.Types.ObjectId;
  scanPoint: string;
  scannedAt: Date;
  scannedBy: Schema.Types.ObjectId;
}

const AttendanceSchema = new Schema({
  order: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  scanPoint: {
    type: String,
    required: true,
  },
  scannedAt: {
    type: Date,
    default: Date.now,
  },
  scannedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Attendance = models.Attendance || model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
