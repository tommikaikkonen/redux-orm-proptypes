import { PropTypes } from 'prop-types';

import propTypesMixin, { getPropTypesMixin } from './index';

describe('PropTypesMixin', () => {
    let Model;
    let ModelWithMixin;
    let modelInstance;
    let createSpy;
    let updateSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        Model = class {
            static create() {}
            update() {} // eslint-disable-line class-methods-use-this
            getClass() {
                return this.constructor;
            }
        };


        createSpy = jest.spyOn(Model, 'create');

        ModelWithMixin = propTypesMixin(Model);
        ModelWithMixin.modelName = 'ModelWithMixin';

        modelInstance = new ModelWithMixin();
        updateSpy = jest.spyOn(modelInstance, 'update');
        consoleErrorSpy = jest.spyOn(global.console, 'error');
        consoleErrorSpy.mockReset();
    });

    it('getPropTypesMixin works correctly', () => {
        const mixin = getPropTypesMixin();
        expect(mixin).toBeInstanceOf(Function);

        const result = mixin(Model);
        expect(result).toBeInstanceOf(Function);
        expect(Object.getPrototypeOf(result)).toEqual(Model);
    });

    it('mixin correctly returns a class', () => {
        expect(ModelWithMixin).toBeInstanceOf(Function);
        expect(Object.getPrototypeOf(ModelWithMixin)).toEqual(Model);
    });

    it('correctly delegates to superclass create', () => {
        const arg = {};
        ModelWithMixin.create(arg);

        expect(createSpy.mock.calls.length).toBe(1);
        expect(createSpy).toBeCalledWith(arg);
    });

    it('correctly delegates to superclass update', () => {
        const arg = {};
        modelInstance.update(arg);

        expect(updateSpy.mock.calls.length).toBe(1);
        expect(updateSpy).toBeCalledWith(arg);
    });

    it('raises validation error on create correctly', () => {
        ModelWithMixin.propTypes = {
            name: PropTypes.string.isRequired,
        };

        ModelWithMixin.create({ name: 'shouldnt raise error' });
        expect(consoleErrorSpy.mock.calls.length).toBe(0);

        ModelWithMixin.create({ notName: 'asd' });
        expect(consoleErrorSpy.mock.calls.length).toBe(1);
        expect(consoleErrorSpy).toBeCalledWith('Warning: Failed prop type: The prop `name` is marked as required in `ModelWithMixin.create`, but its value is `undefined`.');
    });

    it('raises validation error on update correctly', () => {
        ModelWithMixin.propTypes = {
            name: PropTypes.string.isRequired,
            age: PropTypes.number.isRequired,
        };
        expect(consoleErrorSpy.mock.calls.length).toBe(0);
        const instance = new ModelWithMixin({ name: 'asd', age: 123 });
        expect(consoleErrorSpy.mock.calls.length).toBe(0);

        instance.update({ name: 123 });

        expect(consoleErrorSpy.mock.calls.length).toBe(1);
        expect(consoleErrorSpy).toBeCalledWith('Warning: Failed prop type: Invalid prop `name` of type `number` supplied to `ModelWithMixin.update`, expected `string`.');
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
        expect(createSpy.mock.calls.length).toBe(1);
        expect(createSpy).toBeCalledWith(expect.objectContaining({ name: 'Tommi', isFetching: false }));
    });
});
