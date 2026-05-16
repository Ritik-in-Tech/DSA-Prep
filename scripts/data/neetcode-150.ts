// NeetCode 150 — sections + LeetCode slugs.
// Source: neetcode.io/practice (curated list)

export interface NeetEntry {
  title: string;
  lcSlug: string;
}

export interface NeetSection {
  name: string;
  problems: NeetEntry[];
}

export const NEETCODE_150: NeetSection[] = [
  {
    name: "Arrays & Hashing",
    problems: [
      { title: "Contains Duplicate", lcSlug: "contains-duplicate" },
      { title: "Valid Anagram", lcSlug: "valid-anagram" },
      { title: "Two Sum", lcSlug: "two-sum" },
      { title: "Group Anagrams", lcSlug: "group-anagrams" },
      { title: "Top K Frequent Elements", lcSlug: "top-k-frequent-elements" },
      { title: "Product of Array Except Self", lcSlug: "product-of-array-except-self" },
      { title: "Valid Sudoku", lcSlug: "valid-sudoku" },
      { title: "Encode and Decode Strings", lcSlug: "encode-and-decode-strings" },
      { title: "Longest Consecutive Sequence", lcSlug: "longest-consecutive-sequence" },
    ],
  },
  {
    name: "Two Pointers",
    problems: [
      { title: "Valid Palindrome", lcSlug: "valid-palindrome" },
      { title: "Two Sum II", lcSlug: "two-sum-ii-input-array-is-sorted" },
      { title: "3Sum", lcSlug: "3sum" },
      { title: "Container With Most Water", lcSlug: "container-with-most-water" },
      { title: "Trapping Rain Water", lcSlug: "trapping-rain-water" },
    ],
  },
  {
    name: "Sliding Window",
    problems: [
      { title: "Best Time to Buy and Sell Stock", lcSlug: "best-time-to-buy-and-sell-stock" },
      {
        title: "Longest Substring Without Repeating Characters",
        lcSlug: "longest-substring-without-repeating-characters",
      },
      {
        title: "Longest Repeating Character Replacement",
        lcSlug: "longest-repeating-character-replacement",
      },
      { title: "Permutation in String", lcSlug: "permutation-in-string" },
      { title: "Minimum Window Substring", lcSlug: "minimum-window-substring" },
      { title: "Sliding Window Maximum", lcSlug: "sliding-window-maximum" },
    ],
  },
  {
    name: "Stack",
    problems: [
      { title: "Valid Parentheses", lcSlug: "valid-parentheses" },
      { title: "Min Stack", lcSlug: "min-stack" },
      { title: "Evaluate Reverse Polish Notation", lcSlug: "evaluate-reverse-polish-notation" },
      { title: "Generate Parentheses", lcSlug: "generate-parentheses" },
      { title: "Daily Temperatures", lcSlug: "daily-temperatures" },
      { title: "Car Fleet", lcSlug: "car-fleet" },
      { title: "Largest Rectangle In Histogram", lcSlug: "largest-rectangle-in-histogram" },
    ],
  },
  {
    name: "Binary Search",
    problems: [
      { title: "Binary Search", lcSlug: "binary-search" },
      { title: "Search a 2D Matrix", lcSlug: "search-a-2d-matrix" },
      { title: "Koko Eating Bananas", lcSlug: "koko-eating-bananas" },
      {
        title: "Find Minimum in Rotated Sorted Array",
        lcSlug: "find-minimum-in-rotated-sorted-array",
      },
      { title: "Search in Rotated Sorted Array", lcSlug: "search-in-rotated-sorted-array" },
      { title: "Time Based Key-Value Store", lcSlug: "time-based-key-value-store" },
      { title: "Median of Two Sorted Arrays", lcSlug: "median-of-two-sorted-arrays" },
    ],
  },
  {
    name: "Linked List",
    problems: [
      { title: "Reverse Linked List", lcSlug: "reverse-linked-list" },
      { title: "Merge Two Sorted Lists", lcSlug: "merge-two-sorted-lists" },
      { title: "Reorder List", lcSlug: "reorder-list" },
      { title: "Remove Nth Node From End of List", lcSlug: "remove-nth-node-from-end-of-list" },
      { title: "Copy List With Random Pointer", lcSlug: "copy-list-with-random-pointer" },
      { title: "Add Two Numbers", lcSlug: "add-two-numbers" },
      { title: "Linked List Cycle", lcSlug: "linked-list-cycle" },
      { title: "Find The Duplicate Number", lcSlug: "find-the-duplicate-number" },
      { title: "LRU Cache", lcSlug: "lru-cache" },
      { title: "Merge K Sorted Lists", lcSlug: "merge-k-sorted-lists" },
      { title: "Reverse Nodes In K Group", lcSlug: "reverse-nodes-in-k-group" },
    ],
  },
  {
    name: "Trees",
    problems: [
      { title: "Invert Binary Tree", lcSlug: "invert-binary-tree" },
      { title: "Maximum Depth of Binary Tree", lcSlug: "maximum-depth-of-binary-tree" },
      { title: "Diameter of Binary Tree", lcSlug: "diameter-of-binary-tree" },
      { title: "Balanced Binary Tree", lcSlug: "balanced-binary-tree" },
      { title: "Same Tree", lcSlug: "same-tree" },
      { title: "Subtree of Another Tree", lcSlug: "subtree-of-another-tree" },
      {
        title: "Lowest Common Ancestor of a BST",
        lcSlug: "lowest-common-ancestor-of-a-binary-search-tree",
      },
      { title: "Binary Tree Level Order Traversal", lcSlug: "binary-tree-level-order-traversal" },
      { title: "Binary Tree Right Side View", lcSlug: "binary-tree-right-side-view" },
      { title: "Count Good Nodes In Binary Tree", lcSlug: "count-good-nodes-in-binary-tree" },
      { title: "Validate Binary Search Tree", lcSlug: "validate-binary-search-tree" },
      { title: "Kth Smallest Element in a BST", lcSlug: "kth-smallest-element-in-a-bst" },
      {
        title: "Construct Binary Tree From Preorder And Inorder Traversal",
        lcSlug: "construct-binary-tree-from-preorder-and-inorder-traversal",
      },
      { title: "Binary Tree Maximum Path Sum", lcSlug: "binary-tree-maximum-path-sum" },
      {
        title: "Serialize And Deserialize Binary Tree",
        lcSlug: "serialize-and-deserialize-binary-tree",
      },
    ],
  },
  {
    name: "Tries",
    problems: [
      { title: "Implement Trie Prefix Tree", lcSlug: "implement-trie-prefix-tree" },
      {
        title: "Design Add and Search Words Data Structure",
        lcSlug: "design-add-and-search-words-data-structure",
      },
      { title: "Word Search II", lcSlug: "word-search-ii" },
    ],
  },
  {
    name: "Heap / Priority Queue",
    problems: [
      { title: "Kth Largest Element In a Stream", lcSlug: "kth-largest-element-in-a-stream" },
      { title: "Last Stone Weight", lcSlug: "last-stone-weight" },
      { title: "K Closest Points to Origin", lcSlug: "k-closest-points-to-origin" },
      { title: "Kth Largest Element in an Array", lcSlug: "kth-largest-element-in-an-array" },
      { title: "Task Scheduler", lcSlug: "task-scheduler" },
      { title: "Design Twitter", lcSlug: "design-twitter" },
      { title: "Find Median From Data Stream", lcSlug: "find-median-from-data-stream" },
    ],
  },
  {
    name: "Backtracking",
    problems: [
      { title: "Subsets", lcSlug: "subsets" },
      { title: "Combination Sum", lcSlug: "combination-sum" },
      { title: "Permutations", lcSlug: "permutations" },
      { title: "Subsets II", lcSlug: "subsets-ii" },
      { title: "Combination Sum II", lcSlug: "combination-sum-ii" },
      { title: "Word Search", lcSlug: "word-search" },
      { title: "Palindrome Partitioning", lcSlug: "palindrome-partitioning" },
      {
        title: "Letter Combinations of a Phone Number",
        lcSlug: "letter-combinations-of-a-phone-number",
      },
      { title: "N-Queens", lcSlug: "n-queens" },
    ],
  },
  {
    name: "Graphs",
    problems: [
      { title: "Number of Islands", lcSlug: "number-of-islands" },
      { title: "Clone Graph", lcSlug: "clone-graph" },
      { title: "Max Area of Island", lcSlug: "max-area-of-island" },
      { title: "Pacific Atlantic Water Flow", lcSlug: "pacific-atlantic-water-flow" },
      { title: "Surrounded Regions", lcSlug: "surrounded-regions" },
      { title: "Rotting Oranges", lcSlug: "rotting-oranges" },
      { title: "Walls and Gates", lcSlug: "walls-and-gates" },
      { title: "Course Schedule", lcSlug: "course-schedule" },
      { title: "Course Schedule II", lcSlug: "course-schedule-ii" },
      { title: "Redundant Connection", lcSlug: "redundant-connection" },
      {
        title: "Number of Connected Components In An Undirected Graph",
        lcSlug: "number-of-connected-components-in-an-undirected-graph",
      },
      { title: "Graph Valid Tree", lcSlug: "graph-valid-tree" },
      { title: "Word Ladder", lcSlug: "word-ladder" },
    ],
  },
  {
    name: "Advanced Graphs",
    problems: [
      { title: "Reconstruct Itinerary", lcSlug: "reconstruct-itinerary" },
      { title: "Min Cost to Connect All Points", lcSlug: "min-cost-to-connect-all-points" },
      { title: "Network Delay Time", lcSlug: "network-delay-time" },
      { title: "Swim In Rising Water", lcSlug: "swim-in-rising-water" },
      { title: "Alien Dictionary", lcSlug: "alien-dictionary" },
      { title: "Cheapest Flights Within K Stops", lcSlug: "cheapest-flights-within-k-stops" },
    ],
  },
  {
    name: "1-D Dynamic Programming",
    problems: [
      { title: "Climbing Stairs", lcSlug: "climbing-stairs" },
      { title: "Min Cost Climbing Stairs", lcSlug: "min-cost-climbing-stairs" },
      { title: "House Robber", lcSlug: "house-robber" },
      { title: "House Robber II", lcSlug: "house-robber-ii" },
      { title: "Longest Palindromic Substring", lcSlug: "longest-palindromic-substring" },
      { title: "Palindromic Substrings", lcSlug: "palindromic-substrings" },
      { title: "Decode Ways", lcSlug: "decode-ways" },
      { title: "Coin Change", lcSlug: "coin-change" },
      { title: "Maximum Product Subarray", lcSlug: "maximum-product-subarray" },
      { title: "Word Break", lcSlug: "word-break" },
      { title: "Longest Increasing Subsequence", lcSlug: "longest-increasing-subsequence" },
      { title: "Partition Equal Subset Sum", lcSlug: "partition-equal-subset-sum" },
    ],
  },
  {
    name: "2-D Dynamic Programming",
    problems: [
      { title: "Unique Paths", lcSlug: "unique-paths" },
      { title: "Longest Common Subsequence", lcSlug: "longest-common-subsequence" },
      {
        title: "Best Time to Buy And Sell Stock With Cooldown",
        lcSlug: "best-time-to-buy-and-sell-stock-with-cooldown",
      },
      { title: "Coin Change II", lcSlug: "coin-change-ii" },
      { title: "Target Sum", lcSlug: "target-sum" },
      { title: "Interleaving String", lcSlug: "interleaving-string" },
      {
        title: "Longest Increasing Path In a Matrix",
        lcSlug: "longest-increasing-path-in-a-matrix",
      },
      { title: "Distinct Subsequences", lcSlug: "distinct-subsequences" },
      { title: "Edit Distance", lcSlug: "edit-distance" },
      { title: "Burst Balloons", lcSlug: "burst-balloons" },
      { title: "Regular Expression Matching", lcSlug: "regular-expression-matching" },
    ],
  },
  {
    name: "Greedy",
    problems: [
      { title: "Maximum Subarray", lcSlug: "maximum-subarray" },
      { title: "Jump Game", lcSlug: "jump-game" },
      { title: "Jump Game II", lcSlug: "jump-game-ii" },
      { title: "Gas Station", lcSlug: "gas-station" },
      { title: "Hand of Straights", lcSlug: "hand-of-straights" },
      {
        title: "Merge Triplets to Form Target Triplet",
        lcSlug: "merge-triplets-to-form-target-triplet",
      },
      { title: "Partition Labels", lcSlug: "partition-labels" },
      { title: "Valid Parenthesis String", lcSlug: "valid-parenthesis-string" },
    ],
  },
  {
    name: "Intervals",
    problems: [
      { title: "Insert Interval", lcSlug: "insert-interval" },
      { title: "Merge Intervals", lcSlug: "merge-intervals" },
      { title: "Non Overlapping Intervals", lcSlug: "non-overlapping-intervals" },
      { title: "Meeting Rooms", lcSlug: "meeting-rooms" },
      { title: "Meeting Rooms II", lcSlug: "meeting-rooms-ii" },
      {
        title: "Minimum Interval to Include Each Query",
        lcSlug: "minimum-interval-to-include-each-query",
      },
    ],
  },
  {
    name: "Math & Geometry",
    problems: [
      { title: "Rotate Image", lcSlug: "rotate-image" },
      { title: "Spiral Matrix", lcSlug: "spiral-matrix" },
      { title: "Set Matrix Zeroes", lcSlug: "set-matrix-zeroes" },
      { title: "Happy Number", lcSlug: "happy-number" },
      { title: "Plus One", lcSlug: "plus-one" },
      { title: "Pow(x, n)", lcSlug: "powx-n" },
      { title: "Multiply Strings", lcSlug: "multiply-strings" },
      { title: "Detect Squares", lcSlug: "detect-squares" },
    ],
  },
  {
    name: "Bit Manipulation",
    problems: [
      { title: "Single Number", lcSlug: "single-number" },
      { title: "Number of 1 Bits", lcSlug: "number-of-1-bits" },
      { title: "Counting Bits", lcSlug: "counting-bits" },
      { title: "Reverse Bits", lcSlug: "reverse-bits" },
      { title: "Missing Number", lcSlug: "missing-number" },
      { title: "Sum of Two Integers", lcSlug: "sum-of-two-integers" },
      { title: "Reverse Integer", lcSlug: "reverse-integer" },
    ],
  },
];
