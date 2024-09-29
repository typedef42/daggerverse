import { dag, Container, object, func, enumType } from "@dagger.io/dagger";

@enumType()
class EnvironmentType {
  static readonly DEVELOPMENT: string = "DEVELOPMENT";
  static readonly STAGING: string = "STAGING";
  static readonly PRODUCTION: string = "PRODUCTION";
}

@object()
export class QoveryCliEnvironment {
  private container: Container;
  private organizationName?: string;
  private projectName?: string;
  private environmentName?: string;
  private clusterName?: string;

  setContainer(container: Container): void {
    this.container = container;
  }

  @func()
  setContext(
    organization: string,
    project: string,
    environment?: string,
    cluster?: string
  ): void {
    this.organizationName = organization;
    this.projectName = project;
    this.environmentName = environment;
    this.clusterName = cluster;
  }

  /**
   * List all environments in the given project
   */
  @func()
  list(): Promise<string> {
    return this.container
      .withExec([
        "qovery",
        "environment",
        "list",
        `--organization=${this.organizationName}`,
        `--project=${this.projectName}`,
      ])
      .stdout();
  }

  /**
   * Todo: test & debug in a pipeline
   */
  @func()
  cancel(force: boolean = false, watch: boolean = false): Promise<string> {
    const args = [
      "qovery",
      "environment",
      "cancel",
      `--organization=${this.organizationName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    if (force) args.push("--force");
    if (watch) args.push("--watch");
    return this.container.withExec(args).stdout();
  }

  /**
   * Clone the targetted environment into a new one
   */
  @func()
  clone(
    newEnvironmentName: string,
    environmentType: string,
    applyDeploymentRule: boolean = false
  ): Promise<string> {
    const args = [
      "qovery",
      "environment",
      "clone",
      `--environment=${this.environmentName}`,
      `--new-environment-name=${newEnvironmentName}`,
      `--environment-type=${environmentType}`,
    ];
    const argsToAdd = [
      this.clusterName && `--cluster=${this.clusterName}`,
      this.organizationName && `--organization=${this.organizationName}`,
      this.projectName && `--project=${this.projectName}`,
      applyDeploymentRule && "--apply-deployment-rule=true",
    ].filter(Boolean);

    args.push(...argsToAdd);

    if (!this.environmentName) {
      throw new Error("Environment name is required");
    }
    return this.container.withExec(args).stdout();
  }

  /**
   * Todo: test & debug in a pipeline
   */
  @func()
  delete(watch: boolean = false): Promise<string> {
    const args = [
      "qovery",
      "environment",
      "delete",
      `--organization=${this.organizationName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    if (watch) args.push("--watch");
    return this.container.withExec(args).stdout();
  }

  /**
   * Todo: test & debug in a pipeline
   */
  @func()
  deploy(
    applications?: string,
    containers?: string,
    cronjobs?: string,
    helms?: string,
    lifecycles?: string,
    services?: string,
    skipPausedServices: boolean = false,
    watch: boolean = false
  ): Promise<string> {
    const args = [
      "qovery",
      "environment",
      "deploy",
      `--organization=${this.organizationName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    if (applications) args.push(`--applications=${applications}`);
    if (containers) args.push(`--containers=${containers}`);
    if (cronjobs) args.push(`--cronjobs=${cronjobs}`);
    if (helms) args.push(`--helms=${helms}`);
    if (lifecycles) args.push(`--lifecycles=${lifecycles}`);
    if (services) args.push(`--services=${services}`);
    if (skipPausedServices) args.push("--skip-paused-services");
    if (watch) args.push("--watch");
    return this.container.withExec(args).stdout();
  }

  /**
   * Todo: test & debug in a pipeline
   */
  @func()
  redeploy(watch: boolean = false): Promise<string> {
    const args = [
      "qovery",
      "environment",
      "redeploy",
      `--organization=${this.organizationName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    if (watch) args.push("--watch");
    return this.container.withExec(args).stdout();
  }

  /**
   * Todo: test & debug in a pipeline
   */
  @func()
  statuses(json: boolean = false): Promise<string> {
    const args = [
      "qovery",
      "environment",
      "statuses",
      `--organization=${this.organizationName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    if (json) args.push("--json");
    return this.container.withExec(args).stdout();
  }

  /**
   * Todo: test & debug in a pipeline
   */
  @func()
  stop(watch: boolean = false): Promise<string> {
    const args = [
      "qovery",
      "environment",
      "stop",
      `--organization=${this.organizationName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    if (watch) args.push("--watch");
    return this.container.withExec(args).stdout();
  }

  /**
   * Todo: test & debug in a pipeline
   */
  @func()
  update(newName?: string, environmentType?: string): Promise<string> {
    const args = [
      "qovery",
      "environment",
      "update",
      `--organization=${this.organizationName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    if (newName) args.push(`--name=${newName}`);
    if (environmentType) args.push(`--type=${environmentType}`);
    return this.container.withExec(args).stdout();
  }
}
