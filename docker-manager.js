const Docker = require("dockerode");
const uuid = require("uuid");

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
               OpenStdin: true,
               WorkingDir: "/"
          });
          await this.container.start();
          return this.containerName;
     }

     async execute(command) {
          const exec = await this.container.exec({
               Cmd: command,
               AttachStdout: true,
               AttachStderr: true
          });
          return new Promise(async (resolve, reject) => {
               await exec.start(async (err, stream) => {
                    if (err) return reject();
                    let message = "";
                    stream.on("data", data => (message += data.toString()));
                    stream.on("end", () => resolve(message));
               });
          });
     }

     removeContainer() {
          return this.container.remove({ force: true });
     }
};
