import * as admin from 'firebase-admin';
import firebaseFunctionsTest from 'firebase-functions-test';
import { expect } from 'chai';
import * as index from '../src/index';

const testEnv = firebaseFunctionsTest();

const inMemoryStore = new Map<string, any>();

const mockFirestore: any = {
  collection: (collectionName: string) => ({
    doc: (docId: string) => ({
      path: `${collectionName}/${docId}`,
    }),
    where: () => ({
      where: () => ({
        orderBy: () => ({
          limit: () => ({
            _isQuery: true,
          }),
        }),
      }),
    }),
  }),
  runTransaction: async (cb: (transaction: any) => Promise<any>) => {
    const transaction = {
      get: async (ref: any) => {
        if (ref._isQuery) {
          return {
            size: 0,
            docs: [],
          };
        }
        const data = inMemoryStore.get(ref.path);
        return {
          exists: data !== undefined,
          data: () => data,
        };
      },
      set: (ref: any, data: any) => {
        inMemoryStore.set(ref.path, data);
      },
    };
    return await cb(transaction);
  },
};

const mockTimestamp = {
  now: () => ({
    toMillis: () => Date.now(),
  }),
  fromMillis: (ms: number) => ({
    toMillis: () => ms,
  }),
};

const firestoreFn: any = () => mockFirestore;
firestoreFn.Timestamp = mockTimestamp;

Object.defineProperty(admin, 'firestore', {
  value: firestoreFn,
  configurable: true,
  writable: true,
});

describe('Security Tests', () => {
  after(() => {
    testEnv.cleanup();
  });

  it('unauthenticated submission should be rejected', async () => {
    const wrapped = testEnv.wrap(index.submitAssessment as any);
    try {
      await wrapped({ assessmentId: 'mission-1', submissionId: 'sub1', payload: 'test' } as any);
      throw new Error('Should have thrown');
    } catch (e: any) {
      expect(e.code).to.equal('unauthenticated');
    }
  });

  it('cross-user submission ID reuse should be forbidden', async () => {
    const wrapped = testEnv.wrap(index.submitAssessment as any);
    const authA = { uid: 'userA' };
    const authB = { uid: 'userB' };

    // User A submits
    await wrapped({ assessmentId: 'mission-1', submissionId: 'sharedId', payload: 'act as a helper with bullet points and hook structure words' } as any, { auth: authA } as any);

    // User B submits with same ID
    try {
      await wrapped({ assessmentId: 'mission-1', submissionId: 'sharedId', payload: 'some other content...' } as any, { auth: authB } as any);
      throw new Error('Should have thrown');
    } catch (e: any) {
      expect(e.code).to.equal('permission-denied');
    }
  });
});
