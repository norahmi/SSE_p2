# Sandbox Provisioning Script
This script allows for the provisioning of a Sandbox in the Vercel project. Additionally, it uploads all the required runner files, installs the necessary dependencies, and creates a snapshot of the provisioned environment. Finally, it returns the snapshot ID for future reference and use in the main Leafcode environment.

## Running
To run the provisioning script, first authenticate to Vercel. This can be done either by using the Vercel CLI, and running `vercel login`, `vercel link`, and `vercel env pull` (do NOT commit the pulled .env.local file or the .vercel directory to version control), or by setting the `VERCEL_OIDC_TOKEN` environment variable with a valid OIDC token.

Once authenticated, you can run the provisioning script using the following command:

```bash
./src/index.ts provision ../runner
```

The above command assumes your current working directory is the `sandbox` directory, and that the `runner` directory is located at the same level as `sandbox`. Adjust the path to the runner directory as necessary based on your project structure. Make sure the `runner` directory is as clean as possible of runtime artifacts. The provisioning script will ignore `.venv` and `__pycache__` directories by default.