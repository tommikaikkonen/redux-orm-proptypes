redux-orm-proptypes
===============

Provides type checking using React PropTypes and declaring default properties with defaultProps in [Redux-ORM](https://github.com/tommikaikkonen/redux-orm). 

## Installation

```bash
npm install redux-orm-proptypes --save
```

## Usage

Import.

```javascript
import { PropTypes } from 'React';
import { Model } from 'redux-orm';
import propTypesMixin from 'redux-orm-proptypes';
```

Use the mixin function which returns a class with PropTypes and defaultProps logic added.

```javascript
const ValidatingModel = propTypesMixin(Model);
```

Define your concrete model, and add `propTypes` and `defaultProps` static class attributes.

```javascript
class Person extends ValidatingModel {}
Person.propTypes = {
    name: PropTypes.string.isRequired,
    age: PropTypes.number.isRequired,
    isFetching: PropTypes.bool.isRequired,
};

Person.defaultProps = {
    isFetching: false,
};

Person.modelName = 'Person';
```

The mixin adds a layer of logic on top of the Model static method `create` and the instance method `update`. When calling `create`, if you have defined `defaultProps`, it'll merge the defaults with the props you passed in. Then, if you've defined `Model.propTypes`, it'll validate the props. The final props (that may have been merged with defaults) will be passed to the `create` method on the superclass you passed the mixin function.

When you call the `modelInstance.update(attrObj)` instance method, the keys in `attrObj` will be checked against the corresponding `propTypes`, if they exist.

An example of the usage inside a reducer (or a session):

```javascript
Person.create({name: 'Tommi', age: `I don't know!`});
// Error: Invalid prop `age` of type `string` supplied to `Person.create`, expected `number`.

const instance = Person.create({ name: 'Tommi', age: 25 });
console.log(instance.isFetching);
// false

instance.update({ age: `I don't know!` });
// Error: Invalid prop `age` of type `string` supplied to `Person.update`, expected `number`.
```

## Options

You can explicitly toggle either of the features by importing the mixin factory function `getPropTypesMixin` and creating your own version of the mixin by passing an options object.

```javascript
import { Model } from 'redux-orm';
import { getPropTypesMixin } from 'redux-orm-proptypes';

const myPropTypesMixin = getPropTypesMixin({ validate: false, useDefaults: true});
const ValidatingModel = myPropTypesMixin(Model);
```

## License

MIT. See `LICENSE`