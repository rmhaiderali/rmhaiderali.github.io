import fs from "fs"
import mustache from "mustache"

const user = "rmhaiderali"

const githubUser = user
const githubRepoLimit = "500"
const githubReposTemp = "temp/github.repos.by." + githubUser + ".json"

const npmUser = user
const npmPackagesTemp = "temp/npm.packages.by." + npmUser + ".json"

const stringify = (object) => JSON.stringify(object, null, 2)

const uncached = []

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

let githubRepos = fs.existsSync(githubReposTemp)
  ? JSON.parse(fs.readFileSync(githubReposTemp, "utf8"))
  : uncached

if (githubRepos === uncached) {
  const url =
    "https://api.github.com/users/" +
    githubUser +
    "/repos?per_page=" +
    githubRepoLimit

  const res = await fetch(url)

  if (res.ok) {
    githubRepos = await res.json()
    fs.mkdirSync("temp", { recursive: true })
    fs.writeFileSync(githubReposTemp, stringify(githubRepos))
  } else {
    console.error("Error fetching data from GitHub API")
    console.error(await res.json())
  }
}

const githubPages = githubRepos
  .filter((repo) => repo.has_pages)
  .filter((repo) => repo.name !== githubUser + ".github.io")

console.log(githubPages.length + " GitHub Pages found for user " + githubUser)

if (githubPages.length)
  console.log(githubPages.map((repo) => "• " + repo.name).join("\n"))

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
console.log()
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

let npmPackages = fs.existsSync(npmPackagesTemp)
  ? JSON.parse(fs.readFileSync(npmPackagesTemp, "utf8"))
  : uncached

if (npmPackages === uncached) {
  const url = "https://registry.npmjs.org/-/user/" + npmUser + "/package"

  const res = await fetch(url)

  if (res.ok) {
    npmPackages = await res.json()
    fs.mkdirSync("temp", { recursive: true })
    fs.writeFileSync(npmPackagesTemp, stringify(npmPackages))
  } else {
    console.error("Error fetching data from NPM API")
    console.error(await res.json())
  }
}

npmPackages = Object.keys(npmPackages)

console.log(npmPackages.length + " NPM Packages found for user " + npmUser)

if (npmPackages.length)
  console.log(npmPackages.map((pkg) => "• " + pkg).join("\n"))

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const template = fs.readFileSync("src/template.mustache", "utf8")

const doc = mustache.render(template, {
  npmUser,
  githubUser,
  npmPackages,
  githubPages,
})

fs.mkdirSync("dist", { recursive: true })
fs.writeFileSync("dist/index.html", doc)
