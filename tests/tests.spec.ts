import testWithTypedContext, { TestInterface } from 'ava'
import * as Chance from 'chance'
import * as path from 'path'
import createFolderStructure, { createFile, createFolder } from '../src'
import { assertFileExist, assertFolderExist, TestContext } from './utils'

const chance = Chance()

const test = testWithTypedContext as TestInterface<TestContext>

test.afterEach(t => t.context?.cleanup && t.context?.cleanup())

test('multi folders structure', async t => {
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

test('multi folders structure without specifying entry-folder-name', async t => {
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

test('entry is a file', async t => {
  const [hash1] = [chance.hash()]
  const { entryPath, cleanup } = await createFolderStructure({
    entryName: 'file1.txt',
    content: hash1,
  })

  t.context.cleanup = cleanup

  await assertFileExist(t, entryPath, hash1)
})

test('entry is a file without specifying entry-file-name', async t => {
  const [hash1] = [chance.hash()]
  const { entryPath, cleanup } = await createFolderStructure({
    content: hash1,
  })

  t.context.cleanup = cleanup

  await assertFileExist(t, entryPath, hash1)
})

test('entry is a folder', async t => {
  const { entryPath, cleanup } = await createFolderStructure({
    entryName: 'folder1',
    content: {},
  })

  t.context.cleanup = cleanup

  await assertFolderExist(t, entryPath)
})

test('entry is a folder without specifying entry-file-name', async t => {
  const { entryPath, cleanup } = await createFolderStructure({
    content: {},
  })

  t.context.cleanup = cleanup

  await assertFolderExist(t, entryPath)
})

test('multi folders structur with shortcuts', async t => {
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

test('leafs with extension will automatically be files and not folders - json with single key', async t => {
  const { entryPath, cleanup } = await createFolderStructure({
    entryName: 'folder1',
    content: {
      ['file1.json']: {},
    },
  })

  t.context.cleanup = cleanup

  await assertFileExist(t, path.join(entryPath, 'file1.json'), JSON.stringify({}))
})

test('leafs with extension will automatically be files and not folders - json with multiple keys', async t => {
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

test('leafs with extension will automatically be files and not folders - json with no keys', async t => {
  const { entryPath, cleanup } = await createFolderStructure({
    entryName: 'file1.json',
    content: {},
  })

  t.context.cleanup = cleanup

  await assertFileExist(t, entryPath, JSON.stringify({}))
  t.true(entryPath.endsWith('.json'))
})

test('leafs with extension will automatically be files and not folders - json with two keps', async t => {
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

test('non-json-extension will be a folder if the content is object', async t => {
  const [hash1, hash2] = [chance.hash(), chance.hash()]
  const { entryPath, cleanup } = await createFolderStructure({
    entryName: 'file1.non_json',
    content: {
      a: hash1,
      b: hash2,
    },
  })

  t.context.cleanup = cleanup

  await assertFolderExist(t, entryPath)
  await assertFileExist(t, path.join(entryPath, 'a'), hash1)
  await assertFileExist(t, path.join(entryPath, 'b'), hash2)
})

test('createFolder proxies to createFolderStructure', async t => {
  const hash = chance.hash()
  const entryPath = await createFolder({
    'file.txt': hash,
  })

  await assertFileExist(t, path.join(entryPath, 'file.txt'), hash)
})

test('createFolder proxies to createFolderStructure - complex', async t => {
  const hash = chance.hash()
  const entryPath = await createFolder({
    f1: {},
    f2: {
      'file1.json': {
        a: hash,
      },
    },
  })

  await assertFolderExist(t, path.join(entryPath, 'f1'))
  await assertFileExist(
    t,
    path.join(entryPath, 'f2', 'file1.json'),
    JSON.stringify(
      {
        a: hash,
      },
      null,
      2,
    ),
  )
})

test('createFile proxies to createFolderStructure', async t => {
  const hash = chance.hash()
  const entryPath = await createFile({
    key123: hash,
  })

  await assertFileExist(
    t,
    entryPath,
    JSON.stringify(
      {
        key123: hash,
      },
      null,
      2,
    ),
  )
  t.true(entryPath.endsWith('.json'))
})

test('createFolder without params', async t => {
  const entryPath = await createFolder()
  await assertFolderExist(t, entryPath)
})

test('createFile without params', async t => {
  const entryPath = await createFile()
  await assertFileExist(t, entryPath, '')
})
