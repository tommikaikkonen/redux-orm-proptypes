/* eslint-disable import/no-extraneous-dependencies */
import { PropTypes } from 'react';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import propTypesMixin, { getPropTypesMixin } from '../index';

chai.use(sinonChai);
const { expect } = chai;

describe('PropTypesMixin', () => {
    let Model;
    let ModelWithMixin;
    let modelInstance;
    let createSpy;
    let updateSpy;

    beforeEach(() => {
        Model = class {
            static create() {}
            update() {} // eslint-disable-line class-methods-use-this
            getClass() {
                return this.constructor;
            }
        };


        createSpy = sinon.spy(Model, 'create');

        ModelWithMixin = propTypesMixin(Model);
        ModelWithMixin.modelName = 'ModelWithMixin';

        modelInstance = new ModelWithMixin();
        updateSpy = sinon.spy(modelInstance, 'update');
    });

    it('getPropTypesMixin works correctly', () => {
        const mixin = getPropTypesMixin();
        expect(mixin).to.be.a('function');

        const result = mixin(Model);
        expect(result).to.be.a('function');
        expect(Object.getPrototypeOf(result)).to.equal(Model);
    });

    it('mixin correctly returns a class', () => {
        expect(ModelWithMixin).to.be.a('function');
        expect(Object.getPrototypeOf(ModelWithMixin)).to.equal(Model);
    });

    it('correctly delegates to superclass create', () => {
        const arg = {};
        ModelWithMixin.create(arg);

        expect(createSpy).to.be.calledOnce;
        expect(createSpy).to.be.calledWithExactly(arg);
    });

    it('correctly delegates to superclass update', () => {
        const arg = {};
        modelInstance.update(arg);

        expect(updateSpy).to.be.calledOnce;
        expect(updateSpy).to.be.calledWithExactly(arg);
    });

    it('raises validation error on create correctly', () => {
        ModelWithMixin.propTypes = {
            name: PropTypes.string.isRequired,
        };

        ModelWithMixin.create({ name: 'shouldnt raise error' });

        const funcShouldThrow = () => ModelWithMixin.create({ notName: 'asd' });

        expect(funcShouldThrow).to.throw('ModelWithMixin', 'name');
    });

    it('raises validation error on update correctly', () => {
        ModelWithMixin.propTypes = {
            name: PropTypes.string.isRequired,
            age: PropTypes.number.isRequired,
        };

        const instance = new ModelWithMixin();

        const funcShouldThrow = () => instance.update({ name: 123 });

        expect(funcShouldThrow).to.throw('ModelWithMixin', 'name');
    });

    it('correctly uses defaultProps', () => {
        ModelWithMixin.propTypes = {
            name: PropTypes.string.isRequired,
            age: PropTypes.number.isRequired,
            isFetching: PropTypes.bool.isRequired,
        };
        ModelWithMixin.defaultProps = {
            isFetching: false,
        };

        const createArg = { name: 'Tommi', age: 25 };

        ModelWithMixin.create(createArg);
        expect(createSpy).to.have.been.calledOnce;
        expect(createSpy).to.have.been.calledWithMatch({ name: 'Tommi', isFetching: false });
    });
});
