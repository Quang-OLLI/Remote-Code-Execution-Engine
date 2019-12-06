const DockerMananger = require("./docker-manager");
const short = require("short-uuid");
const uuid = short();
const fs = require("fs");

// File Middleware
const createFiles = async (req, res, next) => {
     req.sourceFile = uuid.new() + `.${req.params.language}`;
     req.inputFile = uuid.new() + ".in";

     fs.writeFile(`./project/src/${req.sourceFile}`, req.body.code, err => {
          if (err) {
               res.json({ error: err });
          }
          fs.writeFile(
               `./project/IO/${req.inputFile}`,
               req.body.input,
               async err => {
                    if (err) {
                         res.json({ error: err });
                    }
                    next();
               }
          );
     });
};
// These arr utilities
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

function deleteFiles(filename, inputFile) {
     fs.access(`./project/src/${filename}`, fs.F_OK, err => {
          if (err) {
               return;
          }
          fs.unlink(`./project/src/${filename}`, err => {
               if (err) {
                    console.log(err);
               }
          });
     });
     fs.access(`./project/bin/${filename.split(".")[0]}`, fs.F_OK, err => {
          if (err) {
               return;
          }
          fs.unlink(`./project/bin/${filename.split(".")[0]}`, err => {
               if (err) {
                    console.log(err);
               }
          });
     });
     fs.access(`./project/IO/${inputFile}`, fs.F_OK, err => {
          if (err) {
               return;
          }
          fs.unlink(`./project/IO/${inputFile}`, err => {
               if (err) {
                    console.log(err);
               }
          });
     });
}

// code compiler

const compileCode = async (req, res, next) => {
     const filename = req.sourceFile,
          inputFile = req.inputFile,
          language = req.params.language;
     let docker = new DockerMananger();
     const name = await docker.createContainer();
     console.log(`Container : ${name} created....`);
     let compileCmd = getCCmd(language, filename);
     let execCmd = getECmd(language, filename, inputFile);
     let resp = await docker.execute(compileCmd);
     if (resp !== "") {
          docker.removeContainer();
          deleteFiles(filename, inputFile);
          req.ans = {
               type: "Compilation error",
               error: resp,
               output: "CERR"
          };
          next();
     } else {
          // Check for infinite loops!
          // docker.stop();
          let timer = setTimeout(async () => {
               try {
                    console.log("Process timed Out! Check for infinite loops!");
                    const inspectData = await docker.inspect();
                    if (inspectData.State.Running) {
                         docker.removeContainer();
                         deleteFiles(filename, inputFile);
                         console.log(
                              "Detected infinite loop! Killing right away...."
                         );
                         req.error = {
                              type: "Timeout",
                              error: "Time limit exceeded!",
                              output: "TLE"
                         };
                         next();
                    }
               } catch (err) {
                    // Do Nothing
               }
          }, 5000);
          resp = await docker.execute(execCmd);
          clearTimeout(timer);
          docker.removeContainer();
          deleteFiles(filename, inputFile);
          req.ans = {
               error: "NIL",
               type: "Execution Result",
               output: resp
          };
          next();
     }
};

module.exports = { createFiles, compileCode };
