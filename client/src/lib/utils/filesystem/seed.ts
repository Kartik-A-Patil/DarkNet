import { FileType, STORE_NAME } from './types';
import { initFileSystemDB, addToCache } from './db';
import { addChildrenToDB } from './advanced-operations';

/**
 * Seed the database with initial filesystem structure if empty
 */
export const seedFileSystemIfEmpty = async (): Promise<void> => {
  const db = await initFileSystemDB();
  
  // Check if root exists
  const rootExists = await db.get(STORE_NAME, '/');
  
  if (!rootExists) {
    console.log('Seeding filesystem with initial structure...');
    
    // Initial filesystem structure with proper FileType enum values
    const initialFileSystem = {
      '/': {
        type: FileType.DIRECTORY,
        permissions: 'drwxr-xr-x',
        owner: 'root',
        children: {
          bin: { type: FileType.DIRECTORY, permissions: 'drwxr-xr-x', owner: 'root', children: {} },
          etc: { type: FileType.DIRECTORY, permissions: 'drwxr-xr-x', owner: 'root', children: {} },
          home: {
            type: FileType.DIRECTORY,
            permissions: 'drwxr-xr-x',
            owner: 'root',
            children: {
              hackos: {
                type: FileType.DIRECTORY,
                permissions: 'drwxr-xr-x',
                owner: 'hackos',
                children: {
                  Documents: {
                    type: FileType.DIRECTORY,
                    permissions: 'drwxr-xr-x',
                    owner: 'hackos',
                    children: {
                      'targets.txt': {
                        type: FileType.FILE,
                        content: '192.168.1.1\n192.168.1.5\n192.168.1.15',
                        permissions: '-rw-r--r--',
                        owner: 'hackos',
                      },
                    },
                  },
                  Downloads: { 
                    type: FileType.DIRECTORY, 
                    permissions: 'drwxr-xr-x', 
                    owner: 'hackos', 
                    children: {} 
                  },
                  Pictures: { 
                    type: FileType.DIRECTORY, 
                    permissions: 'drwxr-xr-x', 
                    owner: 'hackos', 
                    children: {} 
                  },
                  'notes.txt': {
                    type: FileType.FILE,
                    content: 'Remember to scan network for vulnerable services.\nCheck port 22 for SSH access.',
                    permissions: '-rw-r--r--',
                    owner: 'hackos',
                  },
                  'exploit.py': {
                    type: FileType.EXECUTABLE,
                    content: "print('hello world')",
                    permissions: '-rwxr-xr-x',
                    owner: 'hackos',
                  },
                },
              },
            },
          },
          var: {
            type: FileType.DIRECTORY,
            permissions: 'drwxr-xr-x',
            owner: 'root',
            children: {},
          },
          usr: {
            type: FileType.DIRECTORY,
            permissions: 'drwxr-xr-x',
            owner: 'root',
            children: {},
          },
        },
      }
    };

    // Use a transaction to improve performance of initial seeding
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Store the root node
    await store.put(initialFileSystem['/'], '/');
    
    // Recursively add children nodes in the same transaction
    await addChildrenToDB('/', initialFileSystem['/'], store);
    
    // Commit the transaction
    await tx.done;
    
    // Add root to cache
    addToCache('/', initialFileSystem['/']);
  }
};
