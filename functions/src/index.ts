import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

// Authoritative Assessment Definition Map
const ASSESSMENT_CONFIG: Record<string, any> = {
  'mission-1': {
    requiredKeywords: ["act as", "bullet", "words", "structure", "hook"],
    forbiddenKeywords: [],
    requiresRole: true,
    requiresDelimiters: false,
    requiresOutputFormat: true,
    minCharLength: 120
  },
  'mission-2': {
    requiredKeywords: ["json", "schema", "null", "sentiment", "raw"],
    forbiddenKeywords: [],
    requiresRole: true,
    requiresDelimiters: true,
    requiresOutputFormat: true,
    minCharLength: 150
  },
  'prompt-foundations-final': {
    requiredKeywords: ["step", "reasoning"],
    forbiddenKeywords: ["forbiddenPattern"],
    requiresRole: false,
    requiresDelimiters: true,
    requiresOutputFormat: true,
    minCharLength: 50
  }
};

export const submitAssessment = onCall(async (request) => {
  if (!request.auth) throw new Error('Unauthorized');

  const { assessmentId, submissionId, payload } = request.data;
  
  if (!assessmentId || !submissionId || !payload || typeof payload !== 'string') {
    throw new Error('Invalid input');
  }

  const config = ASSESSMENT_CONFIG[assessmentId];
  if (!config) throw new Error('Unsupported assessment');

  const db = admin.firestore();
  
  // Deterministic Validator
  const score = validatePayload(payload, config);
  const status = score >= 80 ? 'PASS' : 'FAIL';

  // Atomic Transaction
  return await db.runTransaction(async (transaction) => {
    const attemptRef = db.collection('assessmentAttempts').doc(submissionId);
    const attemptDoc = await transaction.get(attemptRef);
    
    if (attemptDoc.exists) return attemptDoc.data();

    const now = admin.firestore.Timestamp.now();
    const userAttemptsQuery = db.collection('assessmentAttempts')
      .where('learnerId', '==', request.auth.uid)
      .where('assessmentId', '==', assessmentId)
      .orderBy('submittedAt', 'desc')
      .limit(3);
    
    const userAttempts = await transaction.get(userAttemptsQuery);

    const oneDayAgo = admin.firestore.Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000);
    
    if (userAttempts.size >= 3) {
      const latestAttempt = userAttempts.docs[0].data();
      if (latestAttempt.submittedAt.toMillis() > oneDayAgo.toMillis()) {
        throw new Error('Maximum attempts reached.');
      }
    }

    if (userAttempts.size > 0) {
      const latestAttempt = userAttempts.docs[0].data();
      if (now.toMillis() - latestAttempt.submittedAt.toMillis() < 5 * 60 * 1000) {
        throw new Error('Wait 5 minutes between attempts.');
      }
    }

    const attempt = {
      attemptId: submissionId,
      learnerId: request.auth.uid,
      assessmentId,
      submittedAt: now,
      score,
      status,
      validatorVersion: '1.0.0',
    };

    transaction.set(attemptRef, attempt);

    if (status === 'PASS') {
      const evidenceRef = db.collection('evidence').doc();
      transaction.set(evidenceRef, {
        evidenceId: evidenceRef.id,
        assessmentAttemptId: submissionId,
        learnerId: request.auth.uid,
        assessmentId,
        score,
        status: 'PASS',
        createdAt: now,
      });

      const credsQuery = db.collection('credentials')
        .where('learnerId', '==', request.auth.uid)
        .where('assessmentId', '==', assessmentId)
        .where('verificationStatus', '==', 'VALID');
      
      const creds = await transaction.get(credsQuery);
        
      if (creds.empty) {
        const credRef = db.collection('credentials').doc();
        transaction.set(credRef, {
          credentialId: credRef.id,
          credentialName: 'Certified',
          pathName: assessmentId,
          learnerName: request.auth.token.name || 'Learner',
          issueDate: now,
          verificationStatus: 'VALID',
          assessmentId
        });
      }
    }

    return attempt;
  });
});

function validatePayload(payload: string, config: any): number {
  if (payload.length < config.minCharLength) return 0;
  
  for (const keyword of config.requiredKeywords) {
    if (!payload.toLowerCase().includes(keyword.toLowerCase())) return 0;
  }
  
  for (const keyword of config.forbiddenKeywords) {
    if (payload.toLowerCase().includes(keyword.toLowerCase())) return 0;
  }

  if (config.requiresRole && !payload.toLowerCase().includes("act as")) return 0;
  
  return 100;
}
