# @dpaskhin/unique

**@dpaskhin/unique** is a TypeScript library that ensures the uniqueness of generated values. It wraps any function to
reject duplicate values and generate new ones until a unique result is produced. Useful for cases where you need unique
random values or want to prevent repeated results.

## Installation

To install **@dpaskhin/unique**, run:

```shell
npm install --save-dev @dpaskhin/unique
```

## Features

- Generate unique values based on the output of any function.
- Supports `custom` stores or `global` storage for uniqueness tracking.
- Configurable `retry` and `timeout` options.
- `stringifier` support for custom handling of complex objects during uniqueness checks.
- [~600B gzipped.](https://bundlephobia.com/package/@dpaskhin/unique)

## Usage

#### Basic Example

Here’s a quick example using **@dpaskhin/unique**:

```ts
import { unique } from '@dpaskhin/unique';

// Outputs a unique random number each time
console.log(unique(Math.random));
console.log(unique(Math.random));
console.log(unique(Math.random));
```

#### Example with Faker.js

**@dpaskhin/unique** works well with libraries like [Faker.js](https://github.com/faker-js/faker) for generating unique
random data.

```ts
import { unique, uniqueFactory } from '@dpaskhin/unique';
import { faker } from '@faker-js/faker';

// Outputs a unique first name
console.log(unique(faker.person.firstName));
console.log(unique(faker.person.firstName));
console.log(unique(faker.person.firstName));

// ----------------------------------------

const createUniqueUser = uniqueFactory(() => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  age: faker.number.int({ min: 18, max: 100 }),
}));

// Each output user is structurally unique
console.log(createUniqueUser());
console.log(createUniqueUser());
console.log(createUniqueUser());
```

#### Custom Store

You can provide your own store to isolate uniqueness checks. This ensures that uniqueness is tracked within the scope of
your application.

```ts
import { unique } from '@dpaskhin/unique';

const scopedStore = new Set();

// Outputs a unique random number
console.log(unique(Math.random, [], { store: scopedStore }));
```

#### Global Store

If you don’t provide a custom store, the library will use the **GLOBAL_STORE** by default. This can be useful if you
want to track unique values across different parts of your application.

```ts
import { unique, GLOBAL_STORE } from '@dpaskhin/unique';

// Use the global store for uniqueness checks
const uniqueRandomValue1 = unique(Math.random);
const uniqueRandomValue2 = unique(Math.random);

// Outputs two unique random values
console.log(uniqueRandomValue1, uniqueRandomValue2);

// Clear the global store when needed
GLOBAL_STORE.clear();
```

#### Excluding Specific Values

You can also provide an exclude list to prevent specific values from being considered during uniqueness checks.

```ts
import { uniqueFactory } from '@dpaskhin/unique';

const createUniqueRandom = uniqueFactory(Math.random, {
  // Prevents these values from being returned
  exclude: [0.5, 0.6],
});

// Outputs a unique random number, excluding 0.5 and 0.6
console.log(createUniqueRandom());
```

#### Stringifier for Complex Objects or other non-primitive types

The **stringifier** option allows you to handle complex objects by converting them into strings for uniqueness checks.

By default, JSON.stringify is used as the stringifier.

```ts
import { uniqueFactory } from '@dpaskhin/unique';
import { faker } from '@faker-js/faker';
import JsonMarshal from 'json-marshal';

const createUniqueUser = uniqueFactory(
  () => ({
    name: faker.person.firstName(),
    age: faker.number.int({ min: 18, max: 100 }),
  }),
  {
    // Here can be any function that takes the return value of the createUser function and converts it to a string.
    stringifier: JsonMarshal.stringify,
  }
);

const user1 = createUniqueUser();
const user2 = createUniqueUser();

// Outputs two unique users
console.log(user1, user2);
```

## API Reference

### uniqueFactory(fn, options)

Creates a function that ensures unique results based on the provided function fn.

#### Parameters

- fn - The function used to generate values.
- options - Optional. An object containing configuration options:
  - **store** (Set): A custom store to track unique values. Defaults to a new Set.
  - **maxRetries** (number): The maximum number of retries to generate a unique value before throwing an error.
    Defaults to 50.
  - **maxTime** (number): The maximum time (in milliseconds) to attempt generating a unique value before throwing an
    error. Defaults to 50ms.
  - **exclude** (Array<ReturnType<Fn>>): A list of values to exclude from the result set. These values will not be
    returned by the unique generator.
  - **stringifier** (function): A function to stringify a result before storing it. Defaults to JSON.stringify.

#### Returns

A function that generates unique values based on fn with the same signature.

#### Example

```ts
import { uniqueFactory } from '@dpaskhin/unique';
import { faker } from '@faker-js/faker';

const uniqueAddress = uniqueFactory(faker.location.city, { maxRetries: 5 });

// Outputs a unique city name
console.log(uniqueAddress());
```

### unique(fn, args, options)

Generates a unique value by running fn and ensuring uniqueness via either a provided or global store.

#### Parameters

- fn - The function used to generate values.
- args - Optional. An array of arguments to be passed to fn.
- options - Optional. An object containing configuration options:
  - **store** (Set): A custom store to track unique values. By default, the **GLOBAL_STORE** is used.
  - **maxRetries** (number): The maximum number of retries to generate a unique value before throwing an error.
    Defaults to 50.
  - **maxTime** (number): The maximum time (in milliseconds) to attempt generating a unique value before throwing an
    error. Defaults to 50ms.
  - **exclude** (Array<ReturnType<Fn>>): A list of values to exclude from the result set. These values will not be
    returned by the unique generator.
  - **stringifier** (function): A function to stringify a result before storing it. Defaults to JSON.stringify.

#### Returns

A unique value generated by fn.

#### Example

```ts
import { unique } from '@dpaskhin/unique';
import { faker } from '@faker-js/faker';

const uniqueEmail = unique(faker.internet.email, [
  {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  },
]);

// Outputs a unique email address
console.log(uniqueEmail);
```

### Best Practices

- Avoid using the global store when local uniqueness is required, as it may lead to unexpected results
  due to shared state.
- Configure Max Retries and Timeouts: Customize maxRetries and maxTime based on the expected uniqueness and complexity
  of generated values.

### License

**@dpaskhin/unique** is licensed under the MIT License.

### Contributing

Contributions are welcome! If you have ideas or improvements, feel free to submit a pull request.
