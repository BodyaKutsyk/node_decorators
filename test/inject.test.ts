import 'reflect-metadata';
import { describe, it } from 'node:test'
import assert from "assert";
import { Inject, PARAM_METADATA_KEY } from "src/decorators/inject";

describe('Inject', () => {
    it('creates token metadata on Inject(token: symbol)', () => {
        const token = Symbol('test');
        class Test {
            constructor(@Inject(token) tester: unknown) {
            }
        }
        const metadata = Reflect.getMetadata(PARAM_METADATA_KEY, Test);
        assert.strictEqual(metadata.get(0), token)
    })
    it('creates token metadata on Inject(token: string)', () => {
        const token = 'test';
        class Test {
            constructor(@Inject(token) tester: unknown) {
            }
        }
        const metadata = Reflect.getMetadata(PARAM_METADATA_KEY, Test);
        assert.strictEqual(metadata.get(0), token)
    })
    it('writes correct indexes for tokens', () => {
        const token1 = 'test1';
        const token2 = 'test2';
        class Test {
            constructor(@Inject(token1) tester1: unknown, @Inject(token2) tester2: unknown) {
            }
        }
        const metadata = Reflect.getMetadata(PARAM_METADATA_KEY, Test);
        assert.strictEqual(metadata.get(0), token1)
        assert.strictEqual(metadata.get(1), token2)
    })
})