import { dag, Container, object, func } from "@dagger.io/dagger";

import { QoveryCli } from "./cli/qovery-cli";
import { QoveryApi } from "./api/qovery-api";

@object()
class Qovery {
  private ctr: Container | null = null;
  private cli: QoveryCli | null = null;
  private api: QoveryApi | null = null;

  /**
   * Overriding the container of this module
   * be sure to install qovery cli dependencies on it (bash, curl, tar, sudo)
   */
  @func()
  withContainer(ctr: Container): Qovery {
    this.ctr = ctr;
    return this;
  }

  /**
   * Returns the container of this module
   */
  @func()
  container(): Container {
    if (!this.ctr) {
      this.ctr = dag
        .container()
        .from("alpine:latest")
        .withExec(["apk", "add", "--no-cache", "bash", "curl", "tar", "sudo"]);
    }

    return this.ctr;
  }

  /**
   * Returns this module with the qovery cli installed
   */
  @func()
  withCli(qoveryToken: string): QoveryCli {
    this.cli = new QoveryCli();
    this.ctr = this.cli.install(this.container(), qoveryToken).container();

    return this.cli;
  }

  /**
   * Returns this module with the sub modules beeing auth to the qovery api
   */
  @func()
  withApi(qoveryToken: string): QoveryApi {
    if (!this.api) {
      this.api = new QoveryApi();
      this.api.setContainer(this.container());
    }
    this.api.setAuthToken(qoveryToken);

    return this.api;
  }
}
