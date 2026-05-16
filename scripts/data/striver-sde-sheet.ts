// Striver's SDE Sheet (~190 problems). Source: takeuforward.org.
// Each entry maps to a LeetCode problem by its slug (titleSlug).
// Slugs that aren't on LeetCode are commented; you can extend later.

export interface StriverEntry {
  title: string;
  lcSlug: string;
}

export interface StriverSection {
  name: string;
  problems: StriverEntry[];
}

export const STRIVER_SDE_SHEET: StriverSection[] = [
  {
    name: "Arrays - Part I",
    problems: [
      { title: "Set Matrix Zeroes", lcSlug: "set-matrix-zeroes" },
      { title: "Pascal's Triangle", lcSlug: "pascals-triangle" },
      { title: "Next Permutation", lcSlug: "next-permutation" },
      { title: "Maximum Subarray (Kadane's)", lcSlug: "maximum-subarray" },
      { title: "Sort Colors", lcSlug: "sort-colors" },
      { title: "Best Time to Buy and Sell Stock", lcSlug: "best-time-to-buy-and-sell-stock" },
    ],
  },
  {
    name: "Arrays - Part II",
    problems: [
      { title: "Rotate Image", lcSlug: "rotate-image" },
      { title: "Merge Intervals", lcSlug: "merge-intervals" },
      { title: "Merge Sorted Array", lcSlug: "merge-sorted-array" },
      { title: "Find the Duplicate Number", lcSlug: "find-the-duplicate-number" },
      { title: "Missing and Repeating", lcSlug: "set-mismatch" },
      { title: "Count Inversions", lcSlug: "reverse-pairs" },
    ],
  },
  {
    name: "Arrays - Part III",
    problems: [
      { title: "Search in 2D Matrix", lcSlug: "search-a-2d-matrix" },
      { title: "Pow(x, n)", lcSlug: "powx-n" },
      { title: "Majority Element (n/2)", lcSlug: "majority-element" },
      { title: "Majority Element (n/3)", lcSlug: "majority-element-ii" },
      { title: "Unique Paths", lcSlug: "unique-paths" },
    ],
  },
  {
    name: "Arrays - Part IV",
    problems: [
      { title: "Two Sum", lcSlug: "two-sum" },
      { title: "4Sum", lcSlug: "4sum" },
      { title: "Longest Consecutive Sequence", lcSlug: "longest-consecutive-sequence" },
      { title: "Largest Subarray with 0 Sum", lcSlug: "contiguous-array" },
      { title: "Subarray Sum Equals K", lcSlug: "subarray-sum-equals-k" },
    ],
  },
  {
    name: "Linked List - Part I",
    problems: [
      { title: "Reverse Linked List", lcSlug: "reverse-linked-list" },
      { title: "Middle of the Linked List", lcSlug: "middle-of-the-linked-list" },
      { title: "Merge Two Sorted Lists", lcSlug: "merge-two-sorted-lists" },
      { title: "Remove Nth Node from End", lcSlug: "remove-nth-node-from-end-of-list" },
      { title: "Add Two Numbers", lcSlug: "add-two-numbers" },
      { title: "Delete Node in a Linked List", lcSlug: "delete-node-in-a-linked-list" },
    ],
  },
  {
    name: "Linked List - Part II",
    problems: [
      { title: "Intersection of Two Linked Lists", lcSlug: "intersection-of-two-linked-lists" },
      { title: "Linked List Cycle", lcSlug: "linked-list-cycle" },
      { title: "Reverse Nodes in k-Group", lcSlug: "reverse-nodes-in-k-group" },
      { title: "Palindrome Linked List", lcSlug: "palindrome-linked-list" },
      { title: "Linked List Cycle II", lcSlug: "linked-list-cycle-ii" },
    ],
  },
  {
    name: "Greedy",
    problems: [
      { title: "Jump Game", lcSlug: "jump-game" },
      { title: "Jump Game II", lcSlug: "jump-game-ii" },
      { title: "Gas Station", lcSlug: "gas-station" },
      { title: "Candy", lcSlug: "candy" },
    ],
  },
  {
    name: "Recursion & Backtracking",
    problems: [
      { title: "Subsets", lcSlug: "subsets" },
      { title: "Subsets II", lcSlug: "subsets-ii" },
      { title: "Combination Sum", lcSlug: "combination-sum" },
      { title: "Combination Sum II", lcSlug: "combination-sum-ii" },
      { title: "Permutations", lcSlug: "permutations" },
      { title: "Permutations II", lcSlug: "permutations-ii" },
      { title: "N-Queens", lcSlug: "n-queens" },
      { title: "Palindrome Partitioning", lcSlug: "palindrome-partitioning" },
      { title: "Word Search", lcSlug: "word-search" },
      { title: "Sudoku Solver", lcSlug: "sudoku-solver" },
    ],
  },
  {
    name: "Binary Search",
    problems: [
      { title: "Search in Rotated Sorted Array", lcSlug: "search-in-rotated-sorted-array" },
      {
        title: "Find Minimum in Rotated Sorted Array",
        lcSlug: "find-minimum-in-rotated-sorted-array",
      },
      { title: "Median of Two Sorted Arrays", lcSlug: "median-of-two-sorted-arrays" },
      {
        title: "Kth Element of Two Sorted Arrays",
        lcSlug: "kth-smallest-element-in-a-sorted-matrix",
      },
      {
        title: "Allocate Books / Capacity to Ship Packages",
        lcSlug: "capacity-to-ship-packages-within-d-days",
      },
    ],
  },
  {
    name: "Stacks & Queues",
    problems: [
      { title: "Valid Parentheses", lcSlug: "valid-parentheses" },
      { title: "Min Stack", lcSlug: "min-stack" },
      { title: "Next Greater Element I", lcSlug: "next-greater-element-i" },
      { title: "Largest Rectangle in Histogram", lcSlug: "largest-rectangle-in-histogram" },
      { title: "Sliding Window Maximum", lcSlug: "sliding-window-maximum" },
      { title: "LRU Cache", lcSlug: "lru-cache" },
      { title: "LFU Cache", lcSlug: "lfu-cache" },
    ],
  },
  {
    name: "Strings",
    problems: [
      { title: "Reverse Words in a String", lcSlug: "reverse-words-in-a-string" },
      { title: "Longest Palindromic Substring", lcSlug: "longest-palindromic-substring" },
      { title: "Group Anagrams", lcSlug: "group-anagrams" },
      { title: "String to Integer (atoi)", lcSlug: "string-to-integer-atoi" },
      { title: "Longest Common Prefix", lcSlug: "longest-common-prefix" },
      { title: "Implement strStr()", lcSlug: "find-the-index-of-the-first-occurrence-in-a-string" },
    ],
  },
  {
    name: "Binary Trees",
    problems: [
      { title: "Binary Tree Inorder Traversal", lcSlug: "binary-tree-inorder-traversal" },
      { title: "Binary Tree Preorder Traversal", lcSlug: "binary-tree-preorder-traversal" },
      { title: "Binary Tree Postorder Traversal", lcSlug: "binary-tree-postorder-traversal" },
      { title: "Binary Tree Level Order Traversal", lcSlug: "binary-tree-level-order-traversal" },
      { title: "Maximum Depth of Binary Tree", lcSlug: "maximum-depth-of-binary-tree" },
      { title: "Diameter of Binary Tree", lcSlug: "diameter-of-binary-tree" },
      { title: "Balanced Binary Tree", lcSlug: "balanced-binary-tree" },
      { title: "Same Tree", lcSlug: "same-tree" },
      {
        title: "Binary Tree Zigzag Level Order",
        lcSlug: "binary-tree-zigzag-level-order-traversal",
      },
      { title: "Lowest Common Ancestor of BT", lcSlug: "lowest-common-ancestor-of-a-binary-tree" },
      {
        title: "Construct BT from Preorder and Inorder",
        lcSlug: "construct-binary-tree-from-preorder-and-inorder-traversal",
      },
      {
        title: "Serialize and Deserialize Binary Tree",
        lcSlug: "serialize-and-deserialize-binary-tree",
      },
    ],
  },
  {
    name: "Binary Search Trees",
    problems: [
      { title: "Validate BST", lcSlug: "validate-binary-search-tree" },
      { title: "LCA of BST", lcSlug: "lowest-common-ancestor-of-a-binary-search-tree" },
      { title: "Kth Smallest in BST", lcSlug: "kth-smallest-element-in-a-bst" },
      { title: "Inorder Successor in BST", lcSlug: "inorder-successor-in-bst" },
    ],
  },
  {
    name: "Graphs",
    problems: [
      { title: "Number of Islands (BFS/DFS)", lcSlug: "number-of-islands" },
      { title: "Clone Graph", lcSlug: "clone-graph" },
      { title: "Course Schedule (Topo Sort)", lcSlug: "course-schedule" },
      { title: "Course Schedule II", lcSlug: "course-schedule-ii" },
      { title: "Word Ladder", lcSlug: "word-ladder" },
      { title: "Network Delay Time (Dijkstra)", lcSlug: "network-delay-time" },
      {
        title: "Cheapest Flights Within K Stops (Bellman-Ford)",
        lcSlug: "cheapest-flights-within-k-stops",
      },
    ],
  },
  {
    name: "Dynamic Programming",
    problems: [
      { title: "Climbing Stairs", lcSlug: "climbing-stairs" },
      { title: "House Robber", lcSlug: "house-robber" },
      { title: "Coin Change", lcSlug: "coin-change" },
      { title: "Longest Increasing Subsequence", lcSlug: "longest-increasing-subsequence" },
      { title: "Edit Distance", lcSlug: "edit-distance" },
      { title: "Longest Common Subsequence", lcSlug: "longest-common-subsequence" },
      { title: "Word Break", lcSlug: "word-break" },
      { title: "Partition Equal Subset Sum", lcSlug: "partition-equal-subset-sum" },
      {
        title: "Best Time to Buy and Sell Stock III",
        lcSlug: "best-time-to-buy-and-sell-stock-iii",
      },
      { title: "Burst Balloons", lcSlug: "burst-balloons" },
      { title: "Maximum Product Subarray", lcSlug: "maximum-product-subarray" },
    ],
  },
  {
    name: "Trie",
    problems: [
      { title: "Implement Trie (Prefix Tree)", lcSlug: "implement-trie-prefix-tree" },
      { title: "Word Search II", lcSlug: "word-search-ii" },
      { title: "Replace Words", lcSlug: "replace-words" },
    ],
  },
];
