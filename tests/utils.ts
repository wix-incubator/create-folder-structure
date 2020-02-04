import { ExecutionContext } from 'ava'
import * as fse from 'fs-extra'
import * as pathExists from 'path-exists'

export type TestContext = {
  cleanup: () => Promise<void>
}

export const assertFileExist = async (t: ExecutionContext<TestContext>, filePath: string, fileContent: string) => {
  t.true(await pathExists(filePath))
  t.is((await fse.readFile(filePath)).toString(), fileContent)
}

export const isDirectory = (folderPath: string) =>
  new Promise((res, rej) =>
    require('is-directory')(folderPath, (err: any, result: boolean) => (err ? rej(err) : res(result))),
  )

export const assertFolderExist = async (t: ExecutionContext<TestContext>, folderPath: string) => {
  t.true(await pathExists(folderPath))
  t.true(await isDirectory(folderPath))
}
