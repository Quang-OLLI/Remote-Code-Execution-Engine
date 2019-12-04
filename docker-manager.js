const Docker = require("dockerode");
const uuid = require("uuid");

function stringCleaner(str) {
     // // str.split("\n").forEach(st => {
     // //      for (var i = 0; i < st.length; i++) {
     // //           if (st.charAt(i) === "�") {
     // //                st[i] = " ";
     // //           }
     // //      }
     // // });
     // // return str;
     // let clean = "";
     // str = str.substring(8);
     // [...str].forEach(ch => {
     //      if (ch !== " ") {
     //           if (ch.match(/([A-Z]|[a-z]|[-:\\\/])\w+/g)) {
     //                clean += ch;
     //           }
     //      }
     // });
     // console.log(clean.split("\n"));
     // return clean;
     return str;
}

module.exports = class DockerManager {
     constructor() {
          this.docker = new Docker();
     }

     getContainerName() {
          const containerUUID = uuid().split("-")[0];
          return `try-package-${containerUUID}`;
     }

     async createContainer() {
          this.containerName = this.getContainerName();
          this.container = await this.docker.createContainer({
               Image: "my-compiler",
               name: this.containerName,
               Binds: [`${process.cwd()}/project:/project`],
               Tty: true,
               OpenStdin: false,
               AttachStdin: true,
               WorkingDir: "/"
          });
          await this.container.start();
          return this.containerName;
     }

     async execute(command) {
          const exec = await this.container.exec({
               Cmd: command,
               AttachStdin: false,
               AttachStdout: true,
               AttachStderr: true
          });
          return new Promise(async (resolve, reject) => {
               await exec.start(async (err, stream) => {
                    if (err) return reject();
                    let message = "";
                    stream.on("data", data => {
                         message += data.toLocaleString();
                         return stringCleaner(message);
                    });
                    stream.on("end", () => resolve(message));
               });
          });
     }

     removeContainer() {
          return this.container.remove({ force: true });
     }
};
