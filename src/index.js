import { PropTypes } from 'prop-types';

function hasPropTypes(obj) {
    return typeof obj.propTypes === 'object';
}

function hasDefaultProps(obj) {
    return typeof obj.defaultProps === 'object';
}

export function getPropTypesMixin(userOpts) {
    const opts = userOpts || {};

    let useValidation;

    if (Object.prototype.hasOwnProperty.call(opts, 'validate')) {
        useValidation = opts.validate;
    } else if (process) {
        useValidation = process.env.NODE_ENV !== 'production';
    } else {
        useValidation = true;
    }

    const useDefaults = Object.prototype.hasOwnProperty.call(opts, 'useDefaults')
        ? opts.useDefaults
        : true;

    return superclass => class extends superclass {
        static create(...args) {
            const [props, ...rest] = args;


            const defaults = useDefaults && hasDefaultProps(this)
                ? this.defaultProps
                : {};

            const propsWithDefaults = Object.assign({}, defaults, props);

            if (useValidation && hasPropTypes(this)) {
                PropTypes.checkPropTypes(this.propTypes, propsWithDefaults, 'prop',
                                         `${this.modelName}.create`);
            }

            return super.create(propsWithDefaults, ...rest);
        }

        update(...args) {
            const modelClass = this.getClass();
            if (useValidation && hasPropTypes(modelClass)) {
                const props = args[0];

                const {
                    propTypes,
                    modelName,
                } = modelClass;

                // Run validators for only the props passed in, not
                // all declared PropTypes.
                const propTypesToValidate = Object.keys(props).reduce((result, key) => {
                    if (Object.prototype.hasOwnProperty.call(propTypes, key)) {
                        return { ...result, [key]: propTypes[key] };
                    }
                    return result;
                }, {});
                PropTypes.checkPropTypes(propTypesToValidate, props, 'prop',
                                         `${modelName}.update`);
            }

            return super.update(...args);
        }
    };
}

export default getPropTypesMixin();
