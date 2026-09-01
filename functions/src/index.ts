import { onCall, HttpsError } from "firebase-functions/v2/https";
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
  'mission-3': {
    requiredKeywords: ["step", "equation", "verif", "variable", "reasoning"],
    requiresRole: false,
    requiresDelimiters: false,
    requiresCoT: true,
    requiresOutputFormat: true,
    minCharLength: 140
  },
  'mission-4': {
    requiredKeywords: ["act as", "analogy", "forbidden", "tone", "paragraph"],
    requiresRole: true,
    requiresDelimiters: false,
    requiresOutputFormat: true,
    minCharLength: 130
  },
  'mission-5': {
    requiredKeywords: ["example", "input:", "output:", "category", "primary"],
    requiresRole: false,
    requiresDelimiters: true,
    requiresFewShot: true,
    requiresOutputFormat: true,
    minCharLength: 200
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
  if (!request.auth) throw new HttpsError('unauthenticated', 'Unauthorized');

  const { assessmentId, submissionId, payload } = request.data;
  
  if (!assessmentId || !submissionId || !payload || typeof payload !== 'string' || payload.length > 5000) {
    throw new HttpsError('invalid-argument', 'Invalid input');
  }

  const config = ASSESSMENT_CONFIG[assessmentId];
  if (!config) throw new HttpsError('invalid-argument', 'Unsupported assessment');

  const db = admin.firestore();
  
  // Deterministic Validator
  const score = validatePayload(payload, config);
  const status = score >= 80 ? 'PASS' : 'FAIL';

  // Atomic Transaction
  return await db.runTransaction(async (transaction) => {
    // Unique Idempotency Key: submissionId belongs to learnerId
    const attemptRef = db.collection('assessmentAttempts').doc(submissionId);
    const attemptDoc = await transaction.get(attemptRef);
    
    if (attemptDoc.exists) {
        const existingAttempt = attemptDoc.data();

        if (existingAttempt?.learnerId !== request.auth!.uid) {
            throw new HttpsError('permission-denied', 'Forbidden');
        }

        return existingAttempt;
    }

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
        throw new HttpsError('resource-exhausted', 'Maximum attempts reached.');
      }
    }

    if (userAttempts.size > 0) {
      const latestAttempt = userAttempts.docs[0].data();
      if (now.toMillis() - latestAttempt.submittedAt.toMillis() < 5 * 60 * 1000) {
        throw new HttpsError('resource-exhausted', 'Wait 5 minutes between attempts.');
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
      // Deterministic evidence ID: learnerId + assessmentId
      const evidenceId = `${request.auth.uid}_${assessmentId}`;
      const evidenceRef = db.collection('evidence').doc(evidenceId);
      transaction.set(evidenceRef, {
        evidenceId,
        assessmentAttemptId: submissionId,
        learnerId: request.auth.uid,
        assessmentId,
        score,
        status: 'PASS',
        createdAt: now,
      });

      // Deterministic credential ID
      const credId = `${request.auth.uid}_${assessmentId}`;
      const credRef = db.collection('credentials').doc(credId);
      
      const credDoc = await transaction.get(credRef);
      if (!credDoc.exists) {
        transaction.set(credRef, {
          credentialId: credId,
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
  
  if (config.requiredKeywords) {
    for (const keyword of config.requiredKeywords) {
      if (!payload.toLowerCase().includes(keyword.toLowerCase())) return 0;
    }
  }
  
  if (config.forbiddenKeywords) {
    for (const keyword of config.forbiddenKeywords) {
      if (payload.toLowerCase().includes(keyword.toLowerCase())) return 0;
    }
  }

  if (config.requiresRole && !payload.toLowerCase().includes("act as")) return 0;
  if (config.requiresDelimiters && !payload.includes("---") && !payload.includes("===") && !payload.includes("```")) return 0;
  if (config.requiresOutputFormat && !payload.toLowerCase().includes("json") && !payload.toLowerCase().includes("schema")) return 0;
  if (config.requiresCoT && !payload.toLowerCase().includes("step") && !payload.toLowerCase().includes("reasoning")) return 0;
  if (config.requiresFewShot && !payload.toLowerCase().includes("example") && !payload.toLowerCase().includes("input:")) return 0;
  
  return 100;
}
