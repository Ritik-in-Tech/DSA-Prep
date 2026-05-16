// Unofficial LeetCode GraphQL client.
// Endpoint: https://leetcode.com/graphql/
// LeetCode has no official public API. These queries are best-effort and
// can break if the upstream schema changes.

import { env } from "@/lib/env";
import { sleep } from "@/lib/utils";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

const LC_HEADERS: HeadersInit = {
  "content-type": "application/json",
  accept: "application/json",
  origin: "https://leetcode.com",
  referer: "https://leetcode.com/",
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 dsa-prep/1.0",
};

async function lcQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const MAX_RETRIES = 4;
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(env.LEETCODE_GRAPHQL_URL, {
        method: "POST",
        headers: LC_HEADERS,
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 0 },
      });
      if (res.status === 429 || res.status >= 500) {
        const wait = 800 * 2 ** attempt + Math.random() * 500;
        await sleep(wait);
        continue;
      }
      if (!res.ok) {
        throw new Error(`LeetCode HTTP ${res.status}`);
      }
      const json = (await res.json()) as GraphQLResponse<T>;
      if (json.errors?.length) {
        const msg = json.errors.map((e) => e.message).join("; ");
        throw new Error(`LeetCode GraphQL: ${msg}`);
      }
      if (!json.data) throw new Error("LeetCode GraphQL returned no data");
      return json.data;
    } catch (err) {
      lastError = err;
      const wait = 600 * 2 ** attempt + Math.random() * 400;
      await sleep(wait);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("LeetCode GraphQL: unknown error");
}

// ---------- Problemset catalog ----------

export interface LcQuestion {
  acRate?: number;
  difficulty: "Easy" | "Medium" | "Hard";
  freqBar?: number;
  questionFrontendId: string;
  isFavor?: boolean;
  isPaidOnly: boolean;
  status?: string | null;
  title: string;
  titleSlug: string;
  topicTags: { name: string; slug: string }[];
  hasSolution?: boolean;
  hasVideoSolution?: boolean;
}

interface ProblemsetQuestionListResponse {
  problemsetQuestionList: {
    total: number;
    questions: LcQuestion[];
  };
}

const QUESTION_LIST_QUERY = /* GraphQL */ `
  query problemsetQuestionList(
    $categorySlug: String
    $limit: Int
    $skip: Int
    $filters: QuestionListFilterInput
  ) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        acRate
        difficulty
        freqBar
        questionFrontendId
        isFavor
        isPaidOnly
        status
        title
        titleSlug
        topicTags {
          name
          slug
        }
        hasSolution
        hasVideoSolution
      }
    }
  }
`;

export async function getProblemList(options: {
  skip?: number;
  limit?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  tags?: string[];
  search?: string;
}): Promise<{ total: number; questions: LcQuestion[] }> {
  const { skip = 0, limit = 100, difficulty, tags, search } = options;
  const filters: Record<string, unknown> = {};
  if (difficulty) filters.difficulty = difficulty;
  if (tags && tags.length > 0) filters.tags = tags;
  if (search) filters.searchKeywords = search;

  const data = await lcQuery<ProblemsetQuestionListResponse>(QUESTION_LIST_QUERY, {
    categorySlug: "",
    skip,
    limit,
    filters,
  });
  return data.problemsetQuestionList;
}

// ---------- Per-user data ----------

export interface LcSubmission {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
}

const RECENT_AC_QUERY = /* GraphQL */ `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
`;

export async function getRecentAcSubmissions(
  username: string,
  limit = 20,
): Promise<LcSubmission[]> {
  const data = await lcQuery<{ recentAcSubmissionList: LcSubmission[] }>(RECENT_AC_QUERY, {
    username,
    limit,
  });
  return data.recentAcSubmissionList ?? [];
}

export interface LcUserStats {
  username: string;
  realName?: string | null;
  aboutMe?: string | null;
  userAvatar?: string | null;
  ranking?: number | null;
  submitStats: {
    acSubmissionNum: { difficulty: string; count: number; submissions: number }[];
    totalSubmissionNum: { difficulty: string; count: number; submissions: number }[];
  };
}

const MATCHED_USER_QUERY = /* GraphQL */ `
  query matchedUser($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        realName
        userAvatar
        aboutMe
        ranking
      }
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
  }
`;

export async function getUserStats(username: string): Promise<LcUserStats | null> {
  type ApiUser = {
    matchedUser:
      | (Omit<LcUserStats, "realName" | "aboutMe" | "userAvatar" | "ranking"> & {
          profile: {
            realName?: string | null;
            userAvatar?: string | null;
            aboutMe?: string | null;
            ranking?: number | null;
          };
        })
      | null;
  };
  const data = await lcQuery<ApiUser>(MATCHED_USER_QUERY, { username });
  const u = data.matchedUser;
  if (!u) return null;
  return {
    username: u.username,
    realName: u.profile?.realName ?? null,
    userAvatar: u.profile?.userAvatar ?? null,
    aboutMe: u.profile?.aboutMe ?? null,
    ranking: u.profile?.ranking ?? null,
    submitStats: u.submitStats,
  };
}

export function lcProblemUrl(slug: string): string {
  return `https://leetcode.com/problems/${slug}/`;
}

export function mapLcDifficulty(d: LcQuestion["difficulty"]) {
  switch (d) {
    case "Easy":
      return "EASY" as const;
    case "Medium":
      return "MEDIUM" as const;
    case "Hard":
      return "HARD" as const;
  }
}

// ---------- Contests ----------

export interface LcContest {
  title: string;
  titleSlug: string;
  startTime: number;
  duration: number;
}

const UPCOMING_CONTESTS_QUERY = /* GraphQL */ `
  query upcomingContests {
    upcomingContests {
      title
      titleSlug
      startTime
      duration
    }
  }
`;

export async function getUpcomingLeetCodeContests(): Promise<LcContest[]> {
  const data = await lcQuery<{ upcomingContests: LcContest[] | null }>(UPCOMING_CONTESTS_QUERY);
  return data.upcomingContests ?? [];
}

export function lcContestUrl(slug: string): string {
  return `https://leetcode.com/contest/${slug}/`;
}
