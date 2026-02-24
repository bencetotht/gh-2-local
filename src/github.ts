import { Octokit } from "@octokit/rest";
import { splitRepo } from "./config";
import type { RemoteRepo } from "./types";

function toRemoteRepo(repo: {
  name: string;
  full_name: string;
  clone_url: string;
  owner: { login: string } | null;
}): RemoteRepo {
  if (!repo.owner?.login) {
    throw new Error(`Repository ${repo.full_name} is missing owner metadata.`);
  }

  return {
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    cloneUrl: repo.clone_url,
  };
}

export async function fetchAllAccessibleRepos(token: string): Promise<RemoteRepo[]> {
  const octokit = new Octokit({ auth: token });

  const repos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
    per_page: 100,
    visibility: "all",
    affiliation: "owner,collaborator,organization_member",
    sort: "full_name",
    direction: "asc",
  });

  return repos.map(toRemoteRepo);
}

export async function fetchSingleRepo(
  token: string,
  fullName: string,
): Promise<RemoteRepo> {
  const octokit = new Octokit({ auth: token });
  const { owner, repo } = splitRepo(fullName);

  try {
    const response = await octokit.repos.get({ owner, repo });
    return toRemoteRepo(response.data);
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 404) {
      throw new Error(
        `Repository ${fullName} was not found or is not accessible with this token.`,
      );
    }

    if (status === 401 || status === 403) {
      throw new Error(
        "GitHub API authentication failed. Verify the token and required scopes.",
      );
    }

    throw error;
  }
}
