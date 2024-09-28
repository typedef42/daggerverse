import { dag, Container, Directory, object, func } from "@dagger.io/dagger"

@object()
class MyCi {
  private async base(source: Directory): Promise<Container> {
    return await dag
      .node()
      .withVersion("22.9.0")
      .withYarn()
      .ctr()
      .withMountedDirectory("/mnt", source)
      .withWorkdir("/mnt")
      .withExec(["corepack", "enable"])
      .withExec(["yarn", "set", "version", "stable"])
      .withExec(["yarn", "install"]);
  }

  /**
   * Returns lines that match a pattern in the files of the provided Directory
   */
  @func()
  async build(source: Directory): Promise<Container> {
    return (await this.base(source)).withExec(["yarn", "build"]);
  }

   /**
   * Returns a container that echoes whatever string argument is provided
   */
   @func()
   async test(source: Directory): Promise<string> {
     return (await this.build(source)).withExec(["yarn", "test"]).stdout();
   }

   /**
   * Returns a container that echoes whatever string argument is provided
   */
   @func()
   async deploy(source: Directory): Promise<string> {
     return (await this.build(source)).qovery().version()
   }
}
