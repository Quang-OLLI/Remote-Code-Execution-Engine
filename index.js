const express = require("express");
const bodyParser = require("body-parser");
const DockerMananger = require("./docker-manager");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/:name", async (req, res) => {
     let filename = req.params.name;
     let docker = new DockerMananger();
     const name = await docker.createContainer();
     console.log(`Container : ${name} created....`);
     let resp = await docker.execute([
          "gcc",
          "-o",
          `/project/bin/${filename}`,
          `/project/src/${filename}.c`
     ]);
     docker.removeContainer();
     res.json({ op: resp });
});

app.listen(3000, () => console.log("Listening on port 3000!"));
