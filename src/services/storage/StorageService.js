const fs = require('fs');
const path = require('path');

class StorageService {
  constructor() {
    // Use absolute path
    const rootPath = path.resolve(__dirname, '../../../');
    this._folder = path.join(rootPath, 'uploads', 'covers');

    console.log('Current directory:', __dirname);
    console.log('Root path:', rootPath);
    console.log('Storage folder:', this._folder);

    // Create uploads directory
    if (!fs.existsSync(this._folder)) {
      console.log('Creating uploads directory');
      fs.mkdirSync(this._folder, { recursive: true });
    }

    // Test write permissions
    try {
      const testFile = path.join(this._folder, 'test-permissions.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log('Write permissions verified');
    } catch (error) {
      console.error('Error verifying write permissions:', error);
    }
  }

  writeFile(file, meta) {
    const timestamp = +new Date();
    const originalname = meta.filename;
    const filename = `${timestamp}-${originalname}`;
    const filepath = path.join(this._folder, filename);

    console.log('Original filename:', originalname);
    console.log('Generated filename:', filename);
    console.log('Writing file to:', filepath);

    const fileStream = fs.createWriteStream(filepath);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => {
        console.error('Error writing file:', error);
        reject(error);
      });

      file.on('error', (error) => {
        console.error('Error reading upload:', error);
        reject(error);
      });

      fileStream.on('finish', () => {
        console.log('File written successfully to:', filepath);
        // Verify file exists
        if (fs.existsSync(filepath)) {
          console.log('File verified at:', filepath);
          console.log('File size:', fs.statSync(filepath).size, 'bytes');
        } else {
          console.error('File not found after writing:', filepath);
        }
        resolve(filename);
      });

      file.pipe(fileStream);
    });
  }

  deleteFile(filename) {
    const filepath = path.join(this._folder, filename);
    console.log('Deleting file:', filepath);

    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
        console.log('File deleted successfully');
      } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
      }
    } else {
      console.log('File does not exist:', filepath);
    }
  }
}

module.exports = StorageService;
