import { beforeEach } from 'mocha';
import { expect } from 'chai';
import * as utils from '../utilities';
import firebase = utils.firebase;
import admin = utils.admin;
import * as models from '@nenga/models'
import { M } from '@nontangent/firebase-model-utilities';

describe('users/{userId}の読み取りテスト', () => {
    beforeEach(async () => {
        await utils.resetDB();
        await utils.loadFirestoreRules();

        const db = utils.buildAdminFirestore();
        const fields = ['twitter', 'createdAt', 'updatedAt'];
        await db.doc(`users/${models.testUser.id}`).set(new M({
            ...models.testUser,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }).filterProps(fields).data());
    });

    afterEach(async () => {
        await utils.resetDB();
    });

    it('ユーザーが自分の情報を読み取る => 成功', async () => {
        const db = utils.buildUserAuthForFirestore(models.testUser.id, '');
        await db.doc(`users/${models.testUser.id}`).get();
    });

    it('ユーザーが他者の情報を読み取る => 失敗', async () => {
        const db = utils.buildUserAuthForFirestore('test-user-0001', '');
        try {
            await db.doc(`users/${models.testUser.id}`).get();
            throw new Error();
        } catch (error) {
            expect(error.code == 'permission-denied');
        }
    });
});

describe('users/{userId}の作成テスト', () => {
    beforeEach(async () => {
        await utils.resetDB();
        await utils.loadFirestoreRules();
    });
    
    afterEach(async () => {
        await utils.resetDB();
    });

    it('ユーザー登録 => 成功', async () => {
        const db = utils.buildUserAuthForFirestore(models.testUser.id, '');
        const fields = ['twitter', 'createdAt', 'updatedAt'];
        await db.doc(`users/${models.testUser.id}`).set(new M({
            ...models.testUser,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).filterProps(fields).data());
    });

    it('ユーザー登録を行うがTwitterのsecretとtokenがnullの場合 => 失敗', async () => {
        const db = utils.buildUserAuthForFirestore(models.testUser.id, '');
        const fields = ['twitter', 'createdAt', 'updatedAt'];
        try {
            await db.doc(`users/${models.testUser.id}`).set(new M({
                ...models.testUser,
                twitter: {
                    ...models.testTwitter,
                    token: null,
                    secret: null
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).filterProps(fields).data());
            throw new Error();
        } catch (error) {
            expect(error.code, 'permission-denied');
        }
    });

    it('ユーザーが別のユーザーのデータを作成する場合 => 失敗', async () => {
        const db = utils.buildUserAuthForFirestore(models.testUser.id, '');
        const fields = ['twitter', 'createdAt', 'updatedAt'];
        const otherUserId = 'test-user-0001';
        try {
            await db.doc(`users/${otherUserId}`).set(new M({
                ...models.testUser,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).filterProps(fields).data());
            throw new Error();
        } catch (error) {
            expect(error.code, 'permission-denied');
        } 
    });

});

describe('users/{userId}の更新テスト', () => {
    beforeEach(async () => {
        await utils.resetDB();
        await utils.loadFirestoreRules();

        const db = utils.buildAdminFirestore();
        const fields = ['twitter', 'createdAt', 'updatedAt'];
        await db.doc(`users/${models.testUser.id}`).set(new M({
            ...models.testUser,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }).filterProps(fields).data());
    });

    afterEach(async () => {
        await utils.resetDB();
    });

    it('ユーザーが自分の情報を更新する => 成功', async () => {
        const db = utils.buildUserAuthForFirestore(models.testUser.id, '');
        const fields = ['twitter', 'createdAt', 'updatedAt'];
        const doc = await db.doc(`users/${models.testUser.id}`).get();
        await db.doc(`users/${models.testUser.id}`).update(new M({
            ...doc.data(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).filterProps(fields).data());
    });

    it('ユーザーが他者の情報を更新する => 失敗', async () => {
        const db1 = utils.buildUserAuthForFirestore(models.testUser.id, '');
        const db2 = utils.buildUserAuthForFirestore('test-user-0001', '');
        const fields = ['twitter', 'createdAt', 'updatedAt'];
        const doc = await db1.doc(`users/${models.testUser.id}`).get();
        try {
            await db2.doc(`users/${models.testUser.id}`).update(new M({
                ...doc.data(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).filterProps(fields).data());
            throw new Error();
        } catch (error) {
            expect(error.code == 'permission-denied');
        }
    });
});

describe('users/{userId}の削除テスト', () => {
    beforeEach(async () => {
        await utils.resetDB();
        await utils.loadFirestoreRules();

        const db = utils.buildAdminFirestore();
        await db.doc(`users/${models.testUser.id}`).set(new M({
            ...models.testUser
        }).data());
    });

    afterEach(async () => {
        await utils.resetDB();
    });

    it('ユーザーが自分の情報を削除する => 失敗', async () => {
        const db = utils.buildUserAuthForFirestore(models.testUser.id, '');
        try {
            await db.doc(`users/${models.testUser.id}`).delete();
            throw new Error();
        } catch (error) {
            expect(error.code, 'permission-denied');
        }
    });

    it('ユーザーが他者の情報を削除する => 失敗', async () => {
        const db = utils.buildUserAuthForFirestore('test-user-0001', '');
        try {
            await db.doc(`users/${models.testUser.id}`).delete();
            throw new Error();
        } catch (error) {
            expect(error.code == 'permission-denied');
        }
    });
});