import * as Chance from 'chance'
import testWithTypedContext, { TestInterface, ExecutionContext } from 'ava'
import createFolderStructure from '../src'
import * as fse from 'fs-extra'
import * as pathExists from 'path-exists'
import * as path from 'path'

const chance = Chance()

type TestContext = {
  cleanup: () => Promise<void>
}

const test = testWithTypedContext as TestInterface<TestContext>

test.afterEach(t => t.context?.cleanup && t.context?.cleanup())

test('1 - multi folders structure', async t => {
  const [hash1, hash2, hash3, hash4] = [chance.hash(), chance.hash(), chance.hash(), chance.hash()]
  const { entryPath, cleanup } = await createFolderStructure({
    entryName: 'folder1',
    content: {
      ['file1.txt']: hash1,
      folder2: {
        folder3: {
          file2: hash2,
          file3: hash3,
        },
        file4: hash4,
      },
      folder4: {
        folder5: {},
      },
    },
  })

  t.context.cleanup = cleanup

  await assertFileExist(t, path.join(entryPath, 'file1.txt'), hash1)
  await assertFileExist(t, path.join(entryPath, 'folder2/folder3/file2'), hash2)
  await assertFileExist(t, path.join(entryPath, 'folder2/folder3/file3'), hash3)
  await assertFileExist(t, path.join(entryPath, 'folder2/file4'), hash4)
  await assertFolderExist(t, path.join(entryPath, 'folder4/folder5'))
})

test('2 - multi folders structure without specifying entry-folder-name', async t => {
  const [hash1, hash2, hash3, hash4] = [chance.hash(), chance.hash(), chance.hash(), chance.hash()]
  const { entryPath, cleanup } = await createFolderStructure({
    content: {
      ['file1.txt']: hash1,
      folder2: {
        folder3: {
          file2: hash2,
          file3: hash3,
        },
        file4: hash4,
      },
      folder4: {
        folder5: {},
      },
    },
  })

  t.context.cleanup = cleanup

  await assertFileExist(t, path.join(entryPath, 'file1.txt'), hash1)
  await assertFileExist(t, path.join(entryPath, 'folder2/folder3/file2'), hash2)
  await assertFileExist(t, path.join(entryPath, 'folder2/folder3/file3'), hash3)
  await assertFileExist(t, path.join(entryPath, 'folder2/file4'), hash4)
  await assertFolderExist(t, path.join(entryPath, 'folder4/folder5'))
})

test('3 - entry is a file', async t => {
  const [hash1] = [chance.hash()]
  const { entryPath, cleanup } = await createFolderStructure({
    entryName: 'file1.txt',
    content: hash1,
  })

  t.context.cleanup = cleanup

  await assertFileExist(t, entryPath, hash1)
})

test('4 - entry is a file without specifying entry-file-name', async t => {
  const [hash1] = [chance.hash()]
  const { entryPath, cleanup } = await createFolderStructure({
    content: hash1,
  })

  t.context.cleanup = cleanup

  await assertFileExist(t, entryPath, hash1)
})

test('5 - entry is a folder', async t => {
  const { entryPath, cleanup } = await createFolderStructure({
    entryName: 'folder1',
    content: {},
  })

  t.context.cleanup = cleanup

  await assertFolderExist(t, entryPath)
})

test('6 - entry is a folder without specifying entry-file-name', async t => {
  const { entryPath, cleanup } = await createFolderStructure({
    content: {},
  })

  t.context.cleanup = cleanup

  await assertFolderExist(t, entryPath)
})

test('7 - multi folders structure - with shortcuts', async t => {
  const [hash1, hash2, hash3, hash4] = [chance.hash(), chance.hash(), chance.hash(), chance.hash()]
  const { entryPath, cleanup } = await createFolderStructure({
    entryName: 'folder1',
    content: {
      ['file1.txt']: hash1,
      ['folder2/folder3/file2']: hash2,
      ['folder2/folder3/file3']: hash3,
      ['folder2/file4']: hash4,
      folder4: {
        folder5: {},
      },
      ['folder6/folder7']: {},
    },
  })

  t.context.cleanup = cleanup

  await assertFileExist(t, path.join(entryPath, 'file1.txt'), hash1)
  await assertFileExist(t, path.join(entryPath, 'folder2/folder3/file2'), hash2)
  await assertFileExist(t, path.join(entryPath, 'folder2/folder3/file3'), hash3)
  await assertFileExist(t, path.join(entryPath, 'folder2/file4'), hash4)
  await assertFolderExist(t, path.join(entryPath, 'folder4/folder5'))
  await assertFolderExist(t, path.join(entryPath, 'folder6/folder7'))
})

const assertFileExist = async (t: ExecutionContext<TestContext>, filePath: string, fileContent: string) => {
  t.true(await pathExists(filePath))
  t.is((await fse.readFile(filePath)).toString(), fileContent)
}

const isDirectory = (folderPath: string) =>
  new Promise((res, rej) =>
    require('is-directory')(folderPath, (err: any, result: boolean) => (err ? rej(err) : res(result))),
  )

const assertFolderExist = async (t: ExecutionContext<TestContext>, folderPath: string) => {
  t.true(await pathExists(folderPath))
  t.true(await isDirectory(folderPath))
}
