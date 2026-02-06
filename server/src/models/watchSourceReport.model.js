import mongoose from "mongoose";
import modelOptions from "./model.options.js";

const watchSourceReportSchema = new mongoose.Schema({
  source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WatchSource",
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ["open", "resolved"],
    default: "open"
  }
}, modelOptions);

const watchSourceReportModel = mongoose.model("WatchSourceReport", watchSourceReportSchema);

export default watchSourceReportModel;
