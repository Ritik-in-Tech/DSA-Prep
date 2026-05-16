// Codeforces public API client.
// Docs: https://codeforces.com/apiHelp

import { sleep } from "@/lib/utils";

const BASE = "https://codeforces.com/api";

export interface CfProblem {
  contestId?: number;
  problemsetName?: string;
  index: string;
  name: string;
  type: "PROGRAMMING" | "QUESTION";
  points?: number;
  rating?: number;
  tags: string[];
}

export interface CfProblemStatistics {
  contestId?: number;
  index: string;
  solvedCount: number;
}

export interface CfSubmission {
  id: number;
  contestId?: number;
  creationTimeSeconds: number;
  problem: CfProblem;
  programmingLanguage: string;
  verdict?:
    | "OK"
    | "WRONG_ANSWER"
    | "TIME_LIMIT_EXCEEDED"
    | "MEMORY_LIMIT_EXCEEDED"
    | "RUNTIME_ERROR"
    | "COMPILATION_ERROR"
    | "TESTING"
    | "FAILED"
    | "PARTIAL"
    | "PRESENTATION_ERROR"
    | "IDLENESS_LIMIT_EXCEEDED"
    | "SECURITY_VIOLATED"
    | "CRASHED"
    | "INPUT_PREPARATION_CRASHED"
    | "CHALLENGED"
    | "SKIPPED"
    | "REJECTED";
}

export interface CfUserInfo {
  handle: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  contribution: number;
  rank?: string;
  rating?: number;
  maxRank?: string;
  maxRating?: number;
  registrationTimeSeconds: number;
  titlePhoto?: string;
}

export interface CfContest {
  id: number;
  name: string;
  type: "CF" | "IOI" | "ICPC";
  phase: "BEFORE" | "CODING" | "PENDING_SYSTEM_TEST" | "SYSTEM_TEST" | "FINISHED";
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds?: number;
  relativeTimeSeconds?: number;
  websiteUrl?: string;
}

interface CfResponse<T> {
  status: "OK" | "FAILED";
  result?: T;
  comment?: string;
}

async function cfFetch<T>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {},
  init: RequestInit = {},
): Promise<T> {
  const url = new URL(`${BASE}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }

  const MAX_RETRIES = 4;
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        ...init,
        headers: {
          "user-agent": "dsa-prep/1.0 (+https://example.com)",
          ...(init.headers || {}),
        },
        next: { revalidate: 0 },
      });
      if (res.status === 429 || res.status >= 500) {
        const wait = 500 * 2 ** attempt + Math.random() * 250;
        await sleep(wait);
        continue;
      }
      if (!res.ok) {
        throw new Error(`Codeforces ${endpoint} HTTP ${res.status}`);
      }
      const json = (await res.json()) as CfResponse<T>;
      if (json.status !== "OK" || !json.result) {
        throw new Error(`Codeforces ${endpoint}: ${json.comment ?? "FAILED"}`);
      }
      return json.result;
    } catch (err) {
      lastError = err;
      const wait = 400 * 2 ** attempt + Math.random() * 250;
      await sleep(wait);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`Codeforces ${endpoint}: unknown error`);
}

export async function getProblemset(): Promise<{
  problems: CfProblem[];
  problemStatistics: CfProblemStatistics[];
}> {
  return cfFetch<{
    problems: CfProblem[];
    problemStatistics: CfProblemStatistics[];
  }>("problemset.problems");
}

export async function getUserInfo(handles: string[]): Promise<CfUserInfo[]> {
  if (handles.length === 0) return [];
  return cfFetch<CfUserInfo[]>("user.info", {
    handles: handles.join(";"),
    checkHistoricHandles: false,
  });
}

export async function getUserStatus(
  handle: string,
  options: { from?: number; count?: number } = {},
): Promise<CfSubmission[]> {
  const { from = 1, count = 1000 } = options;
  return cfFetch<CfSubmission[]>("user.status", { handle, from, count });
}

export async function getContestList(gym = false): Promise<CfContest[]> {
  return cfFetch<CfContest[]>("contest.list", { gym });
}

export function cfProblemUrl(problem: { contestId?: number | null; index: string }): string {
  if (problem.contestId == null) {
    return `https://codeforces.com/problemset/problem/${problem.index}`;
  }
  return `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`;
}

export function cfExternalId(problem: { contestId?: number | null; index: string }): string {
  return `${problem.contestId ?? "PS"}-${problem.index}`;
}
