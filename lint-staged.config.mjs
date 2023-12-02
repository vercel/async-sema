export default {
  "**/*.{ts,js,json,md,yml}": [
    "prettier --write"
  ],
  "{src,test}/**/*.ts": [
    "eslint --fix"
  ]
}
