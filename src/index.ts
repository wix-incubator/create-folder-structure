import * as fsExtra from 'fs-extra'
import * as path from 'path'
import * as tmp from 'tmp-promise'
import * as mkdirp from 'mkdirp'
import * as chance from 'chance'

export type FolderStructureContent = string | {} | FolderStructure

export type FolderStructure = {
  [name: string]: FolderStructureContent
}

export type EntryStructure = {
  entryName?: string
  content: FolderStructureContent
}

export async function createFolder(content: FolderStructure = {}): Promise<string> {
  const originalResult = await createFolderStructure({ content })
  return originalResult.entryPath
}

export async function createFile(content: string | {} = ''): Promise<string> {
  const fileName = `${chance()
    .hash()
    .toLocaleLowerCase()}.json`
  const result =
    typeof content === 'string'
      ? await createFolderStructure({ content })
      : await createFolderStructure({ entryName: fileName, content })
  return result.entryPath
}

export default async function createFolderStructure(
  structure: EntryStructure,
): Promise<{
  entryPath: string
  cleanup: () => Promise<void>
}> {
  if (typeof structure.content === 'string' || structure.entryName?.endsWith('.json')) {
    const { path: dirPath } = structure.entryName ? await tmp.dir() : await tmp.file()
    const cleanup = () => fsExtra.remove(dirPath)
    const entryPath = structure.entryName ? path.join(dirPath, structure.entryName) : dirPath
    await fsExtra.writeFile(
      entryPath,
      typeof structure.content === 'string' ? structure.content : JSON.stringify(structure.content, null, 2),
    )
    return {
      entryPath,
      cleanup,
    }
  } else {
    const { path: dirPath } = await tmp.dir()
    const cleanup = () => fsExtra.remove(dirPath)
    const entryPath = structure.entryName ? path.join(dirPath, structure.entryName) : dirPath
    if (entryPath !== dirPath) {
      await fsExtra.mkdir(entryPath)
    }
    await createFolderStructureRecursively(structure.content, { cwd: entryPath })
    return {
      entryPath: await fsExtra.realpath(entryPath),
      cleanup,
    }
  }
}

const mkdirpPromise = (complexPath: string) =>
  new Promise((res, rej) => mkdirp(complexPath, err => (err ? rej(err) : res())))

async function createFolderStructureRecursively(structure: FolderStructure, options: { cwd: string }): Promise<void> {
  return (
    Object.entries(structure)
      .map(([key, value]) => async () => {
        if (typeof value === 'string' || key.endsWith('.json')) {
          await mkdirpPromise(path.dirname(path.join(options.cwd, key)))
          return fsExtra.writeFile(
            path.join(options.cwd, key),
            typeof value === 'string' ? value : JSON.stringify(value, null, 2),
          )
        } else {
          await mkdirpPromise(path.join(options.cwd, key))
          return createFolderStructureRecursively(value, { ...options, cwd: path.join(options.cwd, key) })
        }
      })
      // it ensures that all the promises will run serially to ensure that we never create the same folder/path multiple times concurrently.
      .reduce((acc, promiseFunc) => acc.then(promiseFunc), Promise.resolve())
  )
}
