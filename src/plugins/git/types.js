// @flow

import type {RepoIdString} from "../../core/repoId";

export type Repository = {|
  +commits: {[Hash]: Commit},
  // For every commit, track all the RepoIds of repos
  // containing this commit.
  +commitToRepoId: {[Hash]: {+[RepoIdString]: true}},
|};
export type Hash = string;
export type Commit = {|
  +hash: Hash,
  +parentHashes: $ReadOnlyArray<Hash>,
  // a shorter version of the hash;
  // shortHash is not guaranteed unique.
  +shortHash: string,
  +summary: string, // Oneline commit summary
|};

export type Path = string;
export type CommitDiff = {|
  +commit: Hash,
  +prevCommit: Hash,
  +changedFiles: {[Path]: ChangedFile},
|};

export opaque type FileChangeT = Symbol;
export const FileChange: {|
  +ADDED: FileChangeT,
  +MODIFIED: FileChangeT,
  +DELETED: FileChangeT,
  +RENAMED: FileChangeT,
|} = Object.freeze({
  +ADDED: Symbol("ADDED"),
  +MODIFIED: Symbol("MODIFIED"),
  +DELETED: Symbol("DELETED"),
  +RENAMED: Symbol("RENAMED"),
});

export type ChangedFile = {|
  +path: Path,
  +changeType: FileChangeT,
|};


