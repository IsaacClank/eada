import { Router } from "@oak/oak/router";

export const router = new Router();
router.get("/health", ({ response: res }) => (res.status = 200));
