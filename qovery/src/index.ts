import { dag, Container, Directory, object, func } from "@dagger.io/dagger";

@object()
class Qovery {
  /**
   * Returns a container that have the qovery cli installed
   */
  @func()
  qovery(): Container {
    return dag
      .container()
      .from("alpine:latest")
      .withExec(["apk", "add", "--no-cache", "bash", "curl", "tar", "sudo"])
      .withExec([
        "bash",
        "-c",
        "curl -s https://get.qovery.com > install.sh && chmod +x install.sh && bash install.sh",
      ]);
  }

  /**
   * Returns the version of the qovery cli
   */
  @func()
  async version(): Promise<string> {
    return await this.qovery().withExec(["qovery", "version"]).stdout();
  }
}
