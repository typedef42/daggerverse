import { dag, Container, Directory, object, func, File, Platform } from "@dagger.io/dagger"

@object()
class MyCi {
  private ctr: Container;
  private currentTag?: string;

  private assertContainer(): void {
    if (!this.container) {
      throw new Error(
        "[error] Container is not set, use install() first"
      );
    }
  }

  container(): Container {
    this.assertContainer();
    return this.ctr;
  }

  /**
   * Prepare a working container to build code and run tests
   */
  @func()
  async install(source: Directory): Promise<MyCi> {
    this.ctr = await dag
      .node()
      .withVersion("22.9.0")
      .withYarn()
      .ctr()
      .withMountedDirectory("/mnt", source)
      .withWorkdir("/mnt")
      .withExec(["corepack", "enable"])
      .withExec(["yarn", "set", "version", "stable"])
      .withExec(["yarn", "install"])
      .withExec(["apt-get", "update"])
      .withExec(["apt-get", "install", "-y", "bash", "curl", "tar", "sudo"]);

    await this.ctr.stdout();
    return this;
  }
  
  /**
   * Build the source code
   */
  @func()
  async build(): Promise<MyCi> {
    await this.container().withExec(["yarn", "build"]).stdout();
    return this;
  }

   /**
   * Running tests  
   */
   @func()
   async test(): Promise<MyCi> {
     await this.container().withExec(["yarn", "test"]).stdout();
     return this;
   }

   async awsPublish(source: Directory, awsAccountId: string, awsCredentials: File, awsContainerRepository: string) {
    const platform: Platform = "linux/amd64" as Platform;

    const appContainer = dag.container({platform})
      .build(source);

    return await dag.aws().ecrPush(
      awsCredentials,
      "eu-west-3", 
      awsAccountId , 
      awsContainerRepository, 
      appContainer
    );
  }

  /**
   * Build app docker image using target architecture and pushing to AWS ECR
   */
   @func()
   async publish(source: Directory, awsAccountId: string, awsCredentials: File, awsContainerRepository: string): Promise<MyCi> {
    const tag = Array.from({ length: 7 }, () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      return chars.charAt(Math.floor(Math.random() * chars.length));
    }).join('');

    await this.awsPublish(source, awsAccountId, awsCredentials, `${awsContainerRepository}:${tag}`);
    this.currentTag = tag;
    return this;
   }

   /**
   * Deploy an environment on Qovery (by cloning an existing environment and updating the targetted container)
   */
   @func()
   async deploy(qoveryToken: string): Promise<MyCi> {
    if (!this.currentTag) {
      console.log("No Current tag defined, nothing to deploy");
      return this;
    }

    // qovery image on default container
    const previewEnvironmentName = `prewview-${this.currentTag}`;
    const qoveryCli = dag.qovery().withCli(qoveryToken).withOrganization("pharaday").withProject("development");
    
    await qoveryCli.withEnvironment("test-blueprint").withCluster("staging (aws)").environment().clone(previewEnvironmentName, "DEVELOPMENT");
    await qoveryCli.withEnvironment(previewEnvironmentName).container().update("backend", { tag: this.currentTag });
    await qoveryCli.withEnvironment(previewEnvironmentName).environment().deploy({skipPausedServices: true, watch: true});
    await qoveryCli.withEnvironment(previewEnvironmentName).environment().statuses();
    
    return this;
  }

   /**
   * Execute global ci pipeline (install, build, test, publish, deploy)
   */
   @func()
   async pipeline(source: Directory, qoveryToken: string, awsAccountId: string, awsCredentials: File, awsContainerRepository: string): Promise<string> {
    let ci = await this.install(source);
    console.log("🟢🟢🟢 install done! 🟢🟢🟢");  

    ci = await ci.build();
    console.log("🟢🟢🟢 build done! 🟢🟢🟢");

    ci = await ci.test();
    console.log("🟢🟢🟢 test done! 🟢🟢🟢");

    ci = await ci.publish(source, awsAccountId, awsCredentials, awsContainerRepository);
    console.log("🟢🟢🟢 publish done! 🟢🟢🟢");

    ci = await ci.deploy(qoveryToken);
    console.log("🟢🟢🟢 deploy done! 🟢🟢🟢");

    return "🚀🚀🚀 CI pipeline done! 🚀🚀🚀";
   }
}
