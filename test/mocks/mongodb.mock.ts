import { ObjectId } from 'mongodb';


export function createMockDb(): any {
  const mockCollections = new Map<string, any>();

  return {
    collection: jest.fn((name: string) => {
      if (!mockCollections.has(name)) {
        mockCollections.set(name, createMockCollection());
      }
      return mockCollections.get(name);
    }),
    admin: jest.fn(() => ({
      ping: jest.fn().mockResolvedValue({ ok: 1 })
    }))
  };
}

export function createMockCollection(): any {
  const data: any[] = [];

  return {
    find: jest.fn(() => ({
      toArray: jest.fn().mockResolvedValue(data)
    })),
    findOne: jest.fn().mockResolvedValue(null),
    insertOne: jest.fn((doc: any) => {
      const id = new ObjectId();
      data.push({ ...doc, _id: id });
      return Promise.resolve({ insertedId: id, acknowledged: true });
    }),
    findOneAndUpdate: jest.fn().mockResolvedValue(null),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 0 })
  };
}
