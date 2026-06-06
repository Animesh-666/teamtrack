import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Report must be associated with a user"],
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Report must be associated with a project"],
    },
    reportText: {
      type: String,
      required: [true, "Report text detail is required"],
      trim: true,
    },
    hoursWorked: {
      type: Number,
      required: [true, "Hours worked is required"],
      min: [0, "Hours worked cannot be negative"],
      max: [24, "Hours worked cannot exceed 24 hours"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;