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

  ensureMandatoryContext(args: { [key: string]: string | undefined }): void {
    const missingArgs = Object.entries(args)
      .filter(([key, value]) => value === undefined)
      .map(([key]) => key);
    if (missingArgs.length > 0) {
      throw new Error(`Missing arguments: ${missingArgs.join(", ")}`);
    }
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
    this.ensureMandatoryContext({
      project: this.projectName,
    });

    const args = [
      "qovery",
      "environment",
      "list",
      `--project=${this.projectName}`,
    ];

    const argsToAdd = [
      this.organizationName && `--organization=${this.organizationName}`,
    ].filter(Boolean);

    args.push(...argsToAdd);
    return this.container.withExec(args).stdout();
  }

  /**
   * Todo: test & debug in a pipeline
   */
  @func()
  cancel(force: boolean = false, watch: boolean = false): Promise<string> {
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
    });

    const args = [
      "qovery",
      "environment",
      "cancel",
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    const argsToAdd = [
      this.organizationName && `--organization=${this.organizationName}`,
      force && "--force",
      watch && "--watch",
    ].filter(Boolean);

    args.push(...argsToAdd);
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
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
      cluster: this.clusterName,
    });

    const args = [
      "qovery",
      "environment",
      "clone",
      `--environment=${this.environmentName}`,
      `--new-environment-name=${newEnvironmentName}`,
      `--environment-type=${environmentType}`,
      `--cluster=${this.clusterName}`,
      `--project=${this.projectName}`,
    ];
    const argsToAdd = [
      this.organizationName && `--organization=${this.organizationName}`,
      applyDeploymentRule && "--apply-deployment-rule=true",
    ].filter(Boolean);

    args.push(...argsToAdd);

    return this.container.withExec(args).stdout();
  }

  /**
   * delete the current context environment.
   * note: dagger reserved delete methods in module
   */
  @func()
  deleteEnvironment(watch: boolean = false): Promise<string> {
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
    });

    const args = [
      "qovery",
      "environment",
      "delete",
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    const argsToAdd = [
      this.organizationName && `--organization=${this.organizationName}`,
      watch && "--watch=true",
    ].filter(Boolean);

    args.push(...argsToAdd);
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
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
    });

    const args = [
      "qovery",
      "environment",
      "deploy",
      `--organization=${this.organizationName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];

    const argsToAdd = [
      applications && `--applications=${applications}`,
      containers && `--containers=${containers}`,
      cronjobs && `--cronjobs=${cronjobs}`,
      helms && `--helms=${helms}`,
      lifecycles && `--lifecycles=${lifecycles}`,
      services && `--services=${services}`,
      skipPausedServices && "--skip-paused-services",
      watch && "--watch",
      this.clusterName && `--cluster=${this.clusterName}`,
    ].filter(Boolean);

    args.push(...argsToAdd);
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
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
    });

    const args = [
      "qovery",
      "environment",
      "statuses",
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    const argsToAdd = [
      this.organizationName && `--organization=${this.organizationName}`,
      this.clusterName && `--cluster=${this.clusterName}`,
      json && "--json",
    ].filter(Boolean);

    args.push(...argsToAdd);
    return this.container.withExec(args).stdout();
  }

  /**
   * Todo: test & debug in a pipeline
   */
  @func()
  stop(watch: boolean = false): Promise<string> {
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
    });

    const args = [
      "qovery",
      "environment",
      "stop",
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    const argsToAdd = [
      this.organizationName && `--organization=${this.organizationName}`,
      this.clusterName && `--cluster=${this.clusterName}`,
      watch && "--watch",
    ].filter(Boolean);

    args.push(...argsToAdd);
    return this.container.withExec(args).stdout();
  }

  /**
   * Todo: test & debug in a pipeline
   */
  @func()
  update(newName?: string, environmentType?: string): Promise<string> {
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
    });

    const args = [
      "qovery",
      "environment",
      "update",
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    const argsToAdd = [ 
      newName && `--name=${newName}`,
      environmentType && `--type=${environmentType}`,
      this.organizationName && `--organization=${this.organizationName}`,
    ].filter(Boolean);

    args.push(...argsToAdd);
    return this.container.withExec(args).stdout();
  }
}
