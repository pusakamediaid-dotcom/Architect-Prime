export class FirestoreService {
  constructor(private readonly db: FirebaseFirestore.Firestore) {}
  createDocument(collection: string, id: string, data: unknown) { return this.db.collection(collection).doc(id).set(data as object); }
  async getDocument(collection: string, id: string) { const doc = await this.db.collection(collection).doc(id).get(); return doc.exists ? doc.data() : null; }
  updateDocument(collection: string, id: string, data: unknown) { return this.db.collection(collection).doc(id).update(data as object); }
  deleteDocument(collection: string, id: string) { return this.db.collection(collection).doc(id).delete(); }
}
