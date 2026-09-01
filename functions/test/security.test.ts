import * as admin from 'firebase-admin';
import * as test from 'firebase-functions-test';
import { expect } from 'chai';
import * as index from '../src/index';

const testEnv = test();

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
    await wrapped({ assessmentId: 'mission-1', submissionId: 'sharedId', payload: 'act as a helper...' } as any, { auth: authA } as any);

    // User B submits with same ID
    try {
      await wrapped({ assessmentId: 'mission-1', submissionId: 'sharedId', payload: 'some other content...' } as any, { auth: authB } as any);
      throw new Error('Should have thrown');
    } catch (e: any) {
      expect(e.code).to.equal('permission-denied');
    }
  });
});
