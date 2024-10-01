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
}
