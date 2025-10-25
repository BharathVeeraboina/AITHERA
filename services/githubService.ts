import type { GitHubRepo } from '../types';

const GITHUB_API_URL = 'https://api.github.com';

/**
 * Fetches public repositories for a given GitHub username.
 * @param username The GitHub username.
 * @returns A promise that resolves to an array of GitHubRepo objects.
 */
export const fetchGitHubRepos = async (username: string): Promise<GitHubRepo[]> => {
  if (!username) {
    throw new Error("GitHub username is required.");
  }

  try {
    const response = await fetch(`${GITHUB_API_URL}/users/${username}/repos?sort=updated&direction=desc`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`User "${username}" not found on GitHub.`);
      }
      throw new Error(`Failed to fetch repositories. GitHub API responded with status ${response.status}.`);
    }

    const data = await response.json();

    // Map the response to our GitHubRepo type to keep our app's data structure consistent
    return data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      html_url: repo.html_url,
      description: repo.description || 'No description provided.',
      language: repo.language || 'N/A',
      stargazers_count: repo.stargazers_count,
    }));
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    // Re-throw the error to be handled by the calling component
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("An unknown error occurred while fetching from GitHub.");
  }
};