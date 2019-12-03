const express = require("express");
const bodyParser = require("body-parser");
const DockerMananger = require("./docker-manager");
const multer = require("multer");
const uuid = require("uuid");
const fs = require("fs");

const app = express();

let storage = multer.diskStorage({
     destination: function(req, file, callback) {
          callback(null, "./project/src");
     },
     filename: function(req, file, callback) {
          const ext = file.originalname.split(".")[1];
          req.sourceFile = uuid();
          callback(null, req.sourceFile + `.${ext}`);
     }
});

let upload = multer({ storage: storage }).single("source");

async function compileCode(filename) {
     let docker = new DockerMananger();
     const name = await docker.createContainer();
     console.log(`Container : ${name} created....`);
     let resp = await docker.execute([
          "gcc",
          "-o",
          `/project/bin/${filename}`,
          `/project/src/${filename}.c`
     ]);
     if (resp != "") {
          docker.removeContainer();
          fs.unlink(`./project/src/${filename}.c`, err => {
               console.log(err);
          });
          fs.unlink(`./project/bin/${filename}`, err => console.log(err));
          return {
               type: "Compilation error",
               error: resp
          };
     } else {
          // Check for infinite loops!
          resp = await docker.execute([`/project/bin/${filename}`]);

          docker.removeContainer();
          fs.unlink(`./project/src/${filename}.c`, err => console.log(err));
          fs.unlink(`./project/bin/${filename}`, err => console.log(err));
          return {
               type: "Execution Result",
               output: resp
          };
     }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", upload, async (req, res, next) => {
     const output = await compileCode(req.sourceFile);
     res.json({ filename: req.sourceFile, output });
});

app.listen(3000, () => console.log("Listening on port 3000!"));
