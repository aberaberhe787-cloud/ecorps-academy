"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
const firebase_functions_test_1 = __importDefault(require("firebase-functions-test"));
const chai_1 = require("chai");
const index = __importStar(require("../src/index"));
const testEnv = (0, firebase_functions_test_1.default)();
const inMemoryStore = new Map();
const mockFirestore = {
    collection: (collectionName) => ({
        doc: (docId) => ({
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
    runTransaction: async (cb) => {
        const transaction = {
            get: async (ref) => {
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
            set: (ref, data) => {
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
    fromMillis: (ms) => ({
        toMillis: () => ms,
    }),
};
const firestoreFn = () => mockFirestore;
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
        const wrapped = testEnv.wrap(index.submitAssessment);
        try {
            await wrapped({ assessmentId: 'mission-1', submissionId: 'sub1', payload: 'test' });
            throw new Error('Should have thrown');
        }
        catch (e) {
            (0, chai_1.expect)(e.code).to.equal('unauthenticated');
        }
    });
    it('cross-user submission ID reuse should be forbidden', async () => {
        const wrapped = testEnv.wrap(index.submitAssessment);
        const authA = { uid: 'userA' };
        const authB = { uid: 'userB' };
        // User A submits
        await wrapped({ assessmentId: 'mission-1', submissionId: 'sharedId', payload: 'act as a helper with bullet points and hook structure words' }, { auth: authA });
        // User B submits with same ID
        try {
            await wrapped({ assessmentId: 'mission-1', submissionId: 'sharedId', payload: 'some other content...' }, { auth: authB });
            throw new Error('Should have thrown');
        }
        catch (e) {
            (0, chai_1.expect)(e.code).to.equal('permission-denied');
        }
    });
});
//# sourceMappingURL=security.test.js.map