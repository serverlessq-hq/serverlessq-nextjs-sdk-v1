const removeLeadingAndTrailingSlashes = (path: string): string => {
  return path.replace(/^\/+/g, '').replace(/\/+$/, '')
}

const checkStringForSlashes = (str: string): boolean => {
  return str.includes('/')
}

export { removeLeadingAndTrailingSlashes, checkStringForSlashes }
