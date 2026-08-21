import {Injectable} from "src/decorators/injectable";

@Injectable()
export class Database<T> {
    private records: Map<string, Partial<T>> = new Map();

    private createId() {
        return String(this.records.size + 1);
    }

    private check(id: string) {
        return this.records.has(id);
    }

    get(id: string) {
        if (this.check(id)) {
            return { id, ...this.records.get(id) };
        }
    }

    getAll() {
        return Array.from(this.records, ([id, value]) => ({
            id,
            ...value
        }));
    }

    add(data: Partial<T>) {
        this.records.set(this.createId(), data)
    }
}