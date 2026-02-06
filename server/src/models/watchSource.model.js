import mongoose from "mongoose";
import modelOptions from "./model.options.js";

const watchSourceSchema = new mongoose.Schema({
  mediaType: {
    type: String,
    enum: ["movie", "tv"],
    required: true
  },
  mediaId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  playbackType: {
    type: String,
    enum: ["embed", "hls", "external"],
    default: "external"
  },
  url: {
    type: String,
    required: true
  },
  quality: {
    type: String,
    default: "unknown"
  },
  language: {
    type: String,
    default: "und"
  },
  licenseType: {
    type: String,
    enum: ["public-domain", "creative-commons", "commercial", "other"],
    required: true
  },
  licenseProofUrl: {
    type: String,
    default: null
  },
  regionAllowlist: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ["active", "flagged", "removed"],
    default: "active"
  },
  createdBy: {
    type: String,
    default: "system"
  }
}, modelOptions);

watchSourceSchema.index({ mediaType: 1, mediaId: 1, status: 1 });

const watchSourceModel = mongoose.model("WatchSource", watchSourceSchema);

export default watchSourceModel;
