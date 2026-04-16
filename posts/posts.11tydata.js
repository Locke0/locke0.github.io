const todaysDate = new Date();
const isDev = require("../_data/isdevelopment")();

function showDraft(data) {
  // In development, show all posts including drafts
  if (isDev) return true;
  
  // In production, only show published posts
  const isDraft = data.draft === true;
  const isPostInFuture =
    "scheduled" in data ? data.scheduled > todaysDate : false;
  
  // Return true if post should be shown (not draft, not in future)
  return !isDraft && !isPostInFuture;
}

module.exports = () => {
  return {
    eleventyComputed: {
      eleventyExcludeFromCollections: (data) => {
        return showDraft(data) ? false : true;
      },
      permalink: (data) => {
        if (!showDraft(data)) return false;
        return data.permalink;
      },
      image: (data) => {
        if (data.image) return data.image;
        const slug = data.page && data.page.fileSlug;
        if (slug) return `/img/og/${slug}.png`;
        return "/img/og/default.png";
      },
    },
    tags: ["posts"],
  };
};
