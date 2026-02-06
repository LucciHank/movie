import express from "express";
import personController from "../controllers/person.controller.js";

const router = express.Router({ mergeParams: true });

// List routes (must come before parameterized routes)
router.get("/popular", personController.personPopular);

router.get("/:personId/medias", personController.personMedias);

router.get("/:personId", personController.personDetail);

export default router;