import { beforeEach } from 'mocha';
import { expect } from 'chai';
import * as utils from '../utilities';
import firebase = utils.firebase;
import admin = utils.admin;
import * as models from '@nenga/models'
import { M } from '@nontangent/firebase-model-utilities';

describe('nenga/{nengaId}の読み取り', async () => {
    beforeEach(async () => {
        await utils.resetDB();
        await utils.loadFirestoreRules();

        const db = utils.buildAdminFirestore();
        const fields = [
            'senderId', 'receiverId', 'transform', 'message',
            'bgImgFullPath', 'createdAt', 'updatedAt'
        ];
        await db.doc(`nengas/${models.testNenga.id}`).set(new M({
            ...models.testNenga,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }).filterProps(fields).data());
    });

    afterEach(async () => {
        await utils.resetDB();
    });

    it ('送信者が年賀状を取得する => 成功', async () => {
        const db = utils.buildUserAuthForFirestore(models.testNenga.id, models.testNenga.senderId);
        await db.doc(`nengas/${models.testNenga.id}`).get();
    });

    it ('受信者が年賀状を取得する => 成功', async () => {
        const db = utils.buildUserAuthForFirestore(models.testNenga.id, models.testNenga.receiverId);
        await db.doc(`nengas/${models.testNenga.id}`).get();
    });

    it ('送信者でも受信者でもないユーザーが年賀状を取得する => 失敗', async () => {
        const db = utils.buildUserAuthForFirestore(models.testNenga.id, 'test-user-0002');
        try {
            await db.doc(`nengas/${models.testNenga.id}`).get();
        } catch (error) {
            expect(error.code == 'permission-denied');
        }
    });
});