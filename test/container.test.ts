import 'reflect-metadata'
import assert from "assert";
import { beforeEach, describe, it } from 'node:test'
import { Container } from 'src/container';
import { Injectable } from "src/decorators/injectable";
import {
    TestClass,
    InjectableTransientClass,
    InjectableClass as A,
    InjectableClass,
    UserRepository, Database, Logger, UserService
} from './mocks/classes'
import { TYPES } from "src/tokens";

describe('DI Container', () => {
    let container: Container;
    beforeEach(() => {
        container = new Container();
    })
    it('throws circular dependency error', () => {
        @Injectable() class A { constructor(b: any) {} }
        @Injectable() class B { constructor(a: A) {} }
        Reflect.defineMetadata('design:paramtypes', [B], A);

        assert.throws(() => container.resolve(A), { message: 'Circular dependency' })
    })

    it ('doesnt throw circular dependency error on the same class name', () => {
        @Injectable() class InjectableTestClass { constructor(b: any) {} }
        @Injectable() class B { constructor(a: A) {} }
        Reflect.defineMetadata('design:paramtypes', [B], InjectableTestClass);

        assert.doesNotThrow(() => container.resolve(InjectableTestClass), { message: 'Circular dependency' })
    })
    it ('throws not injectable error on class without Injectable decorator', () => {
        assert.throws(() => container.resolve(TestClass), { message: `${TestClass.name} is not Injectable()` })
    })
    it('returns the same instance on Injectable({ scope: "singleton" })', () => {
        const firstClass = container.resolve(InjectableClass);
        const secondClass = container.resolve(InjectableClass);
        assert.strictEqual(firstClass, secondClass);
    })
    it('creates new instance on Injectable({ scope: "transient" })', () => {
        const firstClass = container.resolve(InjectableTransientClass);
        const secondClass = container.resolve(InjectableTransientClass);
        assert.notStrictEqual(firstClass, secondClass);
    })
    it('successfully resolves nested dependencies', () => {
        container.bind(TYPES.userRepository, UserRepository);
        container.bind(TYPES.database, Database);
        container.bind(TYPES.logger, Logger);
        const userService = container.resolve(UserService);

        assert.strictEqual(userService.repository.database.logger.log('test'), 'test')
    })
    it('throws "no binding found" on no token binding', () => {
        assert.throws(() => container.resolve(UserService), { message: `No binding found for token: ${TYPES.userRepository.toString()}` })
    })
})
