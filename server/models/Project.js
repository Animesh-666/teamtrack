import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    projectName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "completed", "on-hold"],
      default: "active",
      lowercase: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Populate projectName from name if not provided before validation/save
projectSchema.pre("save", function (next) {
  if (this.name && !this.projectName) {
    this.projectName = this.name;
  }
  if (this.projectName && !this.name) {
    this.name = this.projectName;
  }
  if (this.endDate && !this.dueDate) {
    this.dueDate = this.endDate;
  }
  if (this.dueDate && !this.endDate) {
    this.endDate = this.dueDate;
  }
  next();
});

const Project = mongoose.model("Project", projectSchema);
export default Project;