import fs from "fs"
import mustache from "mustache"

const user = "rmhaiderali"
const userPage = user + ".github.io"
const limit = "500"
const reposTempFile = "temp/" + user + ".repos.json"

const refresh = false

let data = fs.existsSync(reposTempFile)
  ? JSON.parse(fs.readFileSync(reposTempFile, "utf8"))
  : null

if (refresh || !data) {
  const url =
    "https://api.github.com/users/" + user + "/repos?per_page=" + limit

  const res = await fetch(url)

  data = await res.json()

  if (!Array.isArray(data)) {
    console.error("Error fetching data from GitHub API")
    console.error(data)
    process.exit(1)
  }

  fs.mkdirSync("temp", { recursive: true })
  fs.writeFileSync(reposTempFile, JSON.stringify(data, null, 2))
}

const pagesRepos = data
  .filter((repo) => repo.has_pages)
  .filter((repo) => repo.name !== userPage)

if (pagesRepos.length === 0) {
  console.log("No GitHub Pages found for user " + user)
  process.exit(2)
}

console.log("Found " + pagesRepos.length + " GitHub Pages for user " + user)
console.log(pagesRepos.map((repo) => repo.name).join("\n"))

const template = fs.readFileSync("src/template.mustache", "utf8")

const doc = mustache.render(template, { user, pagesRepos })

fs.mkdirSync("dist", { recursive: true })
fs.writeFileSync("dist/index.html", doc)
