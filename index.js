const express = require("express");
const bodyParser = require("body-parser");
const DockerMananger = require("./docker-manager");
const fs = require("fs");
const middlewares = require("./middleware");

const app = express();

// async function compileCode(filename, inputFile, language, res) {
//      let docker = new DockerMananger();
//      const name = await docker.createContainer();
//      console.log(`Container : ${name} created....`);
//      let compileCmd = getCCmd(language, filename);
//      let execCmd = getECmd(language, filename, inputFile);
//      let resp = await docker.execute(compileCmd);
//      if (resp !== "") {
//           docker.removeContainer();
//           deleteFiles(filename, inputFile);
//           return {
//                type: "Compilation error",
//                error: resp
//           };
//      } else {
//           // Check for infinite loops!
//           // docker.stop();
//           let timer = setTimeout(async () => {
//                console.log("Process timed Out! Check for infinite loops!");
//                const inspectData = await docker.inspect();
//                if (inspectData.State.Running) {
//                     docker.removeContainer();
//                     deleteFiles(filename, inputFile);
//                     console.log(
//                          "Detected infinite loop! Killing right away...."
//                     );
//                     res.json({
//                          output: {
//                               type: "Timeout",
//                               error: "Time limit exceeded!"
//                          }
//                     });
//                }
//           }, 2000);
//           resp = await docker.execute(execCmd);
//           clearTimeout(timer);
//           docker.removeContainer();
//           deleteFiles(filename, inputFile);
//           return {
//                type: "Execution Result",
//                output: resp
//           };
//      }
// }

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post(
     "/:language",
     [middlewares.createFiles, middlewares.compileCode],
     async (req, res) => {
          if (req.error !== undefined) {
               res.json({
                    ...req.error,
                    ...req.ans
               });
          } else {
               res.json(req.ans);
          }
     }
);

app.listen(5000, () => console.log("Listening on port 5     000!"));
