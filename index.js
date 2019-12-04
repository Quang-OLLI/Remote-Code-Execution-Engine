const express = require("express");
const bodyParser = require("body-parser");
const DockerMananger = require("./docker-manager");
const multer = require("multer");
const short = require("short-uuid");
const fs = require("fs");
const uuid = short();
const app = express();

let storage = multer.diskStorage({
     destination: function(req, file, callback) {
          if (file.fieldname === "source") {
               callback(null, "./project/src");
          } else if (file.fieldname === "input") {
               console.log("Im trying to store input");
               callback(null, "./project/IO");
          }
     },
     filename: function(req, file, callback) {
          if (file.fieldname === "source") {
               const ext = file.originalname.split(".")[1];
               req.sourceFile = uuid.new() + `.${ext}`;
               callback(null, req.sourceFile);
          } else if (file.fieldname === "input") {
               req.inputFile = uuid.new() + ".in";
               callback(null, req.inputFile);
          }
     }
});

let upload = multer({ storage: storage }).any();

function getCCmd(language, fname) {
     if (language === "c") {
          return [
               "/bin/sh",
               "-c",
               `gcc -o /project/bin/${
                    fname.split(".")[0]
               } /project/src/${fname}`
          ];
     } else if (language === "cpp") {
          return [
               "/bin/sh",
               "-c",
               `g++ -o /project/bin/${
                    fname.split(".")[0]
               } /project/src/${fname}`
          ];
     }
}

function getECmd(language, fname, iname) {
     if (language === "c" || language === "cpp") {
          return [
               "/bin/sh",
               "-c",
               `/project/bin/${fname.split(".")[0]} < project/IO/${iname};`
          ];
     }
}

async function compileCode(filename, inputFile, language) {
     let docker = new DockerMananger();
     const name = await docker.createContainer();
     console.log(`Container : ${name} created....`);
     let compileCmd = getCCmd(language, filename);
     let execCmd = getECmd(language, filename, inputFile);
     let resp = await docker.execute(compileCmd);
     console.log("compilation result", resp);
     if (resp !== "") {
          docker.removeContainer();
          fs.unlink(`./project/src/${filename}`, err => {
               console.log(err);
          });
          fs.unlink(`./project/bin/${filename.split(".")[0]}`, err =>
               console.log(err)
          );
          fs.unlink(`./project/IO/${inputFile}`, err => console.log(err));

          return {
               type: "Compilation error",
               error: resp
          };
     } else {
          // Check for infinite loops!
          resp = await docker.execute(execCmd);
          docker.removeContainer();
          fs.unlink(`./project/src/${filename}`, err => console.log(err));
          fs.unlink(`./project/bin/${filename.split(".")[0]}`, err =>
               console.log(err)
          );
          fs.unlink(`./project/IO/${inputFile}`, err => console.log(err));
          return {
               type: "Execution Result",
               output: resp
          };
     }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/:language", upload, async (req, res, next) => {
     const output = await compileCode(
          req.sourceFile,
          req.inputFile,
          req.params.language
     );
     console.log("Output", output);
     res.json({ filename: req.sourceFile, input: req.inputFile, output });
});

app.listen(4000, () => console.log("Listening on port 3000!"));
