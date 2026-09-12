const assert = require("node:assert/strict");
const test = require("node:test");
const autoMerge = require("./auto-merge.cjs");
const { isReleaseOnlyUpdate } = autoMerge;

function formula(version, sha = "a".repeat(64)) {
  return `class Creem < Formula
  url "https://registry.npmjs.org/@creem_io/cli/-/cli-${version}.tgz"
  sha256 "${sha}"
  license "MIT"
end
`;
}

function fixture() {
  const fullName = "armitage-labs/homebrew-creem";
  const run = {
    event: "pull_request",
    conclusion: "success",
    id: 10,
    workflow_id: 20,
    head_repository: { full_name: fullName },
    head_branch: "automation/creem-0.3.1",
    head_sha: "tested-sha",
  };
  const pr = {
    number: 3,
    draft: false,
    user: { login: "creem-release[bot]", type: "Bot" },
    head: { sha: run.head_sha, repo: { full_name: fullName } },
    html_url: "https://example.com/pr/3",
  };
  const state = {
    run,
    pr,
    jobs: [
      "Automation tests",
      "Homebrew (macos-14)",
      "Homebrew (ubuntu-24.04)",
    ].map((name) => ({ name, conclusion: "success" })),
    files: [{ filename: "Formula/creem.rb", status: "modified" }],
    workflow: { path: ".github/workflows/ci.yml" },
    before: formula("0.3.0"),
    after: formula("0.3.1", "b".repeat(64)),
    merges: [],
    failures: [],
    behind: 0,
    refreshes: [],
    dispatches: [],
  };
  const listJobs = () => state.jobs;
  const listFiles = () => state.files;
  const github = {
    paginate: async (fn) => fn(),
    rest: {
      actions: {
        getWorkflow: async () => ({ data: state.workflow }),
        listJobsForWorkflowRun: listJobs,
        createWorkflowDispatch: async (args) => {
          state.dispatches.push(args);
        },
      },
      pulls: {
        list: async () => ({ data: [pr] }),
        listFiles,
        merge: async (args) => {
          state.merges.push(args);
          return { data: { merged: true } };
        },
      },
      repos: {
        getBranch: async () => ({
          data: {
            commit: { sha: "main-sha", commit: { tree: { sha: "main-tree" } } },
          },
        }),
        compareCommits: async () => ({ data: { behind_by: state.behind } }),
        getContent: async ({ ref }) => ({
          data: {
            encoding: "base64",
            content: Buffer.from(
              ref === "main-sha" ? state.before : state.after,
            ).toString("base64"),
          },
        }),
      },
      git: {
        createTree: async (args) => {
          assert.equal(args.base_tree, "main-tree");
          assert.equal(args.tree[0].content, state.after);
          return { data: { sha: "merged-tree" } };
        },
        createCommit: async (args) => {
          assert.deepEqual(args.parents, [state.pr.head.sha, "main-sha"]);
          assert.equal(args.tree, "merged-tree");
          return { data: { sha: "refreshed-sha" } };
        },
        updateRef: async (args) => {
          state.refreshes.push(args);
        },
      },
    },
  };
  return {
    state,
    options: {
      github,
      context: {
        repo: { owner: "armitage-labs", repo: "homebrew-creem" },
        payload: { workflow_run: run },
      },
      core: {
        notice() {},
        info() {},
        setFailed(message) {
          state.failures.push(message);
        },
      },
      bot: "creem-release[bot]",
    },
  };
}

test("merges only the tested SHA after all release checks", async () => {
  const { state, options } = fixture();
  await autoMerge(options);
  assert.deepEqual(state.merges, [
    {
      owner: "armitage-labs",
      repo: "homebrew-creem",
      pull_number: 3,
      sha: "tested-sha",
      merge_method: "squash",
    },
  ]);
  assert.deepEqual(state.failures, []);
});

test("leaves untrusted, draft, failed and stale PRs unmerged", async (t) => {
  const cases = {
    "unset bot": (s, o) => {
      o.bot = "";
    },
    "non-bot config": (s, o) => {
      o.bot = "human";
    },
    "push run": (s) => {
      s.run.event = "push";
    },
    "failed workflow": (s) => {
      s.run.conclusion = "failure";
    },
    "fork run": (s) => {
      s.run.head_repository.full_name = "someone/fork";
    },
    "manual branch": (s) => {
      s.run.head_branch = "fix/automation";
    },
    "wrong workflow": (s) => {
      s.workflow.path = ".github/workflows/fake.yml";
    },
    "missing job": (s) => {
      s.jobs.pop();
    },
    "skipped job": (s) => {
      s.jobs[1].conclusion = "skipped";
    },
    "failed job": (s) => {
      s.jobs[2].conclusion = "failure";
    },
    "draft PR": (s) => {
      s.pr.draft = true;
    },
    "wrong author": (s) => {
      s.pr.user.login = "someone[bot]";
    },
    "non-bot author": (s) => {
      s.pr.user.type = "User";
    },
    "fork PR": (s) => {
      s.pr.head.repo.full_name = "someone/fork";
    },
    "head changed after tests": (s) => {
      s.pr.head.sha = "untested-sha";
    },
    "additional file": (s) => {
      s.files.push({ filename: "README.md", status: "modified" });
    },
    "renamed formula": (s) => {
      s.files[0].status = "renamed";
    },
    "wrong file": (s) => {
      s.files[0].filename = ".github/workflows/ci.yml";
    },
    "newer release already merged": (s) => {
      s.before = formula("0.3.2");
    },
    "same release already merged": (s) => {
      s.before = formula("0.3.1");
    },
    "formula code changes": (s) => {
      s.after = s.after.replace('license "MIT"', 'system "malicious"');
    },
    "version does not match branch": (s) => {
      s.after = formula("0.3.2");
    },
    "changed checksum only": (s) => {
      s.after = formula("0.3.0", "b".repeat(64));
    },
  };
  for (const [name, mutate] of Object.entries(cases)) {
    await t.test(name, async () => {
      const { state, options } = fixture();
      mutate(state, options);
      await autoMerge(options);
      assert.deepEqual(state.merges, []);
    });
  }
});

test("checks numerical version ordering and exact allowed formula changes", () => {
  assert.equal(
    isReleaseOnlyUpdate(formula("0.9.9"), formula("0.10.0"), "0.10.0"),
    true,
  );
  assert.equal(
    isReleaseOnlyUpdate(formula("0.10.0"), formula("0.9.9"), "0.9.9"),
    false,
  );
  assert.equal(
    isReleaseOnlyUpdate(
      formula("0.3.0"),
      formula("0.3.1").replace("registry.npmjs.org", "example.com"),
      "0.3.1",
    ),
    false,
  );
  assert.equal(
    isReleaseOnlyUpdate(formula("0.3.0"), formula("0.3.1", "bad"), "0.3.1"),
    false,
  );
  const legacy = formula("0.2.0").replace(
    /https:[^"]+/,
    "https://github.com/armitage-labs/creem-cli/releases/download/v0.2.0/creem-cli-0.2.0.tgz",
  );
  assert.equal(isReleaseOnlyUpdate(legacy, formula("0.3.0"), "0.3.0"), false);
});

test("surfaces merge refusal or head-race conflict", async () => {
  for (const mode of ["refused", "conflict"]) {
    const { options } = fixture();
    options.github.rest.pulls.merge = async () => {
      if (mode === "conflict") throw new Error("Head SHA changed");
      return { data: { merged: false, message: "Branch protection" } };
    };
    await assert.rejects(
      autoMerge(options),
      /Branch protection|Head SHA changed/,
    );
  }
});

test("refreshes a second release after main advances, then requires new CI", async () => {
  const { state, options } = fixture();
  state.run.head_branch = "automation/creem-0.3.2";
  state.before = formula("0.3.1"); // The preceding release merged while this CI ran.
  state.after = formula("0.3.2", "b".repeat(64));
  state.behind = 1;
  await autoMerge(options);
  assert.deepEqual(state.merges, []);
  assert.deepEqual(state.refreshes, [
    {
      owner: "armitage-labs",
      repo: "homebrew-creem",
      ref: "heads/automation/creem-0.3.2",
      sha: "refreshed-sha",
      force: false,
    },
  ]);
  assert.deepEqual(state.dispatches, [
    {
      owner: "armitage-labs",
      repo: "homebrew-creem",
      workflow_id: "ci.yml",
      ref: "automation/creem-0.3.2",
    },
  ]);
  // Completion of the dispatched run is the only point that may merge the refreshed head.
  state.behind = 0;
  state.pr.head.sha = "refreshed-sha";
  await autoMerge(options);
  assert.deepEqual(state.merges, []); // Old successful run is stale.
  state.run.event = "workflow_dispatch";
  state.run.head_sha = "refreshed-sha";
  await autoMerge(options);
  assert.equal(state.merges.length, 1);
  assert.equal(state.merges[0].sha, "refreshed-sha");
});

test("refreshes after an unrelated base change and never force-updates a changed head", async () => {
  const { state, options } = fixture();
  state.behind = 1;
  options.github.rest.git.updateRef = async (args) => {
    assert.equal(args.force, false);
    throw new Error("Reference update is not a fast forward");
  };
  await assert.rejects(autoMerge(options), /fast forward/);
  assert.deepEqual(state.dispatches, []);
  assert.deepEqual(state.merges, []);
});
