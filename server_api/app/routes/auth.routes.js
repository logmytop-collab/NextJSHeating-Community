import {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted,
} from "./../middleware/verifySignUp.js";
import { signup, signin } from "../controllers/auth.controller.js";
import multer from "multer";
const upload = multer({
  limits: { fieldSize: 1024 * 1024 }, // Set limit to 250MB
});

export default function authRoutes(app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept",
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [checkDuplicateUsernameOrEmail, checkRolesExisted],
    signup,
  );

  //app.post("/api/auth/signin", signin);
  //app.post("/api/auth/signin", signin);
  //app.post("/api/login", signin);
  //app.get("/api/login", signin);
  app.post("/heating/login", signin);
}
