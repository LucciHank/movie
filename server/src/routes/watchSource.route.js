import express from "express";
import { body, param } from "express-validator";
import watchSourceController from "../controllers/watchSource.controller.js";
import requestHandler from "../handlers/request.handler.js";
import tokenMiddleware from "../middlewares/token.middleware.js";

const router = express.Router();

router.get(
  "/:mediaType/:mediaId",
  param("mediaType").custom((type) => ["movie", "tv"].includes(type)).withMessage("mediaType invalid"),
  requestHandler.validate,
  watchSourceController.getSourcesByMedia
);

router.post(
  "/",
  tokenMiddleware.auth,
  body("mediaType").custom((type) => ["movie", "tv"].includes(type)).withMessage("mediaType invalid"),
  body("mediaId").exists().withMessage("mediaId is required").isLength({ min: 1 }).withMessage("mediaId can not be empty"),
  body("title").exists().withMessage("title is required").isLength({ min: 1 }).withMessage("title can not be empty"),
  body("provider").exists().withMessage("provider is required").isLength({ min: 1 }).withMessage("provider can not be empty"),
  body("playbackType").optional().custom((type) => ["embed", "hls", "external"].includes(type)).withMessage("playbackType invalid"),
  body("url").exists().withMessage("url is required").isURL().withMessage("url invalid"),
  body("licenseType").custom((type) => ["public-domain", "creative-commons", "commercial", "other"].includes(type)).withMessage("licenseType invalid"),
  body("licenseProofUrl").optional({ nullable: true }).isURL().withMessage("licenseProofUrl invalid"),
  body("regionAllowlist").optional().isArray().withMessage("regionAllowlist must be array"),
  requestHandler.validate,
  watchSourceController.createSource
);

router.patch(
  "/:sourceId",
  tokenMiddleware.auth,
  param("sourceId").isMongoId().withMessage("sourceId invalid"),
  body("playbackType").optional().custom((type) => ["embed", "hls", "external"].includes(type)).withMessage("playbackType invalid"),
  body("status").optional().custom((status) => ["active", "flagged", "removed"].includes(status)).withMessage("status invalid"),
  body("licenseType").optional().custom((type) => ["public-domain", "creative-commons", "commercial", "other"].includes(type)).withMessage("licenseType invalid"),
  body("regionAllowlist").optional().isArray().withMessage("regionAllowlist must be array"),
  requestHandler.validate,
  watchSourceController.updateSource
);

router.post(
  "/:sourceId/reports",
  param("sourceId").isMongoId().withMessage("sourceId invalid"),
  body("reason").exists().withMessage("reason is required").isLength({ min: 5 }).withMessage("reason too short"),
  body("email").optional({ nullable: true }).isEmail().withMessage("email invalid"),
  requestHandler.validate,
  watchSourceController.createReport
);

router.get(
  "/reports/open",
  tokenMiddleware.auth,
  watchSourceController.getReports
);

export default router;
