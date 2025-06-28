export const generateSlug = (title) => {
  return title.toLowerCase().replace(/\s+/g, "_");
};
