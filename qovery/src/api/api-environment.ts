import { dag, Container, object, func } from "@dagger.io/dagger";

@object()
export class QoveryApiEnvironment {
  private container: Container;
  private authToken: string;
  private projectId: string;

  setAuthToken(authToken: string): void {
    this.authToken = authToken;
  }

  setContainer(container: Container): void {
    this.container = container;
  }

  setProject(project: string): QoveryApiEnvironment {
    this.projectId = project;
    return this;
  }

  @func()
  list(): Promise<string> {
    return this.container
      .withExec([
        "curl",
        "-s",
        "-H",
        `Authorization: Token ${this.authToken}`,
        `https://api.qovery.com/project/${this.projectId}/environment`,
      ])
      .stdout()
      .then((output) => JSON.parse(output));
  }
}
