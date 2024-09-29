import { dag, Container, object, func } from "@dagger.io/dagger";
import { QoveryCliEnvironment } from "./cli-environment";

@object()
export class QoveryCli {
  private ctr?: Container;
  private organizationName?: string;
  private projectName?: string;
  private environmentName?: string;
  private clusterName?: string;
  private environmentModule: QoveryCliEnvironment;

  private assertContainer(): void {
    if (!this.container) {
      throw new Error(
        "[error] QoveryCLI in not installed correctly: Container is not set"
      );
    }
  }

  @func()
  container(): Container {
    this.assertContainer();
    return this.ctr;
  }

  @func()
  withProject(projectName: string): QoveryCli {
    this.projectName = projectName;
    return this;
  }

  @func()
  withEnvironment(environmentName: string): QoveryCli {
    this.environmentName = environmentName;
    return this;
  }

  @func()
  withCluster(clusterName: string): QoveryCli {
    this.clusterName = clusterName;
    return this;
  }

  @func()
  withOrganization(organizationName: string): QoveryCli {
    this.organizationName = organizationName;
    return this;
  }

  /**
   * Returns this module with the qovery cli installed
   */
  @func()
  install(container: Container, qoveryToken: string): QoveryCli {
    this.ctr = container
      .withEnvVariable("QOVERY_CLI_ACCESS_TOKEN", qoveryToken)
      .withExec([
        "bash",
        "-c",
        "curl -s https://get.qovery.com > install.sh && chmod +x install.sh && bash install.sh",
      ]);
    // .withExec(["qovery", "auth", "--headless"]);

    return this;
  }

  /**
   * Returns the version of the qovery cli
   */
  @func()
  version(): Promise<string> {
    return this.container().withExec(["qovery", "version"]).stdout();
  }

  @func()
  environment(): QoveryCliEnvironment {
    if (!this.environmentModule) {
      this.environmentModule = new QoveryCliEnvironment();
      this.environmentModule.setContainer(this.container());
    }

    this.environmentModule.setContext(
      this.organizationName,
      this.projectName,
      this.environmentName,
      this.clusterName
    );
    return this.environmentModule;
  }
}
