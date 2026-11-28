import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["dat-ve-nhom", "tai-khoan", "nap-tien", "hoan-tien", "hoan-ve", "khac"],
      default: "khac",
      index: true,
    },
    categoryLabel: { type: String, required: true, trim: true },
    customIssue: { type: String, default: "", trim: true },
    detail: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["unread", "processing", "resolved"],
      default: "unread",
      index: true,
    },
    isMarked: { type: Boolean, default: false, index: true },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("SupportTicket", supportTicketSchema);
