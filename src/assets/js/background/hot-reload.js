/*
 Script from https://github.com/xpl/crx-hotreload
 Reloads active tab if lastModifiedDate of any file inside package folder
 changes, or if files are added or removed
 */

/*
 window.DirectoryEntry object structure
 {
 filesystem: DOMFileSystem
 fullPath: "/crxfs"
 isDirectory: true
 isFile: false
 name: "crxfs"
 }
 */

/**
 * Uses "File and Directory Entries API" to get the list of all files in the
 * extension directory recursively.
 * If isDirectory is true this function will call itself again until finds an
 * entry that is not a directory
 * @param {Object} DirectoryEntry
 * @property {Function} DirectoryEntry.createReader Object that reads
 * the entries in the directory
 * @property {Function} DirectoryEntry.readEntries gets the directory
 * entries within the directory being read and delivers them in an array
 * to the callback function
 * @return {Promise|Boolean}
 */
function filesInDirectory(DirectoryEntry) {
  const directoriesToWatch = [
    'crxfs',
    'dist',
  ];

  const isDirectoryToWatch = directoriesToWatch.some((directory) => {
    return DirectoryEntry.name === directory;
  });

  const isFile = !DirectoryEntry.isDirectory;

  if (isDirectoryToWatch || isFile) {
    return new Promise((resolve) => {
      const reader = DirectoryEntry.createReader();
      reader.readEntries(readEntries(resolve));
    });
  }
}

/**
 * Read all entries in directory
 * @param {Function} resolve
 * @return {Function}
 */
function readEntries(resolve) {
  return function(fileOrDirectoryEntry) {
    const allFiles = fileOrDirectoryEntry.filter(directoryIsNotDot)
                                         .map(checkIfEntryIsDirectory);

    return Promise.all(allFiles)
                  .then(concatAllFilesInSingleArray)
                  .then(resolve);
  };
}

/**
 * Concat all file objects in a single array
 * @param {Object} files
 * @return {Array}
 */
function concatAllFilesInSingleArray(files) {
  return [].concat(...files);
}

/**
 * Check if directory is current directory represented by '.'
 * @param {Object} entry
 * @return {boolean}
 */
function directoryIsNotDot(entry) {
  return entry.name[0] !== '.';
}

/**
 * If entry is a directory run filesInDirectory again,
 * if not return promise with the file
 * @param {Object} entry
 * @property {Function} entry.file
 * @return {Promise}
 */
function checkIfEntryIsDirectory(entry) {
  if (entry.isDirectory) {
    return filesInDirectory(entry);
  } else {
    return new Promise((resolve) => entry.file(resolve));
  }
}

/**
 * Calls filesInDirectory function, and calls concatFileProps
 * on each file returned by filesInDirectory
 * @param {Object} packageDirectoryEntry
 * @return {Promise}
 */
function timestampForFilesInDirectory(packageDirectoryEntry) {
  return filesInDirectory(packageDirectoryEntry).then(concatFileProps);
}

/**
 * Concatenates file names and lastModifiedDate properties of all files,
 * resulting in a single string
 * @param {Array} files
 * @return {string}
 */
function concatFileProps(files) {
  /* Each file object structure
   {
   lastModified : 1484106803000,
   lastModifiedDate : Wed Jan 11 2017 01:53:23 GMT-0200 (BRST),
   name : "filename.ext",
   size : 266,
   type : "",
   webkitRelativePath : ""
   }
   */
  return files.map((file) => {
    if (file) {
      return file.name + file.lastModifiedDate;
    }
  }).join();
}

/**
 * Reloads the active tab
 */
function reload() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id); // Reloads Active Tab
    }
    chrome.runtime.reload(); // Reloads Extension
  });
}

/**
 * Keeps calling itself recursively until changes are detected
 // triggering reload
 * @param {Object} packageDirectoryEntry
 * @param {Object} lastTimestamp
 */
function watchChanges(packageDirectoryEntry, lastTimestamp) {
  timestampForFilesInDirectory(packageDirectoryEntry).then((timestamp) => {
    if (!lastTimestamp || (lastTimestamp === timestamp)) {
      setTimeout(() => watchChanges(packageDirectoryEntry, timestamp), 1000);
    } else {
      reload();
    }
  });
}

// chrome.management.getSelf() Returns the extension details from manifest.json,
// including installType property if you are developing
chrome.management.getSelf((self) => {
  if (self.installType === 'development') {
    chrome.runtime.getPackageDirectoryEntry((packageDirectoryEntry) => {
      return watchChanges(packageDirectoryEntry);
    });
  }
});
