import * as fs from "fs";
import { join } from 'path';
import * as firebase from '@firebase/rules-unit-testing';
import * as admin from 'firebase-admin';
export { firebase, admin };

export async function resetDB() {
    await firebase.clearFirestoreData({projectId: 'default'});
    await Promise.all(firebase.apps().map(app => app.delete()));
}

export async function loadFirestoreRules() {
    const rules = fs.readFileSync(join(__dirname, '../', './firestore.rules'), "utf8");
    return await firebase.loadFirestoreRules({projectId: 'default', rules: rules});
}

export * from './auth-builders';