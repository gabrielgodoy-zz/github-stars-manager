export const StoredGenericMngr = (() => {
  /**
   * Save access token to extension sync storage
   * @param {String} objectKey Key of the object to save
   * @param {Object} objectContent
   * @return {Promise}
   */
  function createOrUpdate(objectKey, objectContent) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({[objectKey]: objectContent}, () => {
        resolve();
      });
    });
  }

  /**
   * Check if the object is stored, if not, create an empty one
   * @param {String} objectKey
   */
  async function createObjectIfMissing(objectKey) {
    let response = await read(objectKey);
    if (response === undefined) {
      await createOrUpdate(objectKey, {});
    }
  }

  /**
   * @param {String} objectKey Object key to get object from storage
   * @return {Promise}
   */
  function read(objectKey) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(objectKey, (response) => {
        resolve(response[objectKey]);
      });
    });
  }

  /**
   * @param {String} storedObject Object key to delete
   * @param {Number|String} keyToDelete Object key to delete
   */
  async function deleteKey(storedObject, keyToDelete) {
    let objectResponse = await read(storedObject);
    delete objectResponse[keyToDelete];
    await createOrUpdate(storedObject, objectResponse);
  }

  return {createOrUpdate, createObjectIfMissing, read, deleteKey};
})();
