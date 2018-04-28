import {StoredGenericMngr} from './StoredGenericMngr';

// Tag stored example  {t:{1:"browser",2:"framework"}}
// Repo stored example {r:{12546:[1,2]}}

/**
 * Initializes some storage functions
 */
export function initStorage() {
  StoredGenericMngr.createObjectIfMissing('r');
  StoredGenericMngr.createObjectIfMissing('t');
}

/**
 * Retrieves User access token, if dont exist
 * call checkCodeParamAndSaveToken
 * Gets token stored in storage.sync
 * @return {String|Promise}
 */
export async function getAccessTokenFromStorage() {
  let response;
  try {
    response = await StoredGenericMngr.read('token');
  } catch (error) {
    throw Error();
  }
  if (response) {
    return response;
  }
}
