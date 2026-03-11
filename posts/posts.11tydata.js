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
        // If post should be shown, don't exclude it
        // If post should be hidden, exclude it
        return showDraft(data) ? false : true;
      },
      permalink: (data) => {
        // If post should be hidden, don't generate a page
        // If shown, return undefined to use Eleventy's default permalink
        if (!showDraft(data)) return false;
        return data.permalink;
      },
    },
    tags: ["posts"],
  };
};
