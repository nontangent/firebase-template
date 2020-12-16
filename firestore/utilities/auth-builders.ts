import * as firebase from '@firebase/rules-unit-testing';

export function buildAdmin() {
    return firebase.initializeAdminApp({projectId: 'default'});
}

export function buildFirebase(auth: object) {
    return firebase.initializeTestApp({
        projectId: 'default', 
        auth: auth
    });
}

export function buildAuthForFirestore(auth: object) {
    return buildFirebase(auth).firestore();
}

export function buildUserAuthForFirestore(userId: string, twitterId: string) {
    return buildAuthForFirestore({
        uid: userId,
        twitterId: twitterId
    });
}

export function buildAdminFirestore() {
    return buildAdmin().firestore();
}