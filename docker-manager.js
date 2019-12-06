const Docker = require("dockerode");
const short = require("short-uuid");
const uuid = short();

module.exports = class DockerManager {
     constructor() {
          this.docker = new Docker();
     }

     getContainerName() {
          const containerUUID = uuid.new();
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
               WorkingDir: "/",
               StopTimeout: 7
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
                         return message;
                    });
                    stream.on("end", () => resolve(message));
               });
          });
     }

     stop() {
          return this.container.stop({ t: 10 });
     }

     async inspect() {
          const data = await this.container.inspect();
          return data;
     }

     removeContainer() {
          return this.container.remove({ force: true });
     }
};
