const removeLeadingAndTrailingSlashes = (path: string): string => {
  return path.replace(/^\/+/g, '').replace(/\/+$/, '')
}

export { removeLeadingAndTrailingSlashes }
