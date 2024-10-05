# @dpaskhin/unique

**@dpaskhin/unique** is a TypeScript library that ensures the uniqueness of generated values. It wraps any function to
reject
duplicate values and generate new ones until a unique result is produced. Useful for cases where you need unique random
values or want to prevent repeated results.

## Installation

To install **@dpaskhin/unique**, run:

```shell
npm install --save-dev @dpaskhin/unique
```

## Features

- Ensures uniqueness of generated values by using a custom or global store.
- Configurable with options like maximum retries, timeouts, and exclusion of specific values.

## Usage

#### Basic Example

Here’s a quick example using **@dpaskhin/unique** with a custom function:

```ts
import { unique } from '@dpaskhin/unique';

const randomNumber = () => Math.floor(Math.random() * 100);

const uniqueRandomNumber = unique(randomNumber, [], { maxRetries: 5 });

console.log(uniqueRandomNumber); // Outputs a unique random number each time
```

#### Example with Faker.js

**@dpaskhin/unique** works well with libraries like Faker.js for generating unique random data.

```ts
import { unique } from '@dpaskhin/unique';
import { faker } from '@faker-js/faker';

const uniqueName = unique(faker.person.firstName, ['male'], { maxRetries: 10 });

console.log(uniqueName); // Outputs a unique first name
```

## API Reference

### uniqueFactory(fn, options)

Creates a function that ensures unique results based on the provided function fn.

#### Parameters

- fn - The function used to generate values.
- options - Optional. An object containing configuration options:
  - store (Set) - A custom store to track unique values. Defaults to a new Set.
  - maxRetries (number) - The maximum number of retries for unique values. Defaults to 50.
  - maxTime (number) - The maximum allowed time (in ms) for generating a unique value. Defaults to 50ms.
  - exclude (Array) - Values to exclude from the result set.

#### Returns

A function that generates unique values based on fn with the same signature.

#### Example

```ts
import { uniqueFactory } from '@dpaskhin/unique';
import { faker } from '@faker-js/faker';

const uniqueAddress = uniqueFactory(faker.location.city, { maxRetries: 5 });

console.log(uniqueAddress()); // Outputs a unique city name
```

### unique(fn, args, options)

Generates a unique value by running fn and ensuring uniqueness via either a provided or global store.

#### Parameters

- fn - The function used to generate values.
- args - Optional. An array of arguments to be passed to fn.
- options - Optional. An object containing configuration options:
  - store (Set) - A custom store to track unique values. Defaults to the global store.
  - maxRetries (number) - The maximum number of retries for unique values. Defaults to 50.
  - maxTime (number) - The maximum allowed time (in ms) for generating a unique value. Defaults to 50ms.
  - exclude (Array) - Values to exclude from the result set.

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

console.log(uniqueEmail); // Outputs a unique email address
```

### Best Practices

- Avoid Global Store for Local Uniqueness: If you need to ensure uniqueness only within a specific context or function,
  use a custom store to avoid unexpected results from shared global state.
- Configure Max Retries and Timeouts: Customize maxRetries and maxTime based on the expected uniqueness and complexity
  of generated values.

### License

**@dpaskhin/unique** is licensed under the MIT License.

### Contributing

Contributions are welcome! If you have ideas or improvements, feel free to submit a pull request.
