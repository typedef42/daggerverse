import { dag, Container, object, func } from "@dagger.io/dagger";
import { QoveryApiEnvironment } from "./api-environment";

/**
 * /!\ Disclaimer:
 * This is a work in progress, do not use.
 * Proof of concept to play with the Qovery API is not working yet, and will require heavy breaking changes and rework.
 */
@object()
export class QoveryApi {
  private container: Container;
  private authToken: string;
  private organizationId: string;
  private projectId: string;
  private environmentId: string;
  private clusterId: string;
  private environmentModule: QoveryApiEnvironment;

  setAuthToken(authToken: string): void {
    this.authToken = authToken;
  }

  setContainer(container: Container): void {
    this.container = container;
  }

  @func()
  withProject(projectId: string): QoveryApi {
    this.projectId = projectId;
    return this;
  }

  @func()
  withEnvironment(environmentId: string): QoveryApi {
    this.environmentId = environmentId;
    return this;
  }

  @func()
  withCluster(clusterId: string): QoveryApi {
    this.clusterId = clusterId;
    return this;
  }

  @func()
  withOrganization(organizationId: string): QoveryApi {
    this.organizationId = organizationId;
    return this;
  }

  @func()
  environment(): QoveryApiEnvironment {
    if (!this.environmentModule) {
      this.environmentModule = new QoveryApiEnvironment();
      this.environmentModule.setContainer(this.container);
    }

    this.environmentModule.setProject(this.projectId);
    return this.environmentModule;
  }
}
