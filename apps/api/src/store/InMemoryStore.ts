/**
 * Zero-dependency in-memory store — mirrors the Mongoose model API.
 * Used when MONGODB_URI=demo so no MongoDB binary is needed.
 */
import { v4 as uuid } from 'uuid';
import type { Assignment, AssignmentStatus } from '@vedaai/shared';

type Doc = Assignment & { createdAt: string; updatedAt: string };

const store = new Map<string, Doc>();

function now() { return new Date().toISOString(); }
function lean(doc: Doc): Assignment { return JSON.parse(JSON.stringify(doc)); }

// Instance returned by create() — supports .updateOne() and ._id
class LiveDoc {
  private id: string;
  constructor(id: string) { this.id = id; }
  get _id()    { return this.id; }
  get status() { return store.get(this.id)?.status ?? 'pending'; }
  get input()  { return store.get(this.id)!.input; }
  async updateOne(update: Partial<Doc>): Promise<void> {
    const doc = store.get(this.id);
    if (doc) store.set(this.id, { ...doc, ...update, updatedAt: now() });
  }
}

export const AssignmentMemoryModel = {
  async create(data: { input: Doc['input']; status: AssignmentStatus }): Promise<LiveDoc> {
    const id = uuid();
    const n  = now();
    store.set(id, { _id: id, input: data.input, status: data.status, createdAt: n, updatedAt: n });
    return new LiveDoc(id);
  },

  find() {
    return {
      sort(_: unknown)   { return this; },
      select(_: unknown) { return this; },
      async lean(): Promise<Assignment[]> {
        return [...store.values()]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map(lean);
      },
    };
  },

  findById(id: string) {
    return {
      // supports: await AssignmentModel.findById(id).lean()
      async lean(): Promise<Assignment | null> {
        const doc = store.get(id);
        return doc ? lean(doc) : null;
      },
      // supports: const a = await AssignmentModel.findById(id)
      then(
        resolve: (v: LiveDoc | null) => unknown,
        reject:  (e: unknown)        => unknown
      ) {
        const doc = store.get(id);
        return Promise.resolve(doc ? new LiveDoc(id) : null).then(resolve, reject);
      },
    };
  },

  async findByIdAndUpdate(id: string, update: Partial<Doc>): Promise<void> {
    const doc = store.get(id);
    if (doc) store.set(id, { ...doc, ...update, updatedAt: now() });
  },

  async findByIdAndDelete(id: string): Promise<void> {
    store.delete(id);
  },
};
