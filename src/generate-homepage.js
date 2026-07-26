import fs from "fs"
import mustache from "mustache"

const user = "rmhaiderali"
const userPage = user + ".github.io"
const limit = "500"

const refresh = false

let data = fs.existsSync("temp/repos.json")
  ? JSON.parse(fs.readFileSync("temp/repos.json", "utf8"))
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
  fs.writeFileSync("temp/repos.json", JSON.stringify(data, null, 2))
}

const pagesRepos = data
  .filter((repo) => repo.has_pages)
  .filter((repo) => repo.name !== userPage)

const template = fs.readFileSync("src/template.mustache", "utf8")

const doc = mustache.render(template, { user, pagesRepos })

fs.mkdirSync("dist", { recursive: true })
fs.writeFileSync("dist/index.html", doc)
