import { dag, Container, object, func, enumType } from "@dagger.io/dagger";

@object()
export class QoveryCliContainer {
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
   * CLI help: 
      Update a container
      Usage:
        qovery container update [flags]

      Flags:
        -n, --container string      Container Name
            --environment string    Environment Name
        -h, --help                  help for update
            --image-name string     Container Image Name
            --organization string   Organization Name
            --project string        Project Name
            --tag string            Container Tag

      Global Flags:
            --verbose   Verbose output
   */
  @func()
  async update(
    containerName: string,
    imageName?: string,
    tag?: string
  ): Promise<string> {
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
    });

    const args = [
      "qovery",
      "container",
      "update",
      `--container=${containerName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    const argsToAdd = [
      imageName && `--image-name=${imageName}`,
      tag && `--tag=${tag}`,
      this.organizationName && `--organization=${this.organizationName}`,
    ].filter(Boolean);

    args.push(...argsToAdd);
    return await this.container.withExec(args).stdout();
  }

  /**
   * CLI help: 
      Cancel a container
      Usage:
        qovery container cancel [flags]

      Flags:
        -n, --container string      Container Name
            --environment string    Environment Name
        -h, --help                  help for cancel
            --organization string   Organization Name
            --project string        Project Name
        -w, --watch                 Watch cancel until it's done or an error occurs

      Global Flags:
            --verbose   Verbose output
   */
  @func()
  async cancel(containerName: string, watch: boolean = false): Promise<string> {
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
    });

    const args = [
      "qovery",
      "container",
      "cancel",
      `--container=${containerName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    const argsToAdd = [
      this.organizationName && `--organization=${this.organizationName}`,
      watch && "--watch",
    ].filter(Boolean);

    args.push(...argsToAdd);
    return await this.container.withExec(args).stdout();
  }

  /**
   * CLI help: 
      Clone a container
      Usage:
        qovery container clone [flags]

      Flags:
        -n, --container string               Container Name
            --environment string             Environment Name
        -h, --help                           help for clone
            --organization string            Organization Name
            --project string                 Project Name
            --target-container-name string   Target Container Name
            --target-environment string      Target Environment Name
            --target-project string          Target Project Name

      Global Flags:
            --verbose   Verbose output
   */
  @func()
  async clone(
    containerName: string,
    targetContainerName: string,
    targetEnvironmentName?: string,
    targetProjectName?: string
  ): Promise<string> {
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
    });

    const args = [
      "qovery",
      "container",
      "clone",
      `--container=${containerName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
      `--target-container-name=${targetContainerName}`,
    ];
    const argsToAdd = [
      targetEnvironmentName && `--target-environment=${targetEnvironmentName}`,
      targetProjectName && `--target-project=${targetProjectName}`,
      this.organizationName && `--organization=${this.organizationName}`,
    ].filter(Boolean);

    args.push(...argsToAdd);
    return await this.container.withExec(args).stdout();
  }

  /**
   * CLI help: 
      Delete a container
      Usage:
        qovery container delete [flags]

      Flags:
        -n, --container string      Container Name
            --containers string     Container Names (comma separated) (ex: --containers "container1,container2")
            --environment string    Environment Name
        -h, --help                  help for delete
            --organization string   Organization Name
            --project string        Project Name
        -w, --watch                 Watch container status until it's ready or an error occurs

      Global Flags:
            --verbose   Verbose output
   */
  @func()
  async delete(containerName: string, watch: boolean = false): Promise<string> {
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
    });

    const args = [
      "qovery",
      "container",
      "delete",
      `--container=${containerName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    const argsToAdd = [
      this.organizationName && `--organization=${this.organizationName}`,
      watch && "--watch",
    ].filter(Boolean);

    args.push(...argsToAdd);
    return await this.container.withExec(args).stdout();
  }

  /**
   * CLI help: 
      Deploy a container
      Usage:
        qovery container deploy [flags]

      Flags:
        -n, --container string      Container Name
            --containers string     Container Names (comma separated) (ex: --containers "container1,container2")
            --environment string    Environment Name
        -h, --help                  help for deploy
            --organization string   Organization Name
            --project string        Project Name
        -t, --tag string            Container Tag
        -w, --watch                 Watch container status until it's ready or an error occurs

      Global Flags:
            --verbose   Verbose output
   */
  @func()
  async deploy(
    containerName: string,
    tag?: string,
    watch: boolean = false
  ): Promise<string> {
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
    });

    const args = [
      "qovery",
      "container",
      "deploy",
      `--container=${containerName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    const argsToAdd = [
      tag && `--tag=${tag}`,
      this.organizationName && `--organization=${this.organizationName}`,
      watch && "--watch",
    ].filter(Boolean);

    args.push(...argsToAdd);
    return await this.container.withExec(args).stdout();
  }

  /**
   * CLI help: 
      List containers
      Usage:
        qovery container list [flags] 

      Flags:
            --environment string    Environment Name
        -h, --help                  help for list
            --json                  JSON output
            --organization string   Organization Name
            --project string        Project Name

      Global Flags:
            --verbose   Verbose output
   */
  @func()
  async list(json: boolean = false): Promise<string> {
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
    });

    const args = [
      "qovery",
      "container",
      "list",
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    const argsToAdd = [
      this.organizationName && `--organization=${this.organizationName}`,
      json && "--json",
    ].filter(Boolean);

    args.push(...argsToAdd);
    return await this.container.withExec(args).stdout();
  }

  /**
   * CLI help: 
      Redeploy a container
      Usage:
        qovery container redeploy [flags]

      Flags:
        -n, --container string      Container Name
            --environment string    Environment Name
        -h, --help                  help for redeploy
            --organization string   Organization Name
            --project string        Project Name
        -w, --watch                 Watch container status until it's ready or an error occurs

      Global Flags:
            --verbose   Verbose output
   */
  @func()
  async redeploy(
    containerName: string,
    watch: boolean = false
  ): Promise<string> {
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
    });

    const args = [
      "qovery",
      "container",
      "redeploy",
      `--container=${containerName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    const argsToAdd = [
      this.organizationName && `--organization=${this.organizationName}`,
      watch && "--watch",
    ].filter(Boolean);

    args.push(...argsToAdd);
    return await this.container.withExec(args).stdout();
  }

  /**
   * CLI help: 
      Stop a container
      Usage:
        qovery container stop [flags]

      Flags:
        -n, --container string      Container Name
            --containers string     Container Names (comma separated) (ex: --containers "container1,container2")
            --environment string    Environment Name
        -h, --help                  help for stop
            --organization string   Organization Name
            --project string        Project Name
        -w, --watch                 Watch container status until it's ready or an error occurs

      Global Flags:
            --verbose   Verbose output
   */
  @func()
  async stop(containerName: string, watch: boolean = false): Promise<string> {
    this.ensureMandatoryContext({
      project: this.projectName,
      environment: this.environmentName,
    });

    const args = [
      "qovery",
      "container",
      "stop",
      `--container=${containerName}`,
      `--project=${this.projectName}`,
      `--environment=${this.environmentName}`,
    ];
    const argsToAdd = [
      this.organizationName && `--organization=${this.organizationName}`,
      watch && "--watch",
    ].filter(Boolean);

    args.push(...argsToAdd);
    return await this.container.withExec(args).stdout();
  }
}
