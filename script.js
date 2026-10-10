/* =========================================
   POSTLY — POST MANAGEMENT SYSTEM
   Vanilla JavaScript | No Backend Required
========================================= */

"use strict";

/* =========================================
   1. CONFIGURATION
========================================= */

const STORAGE_KEY = "postly_posts_v1";
const PAGE_SIZE = 5;
const MIN_CONTENT_LENGTH = 20;

const app = document.getElementById("app");
const toast = document.getElementById("toast");
const deleteDialog = document.getElementById("deleteDialog");
const cancelDeleteButton = document.getElementById("cancelDelete");
const confirmDeleteButton = document.getElementById("confirmDelete");

let currentPage = 1;
let searchQuery = "";
let selectedAuthor = "";
let sortOrder = "newest";
let pendingDeleteId = null;
let toastTimer = null;

/* =========================================
   2. SAMPLE DATA — 10 INITIAL POSTS
========================================= */

const samplePosts = [
  {
    id: "post-101",
    title: "Getting Started with JavaScript",
    author: "Aman Sharma",
    content:
      "JavaScript is one of the most popular programming languages for web development. It helps developers make websites interactive and dynamic. Start by learning variables, functions, arrays and objects. Practice writing small programs every day to improve your programming skills.",
    tags: ["JavaScript", "Programming", "Beginner"],
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z"
  },
  {
    id: "post-102",
    title: "Why Responsive Web Design Matters",
    author: "Priya Verma",
    content:
      "Responsive web design makes websites look good on mobile phones, tablets and desktop computers. Developers use flexible layouts, CSS Grid, Flexbox and media queries to adapt a website to different screen sizes. A responsive website offers a better experience to every visitor.",
    tags: ["CSS", "Responsive", "Web Design"],
    createdAt: "2026-09-12T09:30:00.000Z",
    updatedAt: "2026-09-12T09:30:00.000Z"
  },
  {
    id: "post-103",
    title: "Understanding HTML Semantic Elements",
    author: "Rahul Mehta",
    content:
      "Semantic HTML elements describe the meaning of the content they contain. Elements such as header, nav, main, article and footer improve document structure. Using semantic HTML can improve accessibility and help browsers and search engines understand a webpage.",
    tags: ["HTML", "Accessibility", "SEO"],
    createdAt: "2026-09-14T11:00:00.000Z",
    updatedAt: "2026-09-14T11:00:00.000Z"
  },
  {
    id: "post-104",
    title: "Introduction to the MERN Stack",
    author: "Aman Sharma",
    content:
      "The MERN stack includes MongoDB, Express.js, React and Node.js. Together, these technologies can be used to create full-stack web applications. React handles the user interface, Express and Node.js handle server-side logic, and MongoDB stores application data.",
    tags: ["MERN", "React", "Node.js"],
    createdAt: "2026-09-16T08:15:00.000Z",
    updatedAt: "2026-09-16T08:15:00.000Z"
  },
  {
    id: "post-105",
    title: "Five Tips for Writing Cleaner Code",
    author: "Neha Gupta",
    content:
      "Clean code is easier to understand, test and maintain. Use meaningful variable names, keep functions focused on one task, avoid unnecessary repetition, format code consistently and add comments where they provide useful context. Small improvements can make collaborative development much easier.",
    tags: ["Clean Code", "Tips", "Development"],
    createdAt: "2026-09-18T14:45:00.000Z",
    updatedAt: "2026-09-18T14:45:00.000Z"
  },
  {
    id: "post-106",
    title: "How CSS Flexbox Simplifies Layouts",
    author: "Priya Verma",
    content:
      "CSS Flexbox is useful for arranging items in a row or column. It provides properties such as justify-content, align-items, flex-wrap and gap. Flexbox is especially helpful for navigation bars, button groups and layouts where items need to align dynamically.",
    tags: ["CSS", "Flexbox", "Frontend"],
    createdAt: "2026-09-20T12:20:00.000Z",
    updatedAt: "2026-09-20T12:20:00.000Z"
  },
  {
    id: "post-107",
    title: "Introduction to REST APIs",
    author: "Vikram Singh",
    content:
      "REST APIs allow applications to communicate through HTTP requests. Common methods include GET for reading data, POST for creating data, PUT or PATCH for updating data, and DELETE for removing data. Clear API design helps frontend and backend systems work together.",
    tags: ["API", "Backend", "HTTP"],
    createdAt: "2026-09-22T16:00:00.000Z",
    updatedAt: "2026-09-22T16:00:00.000Z"
  },
  {
    id: "post-108",
    title: "Making Websites More Accessible",
    author: "Neha Gupta",
    content:
      "Accessible websites can be used by more people, including people who use keyboards or screen readers. Use descriptive labels, meaningful headings, sufficient color contrast, keyboard-friendly controls and alternative text for meaningful images. Accessibility should be considered from the beginning of a project.",
    tags: ["Accessibility", "HTML", "UX"],
    createdAt: "2026-09-24T10:40:00.000Z",
    updatedAt: "2026-09-24T10:40:00.000Z"
  },
  {
    id: "post-109",
    title: "Getting Comfortable with Git",
    author: "Rahul Mehta",
    content:
      "Git tracks changes in source code and helps developers manage project history. Learning commits, branches, merges and conflict resolution provides a strong foundation for collaborative software development. Make small, meaningful commits and write messages that explain what changed.",
    tags: ["Git", "Workflow", "Development"],
    createdAt: "2026-09-26T13:10:00.000Z",
    updatedAt: "2026-09-26T13:10:00.000Z"
  },
  {
    id: "post-110",
    title: "A Beginner's Guide to Web Performance",
    author: "Aman Sharma",
    content:
      "Fast websites improve user experience and can support better engagement. Optimize image sizes, reduce unnecessary JavaScript, avoid excessive network requests and test pages on mobile devices. Measure performance before and after making changes to understand whether an optimization actually helps.",
    tags: ["Performance", "Web Development", "SEO"],
    createdAt: "2026-09-28T07:30:00.000Z",
    updatedAt: "2026-09-28T07:30:00.000Z"
  }
];

/* =========================================
   3. LOCAL STORAGE
========================================= */

function loadPosts() {
  try {
    const savedPosts = localStorage.getItem(STORAGE_KEY);

    // Seed the application only on the first visit.
    if (savedPosts === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(samplePosts));
      return [...samplePosts];
    }

    const parsedPosts = JSON.parse(savedPosts);

    if (!Array.isArray(parsedPosts)) {
      throw new Error("Stored posts data is invalid.");
    }

    return parsedPosts;
  } catch (error) {
    console.error("Unable to load posts:", error);
    showToast(
      "Unable to access saved posts. Check your browser storage.",
      "error"
    );
    return [];
  }
}

let posts = loadPosts();

function savePosts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return true;
  } catch (error) {
    console.error("Unable to save posts:", error);

    showToast(
      "Could not save changes. Check browser storage space or permissions.",
      "error"
    );

    return false;
  }
}

/* =========================================
   4. GENERAL HELPER FUNCTIONS
========================================= */

// Escape user-generated text before inserting it into HTML.
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `post-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getPostById(id) {
  return posts.find((post) => post.id === id);
}

function formatDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

function getExcerpt(content, maxLength = 150) {
  const text = String(content ?? "").trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function renderTags(tags = []) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return "";
  }

  return `
    <div class="tags">
      ${tags
        .map(
          (tag) => `
            <span class="tag">${escapeHTML(tag)}</span>
          `
        )
        .join("")}
    </div>
  `;
}

function showToast(message, type = "success") {
  if (!toast) return;

  clearTimeout(toastTimer);

  toast.textContent = message;
  toast.className = "toast show";

  if (type === "error") {
    toast.classList.add("error");
  }

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* =========================================
   5. HASH ROUTING
========================================= */

function navigate(path) {
  const nextHash = `#${path}`;

  if (window.location.hash === nextHash) {
    renderRoute();
  } else {
    window.location.hash = nextHash;
  }
}

function getCurrentRoute() {
  const hash = window.location.hash || "#/";
  const path = hash.slice(1) || "/";

  if (path === "/") {
    return { page: "list" };
  }

  if (path === "/posts/new") {
    return { page: "create" };
  }

  const editMatch = path.match(/^\/posts\/([^/]+)\/edit$/);

  if (editMatch) {
    return {
      page: "edit",
      id: decodeURIComponent(editMatch[1])
    };
  }

  const detailMatch = path.match(/^\/posts\/([^/]+)$/);

  if (detailMatch) {
    return {
      page: "detail",
      id: decodeURIComponent(detailMatch[1])
    };
  }

  return { page: "notFound" };
}

function renderRoute() {
  const route = getCurrentRoute();

  if (deleteDialog && deleteDialog.open) {
    deleteDialog.close();
  }

  pendingDeleteId = null;

  switch (route.page) {
    case "list":
      renderPostsList();
      break;

    case "create":
      renderPostForm();
      break;

    case "edit":
      renderPostForm(route.id);
      break;

    case "detail":
      renderPostDetails(route.id);
      break;

    default:
      renderNotFound();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.addEventListener("hashchange", renderRoute);

/* =========================================
   6. POSTS LIST PAGE
========================================= */

function getFilteredPosts() {
  const query = searchQuery.trim().toLowerCase();

  let filtered = posts.filter((post) => {
    const title = String(post.title ?? "").toLowerCase();
    const content = String(post.content ?? "").toLowerCase();
    const author = String(post.author ?? "").toLowerCase();

    const matchesSearch =
      !query ||
      title.includes(query) ||
      content.includes(query) ||
      author.includes(query) ||
      (Array.isArray(post.tags) &&
        post.tags.some((tag) => String(tag).toLowerCase().includes(query)));

    const matchesAuthor =
      !selectedAuthor || post.author === selectedAuthor;

    return matchesSearch && matchesAuthor;
  });

  filtered.sort((a, b) => {
    if (sortOrder === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    if (sortOrder === "title") {
      return String(a.title).localeCompare(String(b.title));
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return filtered;
}

function renderPostsList() {
  const filteredPosts = getFilteredPosts();

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));

  // Keep the current page valid when filtering or deleting posts.
  currentPage = Math.min(currentPage, totalPages);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visiblePosts = filteredPosts.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const authors = [...new Set(posts.map((post) => post.author).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  const firstResult = filteredPosts.length === 0 ? 0 : startIndex + 1;
  const lastResult = Math.min(startIndex + PAGE_SIZE, filteredPosts.length);

  app.innerHTML = `
    <section class="page-heading">
      <div>
        <p class="eyebrow">YOUR WORKSPACE</p>
        <h1>Manage your posts<span class="brand-dot">.</span></h1>
        <p class="subtitle">
          Create, organize and manage all your content in one place.
        </p>
      </div>

      <a href="#/posts/new" class="button button-primary">
        <span aria-hidden="true">+</span> Create Post
      </a>
    </section>

    <section class="stats-grid" aria-label="Post statistics">
      <article class="stat-card">
        <span class="stat-label">Total Posts</span>
        <strong class="stat-value">${posts.length}</strong>
      </article>

      <article class="stat-card">
        <span class="stat-label">Authors</span>
        <strong class="stat-value">${authors.length}</strong>
      </article>

      <article class="stat-card">
        <span class="stat-label">Matching Posts</span>
        <strong class="stat-value">${filteredPosts.length}</strong>
      </article>
    </section>

    <section class="toolbar" aria-label="Search and filter posts">
      <div class="field">
        <label for="searchInput">Search posts</label>
        <input
          type="search"
          id="searchInput"
          placeholder="Search title, content, tags..."
          value="${escapeHTML(searchQuery)}"
          autocomplete="off"
        />
      </div>

      <div class="field">
        <label for="authorFilter">Filter by author</label>
        <select id="authorFilter">
          <option value="">All authors</option>
          ${authors
            .map(
              (author) => `
                <option
                  value="${escapeHTML(author)}"
                  ${author === selectedAuthor ? "selected" : ""}
                >
                  ${escapeHTML(author)}
                </option>
              `
            )
            .join("")}
        </select>
      </div>

      <div class="field">
        <label for="sortFilter">Sort posts</label>
        <select id="sortFilter">
          <option value="newest" ${sortOrder === "newest" ? "selected" : ""}>
            Newest first
          </option>
          <option value="oldest" ${sortOrder === "oldest" ? "selected" : ""}>
            Oldest first
          </option>
          <option value="title" ${sortOrder === "title" ? "selected" : ""}>
            Title A–Z
          </option>
        </select>
      </div>
    </section>

    <div class="results-row">
      <span>
        Showing ${firstResult}–${lastResult} of ${filteredPosts.length} posts
      </span>
      <span>5 posts per page</span>
    </div>

    ${
      visiblePosts.length
        ? `
          <section class="post-grid" aria-label="Posts">
            ${visiblePosts.map(renderPostCard).join("")}
          </section>
        `
        : renderEmptyState()
    }

    ${
      filteredPosts.length > PAGE_SIZE
        ? renderPagination(currentPage, totalPages)
        : ""
    }
  `;
}

/* =========================================
   7. INDIVIDUAL POST CARD
========================================= */

function renderPostCard(post) {
  const id = encodeURIComponent(post.id);

  return `
    <article class="post-card">
      <div class="post-meta">
        <span>By ${escapeHTML(post.author)}</span>
        <span aria-hidden="true">•</span>
        <time datetime="${escapeHTML(post.createdAt)}">
          ${formatDate(post.createdAt)}
        </time>
      </div>

      <h2>
        <a href="#/posts/${id}">
          ${escapeHTML(post.title)}
        </a>
      </h2>

      <p class="post-excerpt">
        ${escapeHTML(getExcerpt(post.content))}
      </p>

      ${renderTags(post.tags)}

      <div class="card-actions">
        <a class="text-button" href="#/posts/${id}">View Details</a>
        <a class="text-button" href="#/posts/${id}/edit">Edit</a>

        <button
          type="button"
          class="text-button danger-text"
          data-action="delete"
          data-id="${escapeHTML(post.id)}"
        >
          Delete
        </button>
      </div>
    </article>
  `;
}

/* =========================================
   8. EMPTY STATE
========================================= */

function renderEmptyState() {
  const hasFilters =
    searchQuery.trim() !== "" || selectedAuthor !== "";

  return `
    <section class="empty-state">
      <div class="empty-icon" aria-hidden="true">P</div>

      <h2>
        ${hasFilters ? "No matching posts" : "No posts yet"}
      </h2>

      <p>
        ${
          hasFilters
            ? "Try a different search term or clear your filters."
            : "Create your first post and it will appear here."
        }
      </p>

      ${
        hasFilters
          ? `
            <button
              type="button"
              class="button button-secondary"
              data-action="clear-filters"
            >
              Clear Filters
            </button>
          `
          : `
            <a href="#/posts/new" class="button button-primary">
              Create Your First Post
            </a>
          `
      }
    </section>
  `;
}

/* =========================================
   9. PAGINATION
========================================= */

function renderPagination(page, totalPages) {
  return `
    <nav class="pagination" aria-label="Post pages">
      <button
        type="button"
        class="button button-secondary"
        data-action="previous-page"
        ${page <= 1 ? "disabled" : ""}
      >
        ← Previous
      </button>

      <span class="pagination-info">
        Page ${page} of ${totalPages}
      </span>

      <button
        type="button"
        class="button button-secondary"
        data-action="next-page"
        ${page >= totalPages ? "disabled" : ""}
      >
        Next →
      </button>
    </nav>
  `;
}

/* =========================================
   10. CREATE / EDIT POST FORM
========================================= */

function renderPostForm(id = null) {
  const isEditing = Boolean(id);
  const post = isEditing ? getPostById(id) : null;

  if (isEditing && !post) {
    renderNotFound();
    return;
  }

  app.innerHTML = `
    <section class="form-panel">
      <div class="form-header">
        <p class="eyebrow">
          ${isEditing ? "UPDATE CONTENT" : "NEW CONTENT"}
        </p>

        <h1>
          ${isEditing ? "Edit post" : "Create a post"}
          <span class="brand-dot">.</span>
        </h1>

        <p class="subtitle">
          ${
            isEditing
              ? "Make your changes and save the updated post."
              : "Fill in the details below to publish your post."
          }
        </p>
      </div>

      <form id="postForm" novalidate>
        <input
          type="hidden"
          id="postId"
          value="${post ? escapeHTML(post.id) : ""}"
        />

        <div class="form-grid">
          <div class="field full-width">
            <label for="postTitle">Post Title *</label>
            <input
              type="text"
              id="postTitle"
              name="title"
              placeholder="Enter a clear and descriptive title"
              minlength="3"
              maxlength="120"
              required
              value="${escapeHTML(post?.title ?? "")}"
            />
            <span class="field-error" id="titleError"></span>
          </div>

          <div class="field full-width">
            <label for="postAuthor">Author Name *</label>
            <input
              type="text"
              id="postAuthor"
              name="author"
              placeholder="Enter the author's name"
              maxlength="80"
              required
              value="${escapeHTML(post?.author ?? "")}"
            />
            <span class="field-error" id="authorError"></span>
          </div>

          <div class="field full-width">
            <label for="postContent">Post Content *</label>
            <textarea
              id="postContent"
              name="content"
              placeholder="Write your post here..."
              minlength="${MIN_CONTENT_LENGTH}"
              required
            >${escapeHTML(post?.content ?? "")}</textarea>

            <div class="char-count" id="contentCounter">
              0 characters
            </div>

            <span class="field-error" id="contentError"></span>
          </div>

          <div class="field full-width">
            <label for="postTags">Tags</label>
            <input
              type="text"
              id="postTags"
              name="tags"
              placeholder="JavaScript, Web Development, Tutorial"
              value="${escapeHTML(
                Array.isArray(post?.tags) ? post.tags.join(", ") : ""
              )}"
            />
            <span class="field-hint">
              Separate multiple tags with commas.
            </span>
            <span class="field-error" id="tagsError"></span>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="button button-primary">
            ${isEditing ? "Save Changes" : "Create Post"}
          </button>

          <a
            href="${isEditing ? `#/posts/${encodeURIComponent(id)}` : "#/"}"
            class="button button-secondary"
          >
            Cancel
          </a>
        </div>
      </form>
    </section>
  `;

  updateContentCounter();

  // Focus the first field to make form entry easier.
  const titleInput = document.getElementById("postTitle");

  if (titleInput) {
    titleInput.focus();
  }
}

/* =========================================
   11. FORM VALIDATION
========================================= */

function setFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  if (!input || !error) return;

  error.textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");

  const field = input.closest(".field");

  if (field) {
    field.classList.toggle("has-error", Boolean(message));
  }
}

function clearFormErrors() {
  setFieldError("postTitle", "titleError", "");
  setFieldError("postAuthor", "authorError", "");
  setFieldError("postContent", "contentError", "");
  setFieldError("postTags", "tagsError", "");
}

function validatePostForm() {
  clearFormErrors();

  const title = document.getElementById("postTitle").value.trim();
  const author = document.getElementById("postAuthor").value.trim();
  const content = document.getElementById("postContent").value.trim();
  const tagsValue = document.getElementById("postTags").value;

  let isValid = true;

  if (title.length < 3) {
    setFieldError(
      "postTitle",
      "titleError",
      "Title must contain at least 3 characters."
    );
    isValid = false;
  } else if (title.length > 120) {
    setFieldError(
      "postTitle",
      "titleError",
      "Title cannot exceed 120 characters."
    );
    isValid = false;
  }

  if (!author) {
    setFieldError(
      "postAuthor",
      "authorError",
      "Author name is required."
    );
    isValid = false;
  } else if (author.length > 80) {
    setFieldError(
      "postAuthor",
      "authorError",
      "Author name cannot exceed 80 characters."
    );
    isValid = false;
  }

  if (content.length < MIN_CONTENT_LENGTH) {
    setFieldError(
      "postContent",
      "contentError",
      `Content must contain at least ${MIN_CONTENT_LENGTH} characters.`
    );
    isValid = false;
  }

  const tags = tagsValue
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (tags.some((tag) => tag.length > 30)) {
    setFieldError(
      "postTags",
      "tagsError",
      "Each tag must be 30 characters or fewer."
    );
    isValid = false;
  } else if (tags.length > 10) {
    setFieldError(
      "postTags",
      "tagsError",
      "You can add a maximum of 10 tags."
    );
    isValid = false;
  }

  return isValid;
}

function updateContentCounter() {
  const contentInput = document.getElementById("postContent");
  const counter = document.getElementById("contentCounter");

  if (!contentInput || !counter) return;

  const length = contentInput.value.trim().length;

  counter.textContent =
    `${length} characters` +
    (length < MIN_CONTENT_LENGTH
      ? ` · ${MIN_CONTENT_LENGTH - length} more required`
      : "");

  counter.style.color =
    length < MIN_CONTENT_LENGTH ? "#dc3545" : "#138a5b";
}

/* =========================================
   12. CREATE OR UPDATE POST
========================================= */

function handlePostSubmit(event) {
  event.preventDefault();

  if (!validatePostForm()) {
    const firstInvalidField = app.querySelector('[aria-invalid="true"]');

    if (firstInvalidField) {
      firstInvalidField.focus();
    }

    showToast("Please fix the highlighted fields.", "error");
    return;
  }

  const id = document.getElementById("postId").value;
  const title = document.getElementById("postTitle").value.trim();
  const author = document.getElementById("postAuthor").value.trim();
  const content = document.getElementById("postContent").value.trim();

  const tags = [
    ...new Set(
      document
        .getElementById("postTags")
        .value.split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  ];

  const now = new Date().toISOString();

  if (id) {
    const postIndex = posts.findIndex((post) => post.id === id);

    if (postIndex === -1) {
      showToast("This post no longer exists.", "error");
      navigate("/");
      return;
    }

    const updatedPost = {
      ...posts[postIndex],
      title,
      author,
      content,
      tags,
      updatedAt: now
    };

    const previousPost = posts[postIndex];
    posts[postIndex] = updatedPost;

    if (!savePosts()) {
      posts[postIndex] = previousPost;
      return;
    }

    showToast("Post updated successfully!");
    navigate(`/posts/${encodeURIComponent(id)}`);
  } else {
    const newPost = {
      id: createId(),
      title,
      author,
      content,
      tags,
      createdAt: now,
      updatedAt: now
    };

    posts.unshift(newPost);

    if (!savePosts()) {
      posts.shift();
      return;
    }

    showToast("Post created successfully!");
    navigate(`/posts/${encodeURIComponent(newPost.id)}`);
  }
}

/* =========================================
   13. POST DETAILS PAGE
========================================= */

function renderPostDetails(id) {
  const post = getPostById(id);

  if (!post) {
    renderNotFound();
    return;
  }

  app.innerHTML = `
    <article class="detail-panel">
      <a href="#/" class="text-button">← Back to all posts</a>

      <header class="detail-header">
        <div class="post-meta">
          <span>By ${escapeHTML(post.author)}</span>
          <span aria-hidden="true">•</span>
          <time datetime="${escapeHTML(post.createdAt)}">
            ${formatDate(post.createdAt)}
          </time>
        </div>

        <h1 class="detail-title">
          ${escapeHTML(post.title)}
        </h1>

        ${
          post.updatedAt && post.updatedAt !== post.createdAt
            ? `
              <p class="subtitle">
                Last updated: ${formatDate(post.updatedAt)}
              </p>
            `
            : ""
        }

        ${renderTags(post.tags)}
      </header>

      <div class="detail-content">${escapeHTML(post.content)}</div>

      <section class="detail-section">
        <h3>Post Information</h3>
        <p><strong>Author:</strong> ${escapeHTML(post.author)}</p>
        <p><strong>Created:</strong> ${formatDate(post.createdAt)}</p>
        <p><strong>Tags:</strong> ${
          Array.isArray(post.tags) && post.tags.length
            ? escapeHTML(post.tags.join(", "))
            : "No tags"
        }</p>
      </section>

      <div class="form-actions">
        <a
          href="#/posts/${encodeURIComponent(post.id)}/edit"
          class="button button-primary"
        >
          Edit Post
        </a>

        <button
          type="button"
          class="button button-danger"
          data-action="delete"
          data-id="${escapeHTML(post.id)}"
        >
          Delete Post
        </button>
      </div>
    </article>
  `;
}

/* =========================================
   14. DELETE CONFIRMATION
========================================= */

function openDeleteDialog(id) {
  const post = getPostById(id);

  if (!post) {
    showToast("Post not found.", "error");
    return;
  }

  pendingDeleteId = id;

  const title = document.getElementById("deleteDialogTitle");
  const description = document.getElementById("deleteDialogDescription");

  if (title) {
    title.textContent = "Delete this post?";
  }

  if (description) {
    description.textContent =
      `Are you sure you want to delete "${post.title}"? This action cannot be undone.`;
  }

  if (deleteDialog && typeof deleteDialog.showModal === "function") {
    deleteDialog.showModal();
  } else {
    const confirmed = window.confirm(
      `Delete "${post.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      executeDelete();
    } else {
      pendingDeleteId = null;
    }
  }
}

function closeDeleteDialog() {
  pendingDeleteId = null;

  if (deleteDialog && deleteDialog.open) {
    deleteDialog.close();
  }
}

function executeDelete() {
  if (!pendingDeleteId) return;

  const id = pendingDeleteId;
  const originalPosts = posts;
  const post = getPostById(id);

  if (!post) {
    closeDeleteDialog();
    showToast("Post not found.", "error");
    return;
  }

  posts = posts.filter((item) => item.id !== id);

  if (!savePosts()) {
    posts = originalPosts;
    closeDeleteDialog();
    return;
  }

  closeDeleteDialog();
  showToast("Post deleted successfully!");

  const route = getCurrentRoute();

  if (route.page === "detail" || route.page === "edit") {
    navigate("/");
  } else {
    renderPostsList();
  }
}

/* =========================================
   15. NOT FOUND PAGE
========================================= */

function renderNotFound() {
  app.innerHTML = `
    <section class="empty-state">
      <div class="empty-icon">!</div>
      <h2>Post not found</h2>
      <p>
        The post may have been deleted or the link may be incorrect.
      </p>
      <a href="#/" class="button button-primary">
        Back to All Posts
      </a>
    </section>
  `;
}

/* =========================================
   16. SEARCH, FILTER & SORT EVENTS
========================================= */

app.addEventListener("input", function (event) {
  if (event.target.id === "searchInput") {
    const input = event.target;

    searchQuery = input.value;
    currentPage = 1;

    // Remember the caret because the results area is re-rendered.
    const caretPosition = input.selectionStart;

    renderPostsList();

    const refreshedInput = document.getElementById("searchInput");

    if (refreshedInput) {
      refreshedInput.focus();
      refreshedInput.setSelectionRange(caretPosition, caretPosition);
    }
  }

  if (event.target.id === "postContent") {
    updateContentCounter();

    if (event.target.getAttribute("aria-invalid") === "true") {
      setFieldError(
        "postContent",
        "contentError",
        event.target.value.trim().length < MIN_CONTENT_LENGTH
          ? `Content must contain at least ${MIN_CONTENT_LENGTH} characters.`
          : ""
      );
    }
  }
});

app.addEventListener("change", function (event) {
  if (event.target.id === "authorFilter") {
    selectedAuthor = event.target.value;
    currentPage = 1;
    renderPostsList();
  }

  if (event.target.id === "sortFilter") {
    sortOrder = event.target.value;
    currentPage = 1;
    renderPostsList();
  }
});

/* =========================================
   17. FORM SUBMISSION
========================================= */

app.addEventListener("submit", function (event) {
  if (event.target.id === "postForm") {
    handlePostSubmit(event);
  }
});

/* =========================================
   18. FORM ERROR CLEANUP
========================================= */

app.addEventListener("input", function (event) {
  const fieldErrorMap = {
    postTitle: ["titleError", "title"],
    postAuthor: ["authorError", "author"],
    postContent: ["contentError", "content"],
    postTags: ["tagsError", "tags"]
  };

  const config = fieldErrorMap[event.target.id];

  if (!config) return;

  const [errorId, fieldName] = config;
  const errorElement = document.getElementById(errorId);

  if (!errorElement || !errorElement.textContent) return;

  if (fieldName === "title") {
    const value = event.target.value.trim();

    if (value.length >= 3 && value.length <= 120) {
      setFieldError("postTitle", "titleError", "");
    }
  }

  if (fieldName === "author") {
    const value = event.target.value.trim();

    if (value.length > 0 && value.length <= 80) {
      setFieldError("postAuthor", "authorError", "");
    }
  }

  if (fieldName === "content") {
    if (event.target.value.trim().length >= MIN_CONTENT_LENGTH) {
      setFieldError("postContent", "contentError", "");
    }
  }

  if (fieldName === "tags") {
    const tags = event.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (tags.length <= 10 && tags.every((tag) => tag.length <= 30)) {
      setFieldError("postTags", "tagsError", "");
    }
  }
});

/* =========================================
   19. BUTTON ACTIONS — EVENT DELEGATION
========================================= */

app.addEventListener("click", function (event) {
  const button = event.target.closest("[data-action]");

  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;

  switch (action) {
    case "delete":
      openDeleteDialog(id);
      break;

    case "previous-page":
      if (currentPage > 1) {
        currentPage--;
        renderPostsList();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      break;

    case "next-page": {
      const totalPages = Math.max(
        1,
        Math.ceil(getFilteredPosts().length / PAGE_SIZE)
      );

      if (currentPage < totalPages) {
        currentPage++;
        renderPostsList();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      break;
    }

    case "clear-filters":
      searchQuery = "";
      selectedAuthor = "";
      sortOrder = "newest";
      currentPage = 1;
      renderPostsList();
      break;

    default:
      console.warn(`Unknown action: ${action}`);
  }
});

/* =========================================
   20. DELETE DIALOG EVENTS
========================================= */

if (cancelDeleteButton) {
  cancelDeleteButton.addEventListener("click", closeDeleteDialog);
}

if (confirmDeleteButton) {
  confirmDeleteButton.addEventListener("click", executeDelete);
}

if (deleteDialog) {
  deleteDialog.addEventListener("click", function (event) {
    // Clicking the dark backdrop closes the dialog.
    if (event.target === deleteDialog) {
      closeDeleteDialog();
    }
  });

  deleteDialog.addEventListener("cancel", function () {
    pendingDeleteId = null;
  });
}

/* =========================================
   21. START THE APPLICATION
========================================= */

function initApp() {
  if (!app) {
    console.error('Missing required HTML element: id="app"');
    return;
  }

  renderRoute();
}

initApp();