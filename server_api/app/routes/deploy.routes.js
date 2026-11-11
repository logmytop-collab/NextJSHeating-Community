import bodyParser from "body-parser";
import { exec, execFile } from "node:child_process";
import multer from "multer";
import { verifyToken } from "./../middleware/authJwt.js";

async function deployMe(req, res) {
  console.log("pwd");
  exec("pwd", (error, stdout, stderr) => {
    console.log("error:", error);
    console.log("stdout:", stdout);
    console.log("stderr:", stderr);
  });
  execFile("./app/scripts/deploy.sh", (error, stdout, stderr) => {
    console.log("error:", error);
    console.log("stdout:", stdout);
    console.log("stderr:", stderr);
    if (error) {
      return res.status(500).json({
        error: error.message,
        stderr,
      });
    }

    res.json({
      success: true,
      output: stdout,
    });
  });
}

async function reboot(req, res) {
  console.log("pwd");
  execFile("ssh root@host 'sudo reboot'", (error, stdout, stderr) => {
    console.log("error:", error);
    console.log("stdout:", stdout);
    console.log("stderr:", stderr);
    if (error) {
      return res.status(500).json({
        error: error.message,
        stderr,
      });
    }

    res.json({
      success: true,
      output: stdout,
    });
  });
}

export default function deployRoutes(app) {
  app.use(bodyParser.json({ limit: "1kb", sizeLimit: "1kb" }));
  app.use(
    bodyParser.urlencoded({
      limit: "1kb",
      sizeLimit: "1kb",
      extended: true,
    }),
  );

  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept",
    );
    next();
  });

  app.post("/heating/deployme", [verifyToken], deployMe);
  app.post("/heating/toober", [verifyToken], reboot);
}
