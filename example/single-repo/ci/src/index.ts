import { dag, Container, Directory, object, func } from "@dagger.io/dagger"

@object()
class MyCi {
  private ctr: Container;

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

  @func()
  install(source: Directory): MyCi {
    this.ctr = dag
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
    return this;
  }
  
  /**
   * Build the source code
   */
  @func()
  build(): MyCi {
    this.container().withExec(["yarn", "build"]);
    return this;
  }

   /**
   * Returns 
   */
   @func()
   test(): MyCi {
     this.container().withExec(["yarn", "test"]);
     return this;
   }

   /**
   * Returns 
   */
   @func()
   publish(qoveryToken: string): MyCi {
    dag.qovery().withContainer(this.container()).withCli(qoveryToken).version();
    return this;
   }

   /**
   * Returns 
   */
   @func()
   async deploy(qoveryToken: string): Promise<MyCi> {
    //qovery environment clone --cluster="staging (aws)" --environment=blueprint --environment-type=development --new-environment-name=blueprint-clone --organization=pharaday --project=staging
    //qovery container update --container="api-harbor" --organization=pharaday --project=staging --environment="prewview-yann" --tag="0.1.2-c9dd252e"
    //qovery container list --environment=prewview-yann
    //qovery environment statuses --environment="prewview-yann"

    const qoveryCli = dag.qovery().withContainer(this.container()).withCli(qoveryToken).withOrganization("pharaday");

    await qoveryCli.withProject("staging").environment().list();
    await qoveryCli.withProject("staging").withEnvironment("blueprint").withCluster("staging (aws)").environment().clone("blueprint-clone", "DEVELOPMENT");

    return this;
    //TODO: deploy the container
  }

   /**
   * Returns 
   */
   @func()
   async pipeline(source: Directory, qoveryToken: string): Promise<void> {
    await this.install(source).deploy(qoveryToken);

    // return (await this.install(source).build().test().publish(qoveryToken).deploy(qoveryToken)).container().stdout();
   }
}
