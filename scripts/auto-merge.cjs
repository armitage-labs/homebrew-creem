const requiredJobs = [
  "Automation tests",
  "Homebrew (macos-15)",
  "Homebrew (ubuntu-24.04)",
];
const versionPattern = "(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)";
const branchPattern = new RegExp(`^automation/creem-(${versionPattern})$`);
const urlPattern = new RegExp(
  `^  url "https://registry\\.npmjs\\.org/@creem_io/cli/-/cli-(${versionPattern})\\.tgz"$`,
  "m",
);

function newer(left, right) {
  const a = left.split(".").map(BigInt);
  const b = right.split(".").map(BigInt);
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return false;
}

function isReleaseOnlyUpdate(before, after, version) {
  const current = before.match(urlPattern)?.[1];
  const next = after.match(urlPattern)?.[1];
  const sha = after.match(/^  sha256 "([a-f0-9]{64})"$/m)?.[1];
  if (!current || next !== version || !sha || !newer(next, current))
    return false;
  // The first migration from the old GitHub tarball requires human review.
  // Future automation can change exactly the existing URL and checksum lines.
  return (
    before
      .replace(
        urlPattern,
        `  url "https://registry.npmjs.org/@creem_io/cli/-/cli-${version}.tgz"`,
      )
      .replace(/^  sha256 "[a-f0-9]{64}"$/m, `  sha256 "${sha}"`) === after
  );
}

module.exports = async function autoMerge({ github, context, core, bot }) {
  const run = context.payload.workflow_run;
  const repo = context.repo;
  const fullName = `${repo.owner}/${repo.repo}`;
  if (!bot?.endsWith("[bot]")) {
    core.notice(
      "Configure HOMEBREW_RELEASE_BOT_LOGIN to enable merging CLI release PRs.",
    );
    return;
  }
  if (
    !["pull_request", "workflow_dispatch"].includes(run.event) ||
    run.conclusion !== "success" ||
    run.head_repository?.full_name !== fullName
  )
    return;
  const version = run.head_branch?.match(branchPattern)?.[1];
  if (!version) return;
  const { data: workflow } = await github.rest.actions.getWorkflow({
    ...repo,
    workflow_id: run.workflow_id,
  });
  if (workflow.path !== ".github/workflows/ci.yml") return;
  const jobs = await github.paginate(
    github.rest.actions.listJobsForWorkflowRun,
    { ...repo, run_id: run.id, filter: "latest", per_page: 100 },
  );
  if (
    !requiredJobs.every((name) =>
      jobs.some((job) => job.name === name && job.conclusion === "success"),
    )
  ) {
    core.setFailed("Required Homebrew CI jobs did not all succeed.");
    return;
  }
  const { data: pulls } = await github.rest.pulls.list({
    ...repo,
    state: "open",
    base: "main",
    head: `${repo.owner}:${run.head_branch}`,
  });
  for (const pr of pulls) {
    if (
      pr.draft ||
      pr.user.login !== bot ||
      pr.user.type !== "Bot" ||
      pr.head.repo?.full_name !== fullName ||
      pr.head.sha !== run.head_sha
    )
      continue;
    const files = await github.paginate(github.rest.pulls.listFiles, {
      ...repo,
      pull_number: pr.number,
      per_page: 100,
    });
    if (
      files.length !== 1 ||
      files[0].filename !== "Formula/creem.rb" ||
      files[0].status !== "modified"
    )
      continue;
    const readFormula = async (ref) => {
      const { data } = await github.rest.repos.getContent({
        ...repo,
        path: "Formula/creem.rb",
        ref,
      });
      if (data.encoding !== "base64" || typeof data.content !== "string")
        throw new Error("Expected formula file content.");
      return Buffer.from(data.content, "base64").toString("utf8");
    };
    // Read current main, not the PR's old base: stale release PRs must not downgrade the tap.
    const { data: main } = await github.rest.repos.getBranch({
      ...repo,
      branch: "main",
    });
    const before = await readFormula(main.commit.sha);
    const after = await readFormula(pr.head.sha);
    if (!isReleaseOnlyUpdate(before, after, version)) {
      core.notice(
        `PR #${pr.number} is stale or changes more than release metadata; leaving it for review.`,
      );
      continue;
    }
    const { data: comparison } = await github.rest.repos.compareCommits({
      ...repo,
      base: main.commit.sha,
      head: pr.head.sha,
    });
    if (comparison.behind_by > 0) {
      // Both releases edit the same URL/checksum lines, so GitHub's ordinary
      // update-branch merge can conflict. Build a merge commit from current main
      // plus the already-validated formula-only update, retaining both parents.
      const { data: tree } = await github.rest.git.createTree({
        ...repo,
        base_tree: main.commit.commit.tree.sha,
        tree: [
          {
            path: "Formula/creem.rb",
            mode: "100644",
            type: "blob",
            content: after,
          },
        ],
      });
      const { data: commit } = await github.rest.git.createCommit({
        ...repo,
        message: `chore: refresh CLI ${version} release against main`,
        tree: tree.sha,
        parents: [pr.head.sha, main.commit.sha],
      });
      await github.rest.git.updateRef({
        ...repo,
        ref: `heads/${run.head_branch}`,
        sha: commit.sha,
        force: false,
      });
      // GITHUB_TOKEN pushes do not start unattended PR CI. workflow_dispatch
      // explicitly starts a fresh run, whose completion re-enters this gate.
      await github.rest.actions.createWorkflowDispatch({
        ...repo,
        workflow_id: "ci.yml",
        ref: run.head_branch,
      });
      core.info(`Refreshed PR #${pr.number}; waiting for CI on ${commit.sha}.`);
      continue;
    }
    const { data: result } = await github.rest.pulls.merge({
      ...repo,
      pull_number: pr.number,
      sha: run.head_sha,
      merge_method: "squash",
    });
    if (!result.merged)
      throw new Error(`PR #${pr.number} was not merged: ${result.message}`);
    core.info(`Merged validated CLI ${version} update: ${pr.html_url}`);
  }
};
module.exports.isReleaseOnlyUpdate = isReleaseOnlyUpdate;
