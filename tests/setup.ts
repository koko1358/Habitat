// Polyfills IndexedDB in the Node test environment so Dexie-backed
// service functions can be tested without a real browser.
import "fake-indexeddb/auto";
