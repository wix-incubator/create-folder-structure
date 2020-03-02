### File/Folder Structure Creator

Declarative complex file/folder creator

---

```typescript
yarn add --dev create-folder-structure
```

---

`createFolderStructure` returns `realpath` without any symbolic links (using `fs.realpath`)

1. Create anonymous folder

   ```typescript
   import { createFolder } from 'create-folder-structure'

   const entryPath = await createFolder({
     file7: 'file content7',
     ['folder6/folder7']: {},
   })
   ```

2. Create anonymous file

   ```typescript
   import { createFile } from 'create-folder-structure'

   const entryPath = await createFile('file content')
   ```

   ```typescript
   import { createFile } from 'create-folder-structure'

   const entryPath = await createFile({
     key1: 'value',
     key2: 1,
   })
   ```

---

### Full API

1. Create folder

   ```typescript
   import createFolderStructure from 'create-folder-structure'

   const { entryPath, cleanup } = await createFolderStructure({
     entryName: 'folder1',
     content: {
       ['file1.txt']: 'file content1',
       ['folder2/folder3/file2']: 'file content2',
       ['folder2/folder3/file3']: 'file content3',
       ['folder2/file4']: 'file content4',
       folder2: {
         folder5: {
           file5: 'file content5',
           file6: 'file content6',
         },
         file7: 'file content7',
       },
       folder4: {
         folder5: {},
       },
       ['folder6/folder7']: {},
     },
   })
   ```

2. Create anonymous folder

   ```typescript
   import createFolderStructure from 'create-folder-structure'

   const { entryPath, cleanup } = await createFolderStructure({
     content: {
       file7: 'file content7',
       ['folder6/folder7']: {},
     },
   })
   ```

3. Create file

   ```typescript
   import createFolderStructure from 'create-folder-structure'

   const { entryPath, cleanup } = await createFolderStructure({
     entryName: 'folder1',
     content: 'file content1',
   })
   ```

4. Create anonymous file

   ```typescript
   import createFolderStructure from 'create-folder-structure'

   const { entryPath, cleanup } = await createFolderStructure({
     content: 'file content1',
   })
   ```

5. you can specify file with an json extension and give it a JSON value instead of a string value:

   ```typescript
   import createFolderStructure from 'create-folder-structure'

   const { entryPath, cleanup } = await createFolderStructure({
     entryName: 'file.json',
     content: 1,
   })
   ```

   ```typescript
   import createFolderStructure from 'create-folder-structure'

   const { entryPath, cleanup } = await createFolderStructure({
     entryName: 'dir1',
     content: {
       'file.json': { a: 1, b: 2 },
     },
   })
   ```
