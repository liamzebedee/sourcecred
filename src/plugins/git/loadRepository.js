/*
 * Load a git repository into memory. This dumps the commit and tree
 * data into a structured form. Contents of blobs are not loaded.
 *
 * If the repository contains file names that are not valid UTF-8
 * strings, the result is undefined.
 *
 * Note: git(1) is a runtime dependency of this module.
 */
// @flow

import * as MapUtil from "../../util/map";
import type {GitDriver} from "./gitUtils";
import type {Repository, Commit} from "./types";
import {localGit} from "./gitUtils";
import {
  repoIdToString,
  type RepoId,
  type RepoIdString,
} from "../../core/repoId";

/**
 * Load a Git repository from disk into memory. The `rootRef` should be
 * a revision reference as accepted by `git rev-parse`: "HEAD" and
 * "origin/master" will be common, while a specific SHA or tag might be
 * used to fix a particular state of a repository.
 */
export function loadRepository(
  repositoryPath: string,
  rootRef: string,
  repoId: RepoId
): Repository {
  const git = localGit(repositoryPath);
  try {
    // If the repository is empty, HEAD will not exist. We check HEAD
    // rather than the provided `rootRef` because, in the case where the
    // repository is non-empty but the provided `rootRef` does not
    // exist, we still want to fail.
    git(["rev-parse", "--verify", "HEAD"]);
  } catch (e) {
    // No data in the repository.
    return {commits: {}, commitToRepoId: {}};
  }
  const rawCommits = findCommits(git, rootRef);
  const commits = MapUtil.toObject(new Map(rawCommits.map((x) => [x.hash, x])));
  const repoIdString = repoIdToString(repoId);
  const repoIdStringSet: () => {[RepoIdString]: true} = () => ({
    [((repoIdString: RepoIdString): any)]: true,
  });
  const commitToRepoId = MapUtil.toObject(
    new Map(rawCommits.map(({hash}) => [hash, repoIdStringSet()]))
  );
  return {commits, commitToRepoId};
}

function findCommits(git: GitDriver, rootRef: string): Commit[] {
  return git(["log", "--format=%H %h %P|%s", rootRef])
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => {
      const pipeLocation = line.indexOf("|");
      const first = line.slice(0, pipeLocation).trim();
      const summary = line.slice(pipeLocation + 1);
      const [hash, shortHash, ...parentHashes] = first.split(" ");
      return {hash, shortHash, summary, parentHashes};
    });
}

function findTreeHash(commit: Commit): string {
  let els = git(["cat-file", "-p", commit.hash])
    .split("\n")
    .filter((line) => line.length > 0)
    .filter((line) => line.startsWith('tree'));
  
  if(els.length == 0) {
    throw new Error('tree not found')
  }

  let hash = tree[0].split(' ')[1]
  
  return {hash,}
  // let els = git(["cat-file", "-p", rootRef])
  //   .split("\n")
  //   .filter((line) => line.length > 0)
  //   .map()
}


function findCommitDiff(commit: string, prevCommit: string): CommitDiff {
  let changedFiles: ChangedFile[] = git(["diff", "--name-status", commit, prevCommit])
    .split("\n")
    .filter((line) => line.length > 0)
    .map(line => {
      let typ = line[0];
      let path = '';
      let changeType = 

      switch(typ) {
        case 'A':
            changeType = FileChange.ADDED;
            path = line.slice(1).trim();
        case 'M':
            changeType = FileChange.MODIFIED;
            path = line.slice(1).trim();
        case 'D':
            changeType = FileChange.DELETED;
            path = line.slice(1).trim();
        case 'R':
            changeType = FileChange.RENAMED;
            // let similarity = line.slice(1, 4);
            path = line.slice(4);
        default:
          throw new Error(`diff type not recognised: ${typ}`)
      }

      return {path,changeType}
    });
  
  let commitDiff: CommitDiff = {
    commit,
    prevCommit,
    changedFiles: {
      ...changedFiles.map(({ path }) => {
        return { [path]: this }
      })
    }
  }

  return commitDiff;
}


// 2a52ff8
// 880b0099e960fb01f5dea199eeb87877d2ec1a97
// git cat-file -p 3136762fd84e9e9167a9b1e4d29e447a8065d1fd
/*
100644 blob 62866582c590cdb31e7434601c7470804db08064    .eslintrc.js
100644 blob 0d26140284e21a18bcb2dad1d66a9a01b18e5572    .flowconfig
100644 blob a73d507abae5ac1b2e23bcbbc34c3bd7e597f4f5    .gitignore
100644 blob 5d74a6a1b8c1f7a2987e0bfd4eadc54f8aa201a4    .prettierignore
100644 blob 67d60505bf6d693573b149ba89d8e9a7cae4c3e0    .prettierrc.json
100644 blob 40cfa9197d728bc18544e92516e7d695aaf8e3cf    .travis.yml
100644 blob 07eb17affb1044497ddedfbd89bbd4db4c5ae214    LICENSE
100644 blob df5bd622d8671411dfea87c8669d128638ac81c4    README.md
040000 tree 80f09ce4e50c7706f759e1fb13e29841c51d5369    config
040000 tree 2cfa4cc3590a79c5905d776403c369fcb264b84a    flow-typed
100644 blob 13c68fd52a37eb9083d90e8ea90fe90e5f6078ed    package.json
040000 tree f505a60f54eac29a8cecf72fd00315480a476acd    scripts
040000 tree a615579ee0252f97a8a73eca49b8063806ddac4d    src
100644 blob 239a4f73e2abfeca68a9bfeae84f0ea3391d619b    yarn.lock
*/

/*
tree 3136762fd84e9e9167a9b1e4d29e447a8065d1fd
parent 880b0099e960fb01f5dea199eeb87877d2ec1a97
author Dandelion Mané <dl@dandelion.io> 1525995023 -0700
committer Dandelion Mané <dl@dandelion.io> 1525997101 -0700

Cred Explorer: Modify color based on table depth

Test plan: Open the cred explorer, and expand some nodes.

Paired with @wchargin

*/