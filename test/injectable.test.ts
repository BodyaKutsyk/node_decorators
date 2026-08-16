import 'reflect-metadata';
import { describe, it } from 'node:test'
import assert from "assert";
import { INJECTABLE, Injectable, InjectableMetadata, Scope } from "src/decorators/injectable";
import { Logger } from "./mocks/classes";

describe('Injectable', () => {
    it('emits metadata on Injectable()', () => {
        @Injectable()
        class Test {
            constructor(readonly logger: Logger) {}
        }

        const metadata = Reflect.getMetadata('design:paramtypes', Test);
        assert.strictEqual(metadata[0], Logger)
    })
    it('sets singleton scope value on Injectable({ scope: "singleton" })', () => {
        @Injectable()
        class Test {}
        const metadata: InjectableMetadata = Reflect.getMetadata(INJECTABLE, Test);
        assert.strictEqual(metadata.scope, Scope.singleton)
    })
    it('sets transient scope value on Injectable({ scope: "transient" })', () => {
        @Injectable({ scope: Scope.transient })
        class Test {}
        const metadata: InjectableMetadata = Reflect.getMetadata(INJECTABLE, Test);
        assert.strictEqual(metadata.scope, Scope.transient)
    })
})