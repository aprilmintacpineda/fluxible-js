<!-- @format -->

# Fluxible-JS

:white_check_mark: Light weight at 697B, minified.

:white_check_mark: Has no dependencies.

<img src="https://1.bp.blogspot.com/_Jj--y7nzkjo/TFMSsUC6qkI/AAAAAAAAJjo/KZu6JhzpCjI/s1600/DSC_0702.JPG">

###### I do not own the image you see above.

---

We developers are like cats. We like to fit ourselves inside a box. Sometimes the boxes we use are so small that our movements are so limited. Libraries are like boxes, basically, using a library is like saying:

> I like this box, I'm gonna use this box, I'm going to fit myself inside it.

Though libraries were not intended to limit but rather to extend our abilities, as time passes by, more advanced libraries tend to tie us so much to the pattern that it uses consequently limiting our abilities while at the same time extending it.

The goal of this state management library is to allow you to initialize, update, and share states while giving back the control to the developer. Think of it like a substantially bigger box.

# Guides

## Run me

1. `git clone git@github.com:aprilmintacpineda/fluxible-js.git`
2. `npm i`
3. `npm run build`
4. `npm run playground`

## Test me

1. `npm run test`

## Install

`npm i -s fluxible-js`

## Flow

#### Initialize store

```js
import { initializeStore } from 'fluxible-js';

initializeStore({
  user: null,
  someOtherState: 'value',
  anotherState: {
    value: 'value'
  }
});
```

#### Subscribe to store updates

```js
import { addListener, getStore } from 'fluxible-js';

const unsubscribe = addListener(() => {
  console.log('store was updated!', getStore());
});

// along the way if you want to unsubscribe, you can call the returned function of addListener
unsubscribe();
```

The `getStore` function would return the updated store at the moment of call.

#### Update the store

```js
import { updateStore } from 'fluxible-js';

updateStore({
  someOtherState: 'updated value'
});
```

# Contributing

Discussions, questions, suggestions, bug reports, feature request, etc are all welcome. Just create an issue.
