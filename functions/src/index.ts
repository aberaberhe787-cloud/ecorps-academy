import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

export const submitAssessment = onCall(async (request) => {
  if (!request.auth) {
    throw new Error('Unauthorized');
  }

  const { assessmentId, assessmentVersion, pathId, submissionId, payload } = request.data;

  // 1. Validation
  if (!assessmentId || !assessmentVersion || !pathId || !submissionId || !payload) {
    throw new Error('Invalid input');
  }

  // 2. Idempotency Check
  const db = admin.firestore();
  const attemptRef = db.collection('assessmentAttempts').doc(submissionId);
  const attemptDoc = await attemptRef.get();
  if (attemptDoc.exists) {
    return attemptDoc.data();
  }

  // 3. Rate Limit & Retake Check (3 attempts / 24 hours, 5 min interval)
  const now = admin.firestore.Timestamp.now();
  const userAttempts = await db.collection('assessmentAttempts')
    .where('learnerId', '==', request.auth.uid)
    .where('assessmentId', '==', assessmentId)
    .orderBy('submittedAt', 'desc')
    .limit(3)
    .get();

  const oneDayAgo = admin.firestore.Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000);

  if (userAttempts.size >= 3) {
    const latestAttempt = userAttempts.docs[0].data();
    if (latestAttempt.submittedAt.toMillis() > oneDayAgo.toMillis()) {
      throw new Error('Maximum attempts reached. Try again later.');
    }
  }

  if (userAttempts.size > 0) {
    const latestAttempt = userAttempts.docs[0].data();
    if (now.toMillis() - latestAttempt.submittedAt.toMillis() < 5 * 60 * 1000) {
      throw new Error('Wait 5 minutes between attempts.');
    }
  }

  // 4. Deterministic Validation (Example)
  let score = 0;
  if (payload.includes("forbiddenPattern")) {
    score = 0;
  } else {
    score = 100;
  }

  const status = score >= 80 ? 'PASS' : 'FAIL';

  // 5. Create Assessment Attempt
  const attempt = {
    attemptId: submissionId,
    learnerId: request.auth.uid,
    assessmentId,
    assessmentVersion,
    pathId,
    submittedAt: now,
    score,
    status,
    validatorVersion: '1.0.0',
    submissionId,
  };
  await attemptRef.set(attempt);

  // 6. Create Evidence (if PASS)
  if (status === 'PASS') {
    const evidenceRef = db.collection('evidence').doc();
    await evidenceRef.set({
      evidenceId: evidenceRef.id,
      assessmentAttemptId: submissionId,
      learnerId: request.auth.uid,
      pathId,
      assessmentId,
      assessmentVersion,
      validatorVersion: '1.0.0',
      score,
      status: 'PASS',
      createdAt: now,
    });

    // 7. Issue Credential (Idempotent)
    const creds = await db.collection('credentials')
      .where('learnerId', '==', request.auth.uid)
      .where('pathId', '==', pathId)
      .where('verificationStatus', '==', 'VALID')
      .get();
      
    if (creds.empty) {
      const credRef = db.collection('credentials').doc();
      await credRef.set({
        credentialId: credRef.id,
        credentialName: 'Prompt Engineering Foundations Certified',
        pathName: 'Prompt Engineering Foundations',
        learnerName: request.auth.token.name || 'Learner',
        issueDate: now,
        verificationStatus: 'VALID',
        learnerId: request.auth.uid,
        pathId
      });
    }
  }

  return attempt;
});
