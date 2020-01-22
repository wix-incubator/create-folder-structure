import * as fsExtra from 'fs-extra'
import * as path from 'path'
import * as tmp from 'tmp-promise'
import * as mkdirp from 'mkdirp'

export type FolderStructure = {
  [name: string]: string | FolderStructure
}

export type EntryStructure = {
  entryName?: string
  content: string | FolderStructure
}

export default async function createFolderStructure(
  structure: EntryStructure,
): Promise<{
  entryPath: string
  cleanup: () => Promise<void>
}> {
  if (typeof structure.content === 'string') {
    const { path: dirPath } = structure.entryName ? await tmp.dir() : await tmp.file()
    const cleanup = () => fsExtra.remove(dirPath)
    const entryPath = structure.entryName ? path.join(dirPath, structure.entryName) : dirPath
    await fsExtra.writeFile(entryPath, structure.content)
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
      entryPath,
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
        if (typeof value === 'string') {
          await mkdirpPromise(path.dirname(path.join(options.cwd, key)))
          return fsExtra.writeFile(path.join(options.cwd, key), value)
        } else {
          await mkdirpPromise(path.join(options.cwd, key))
          return createFolderStructureRecursively(value, { ...options, cwd: path.join(options.cwd, key) })
        }
      })
      // it ensures that all the promises will run serially to ensure that we never create the same folder/path multiple times concurrently.
      .reduce((acc, promiseFunc) => acc.then(promiseFunc), Promise.resolve())
  )
}
