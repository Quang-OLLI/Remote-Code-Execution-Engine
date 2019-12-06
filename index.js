const express = require("express");
const bodyParser = require("body-parser");
const middlewares = require("./middleware");
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "frontend/build")));

if (process.env.NODE_ENV === "production") {
     app.get("*", (req, res) => {
          res.sendFile(path.join(__dirname + "/frontend/build/index.html"));
     });
}

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
