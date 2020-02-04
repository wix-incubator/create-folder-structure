import * as Chance from 'chance'
import testWithTypedContext, { TestInterface, ExecutionContext } from 'ava'
import createFolderStructure from '../src'
import * as fse from 'fs-extra'
import * as pathExists from 'path-exists'
import * as path from 'path'
import { assertFileExist, assertFolderExist, TestContext } from './utils'

const chance = Chance()

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

test('8 - leafs with extension will automatically be files and not folders', async t => {
  const [hash1, hash2, hash3, hash4] = [chance.hash(), chance.hash(), chance.hash(), chance.hash()]
  const { entryPath, cleanup } = await createFolderStructure({
    entryName: 'folder1',
    content: {
      ['file1.json']: {},
    },
  })

  t.context.cleanup = cleanup

  await assertFileExist(t, path.join(entryPath, 'file1.json'), JSON.stringify({}))
})

test('9 - leafs with extension will automatically be files and not folders', async t => {
  const { entryPath, cleanup } = await createFolderStructure({
    entryName: 'folder1',
    content: {
      ['file1.json']: {
        a: 1,
        b: 2,
      },
    },
  })

  t.context.cleanup = cleanup

  await assertFileExist(t, path.join(entryPath, 'file1.json'), JSON.stringify({ a: 1, b: 2 }, null, 2))
})

test('10 - leafs with extension will automatically be files and not folders', async t => {
  const { entryPath, cleanup } = await createFolderStructure({
    entryName: 'file1.json',
    content: {},
  })

  t.context.cleanup = cleanup

  await assertFileExist(t, entryPath, JSON.stringify({}))
})

test('11 - leafs with extension will automatically be files and not folders', async t => {
  const { entryPath, cleanup } = await createFolderStructure({
    entryName: 'file1.json',
    content: {
      a: 1,
      b: 2,
    },
  })

  t.context.cleanup = cleanup

  await assertFileExist(t, entryPath, JSON.stringify({ a: 1, b: 2 }, null, 2))
})
