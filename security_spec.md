# Firestore Security Specification

This security specification establishes a mathematically secure Zero-Trust posture for the Let's Success 2.0 Firestore database. Since all database queries and mutations are securely proxied through our full-stack Express server utilizing `firebase-admin`, public client SDK access to Firestore is restricted to absolute zero.

## 1. Data Invariants

1. **Relational Integrity**: No user can exist without a unique ID and matching authentication pairing.
2. **Identity Isolation**: Password hashes mapped to user IDs are stored under private documents inaccessible via any public queries.
3. **Immutability of History**: All payment transaction logs and commission payouts cannot be edited or modified post-creation.
4. **Absolute Deny-By-Default**: Default rules block all client collections read and write access.

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads represent attempt-profiles to inject malicious states, bypass auth rails, or poison IDs:

1. **Identity Spoofing**: Attempt to update another user's balance.
2. **Shadow Field Injection**: Attempt to create a user document with administrative role flag defaults (`role: "admin"`).
3. **Negative Balance Adjustment**: Injecting negative payout amounts.
4. **Timestamp Forgery**: Forging a historical `createdAt` date to bypass system locks.
5. **ID Path Poisoning**: Forging multi-kilobyte strings inside document IDs.
6. **Denial of Wallet Recursion**: Multi-level complex path traversal.
7. **Notice Defacement**: Unauthorized notice creation.
8. **Withdrawal Fraud**: Self-approving a pending withdrawal.
9. **Course Content Deletion**: Unauthorized course pruning.
10. **Payment Price Tampering**: Forcing a package price of zero.
11. **PII Data Scraping**: Bulk listing of users email address lists.
12. **Settings Override**: Dismantling logo configurations or locking platform under maintenance modes.

## 3. Security Hardening Rule Strategy

All access is blocked from direct public client-side interfaces. Admin database access is secured backend-side via Express and JWT auth, running elevated on Cloud Run with full service-account IAM access.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Global Safety Net (Zero-Trust Catch-All)
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
