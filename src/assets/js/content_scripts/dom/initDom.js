import {
  submitEventListener,
  keyupEventListener,
  clickEventListener,
  hashChangeEventListener,
} from './eventListeners';
import {insertModalStructure} from './uiModal';

/**
 *
 */
export function initDOM() {
  insertModalStructure();
  submitEventListener();
  keyupEventListener();
  clickEventListener();
  hashChangeEventListener();
}
